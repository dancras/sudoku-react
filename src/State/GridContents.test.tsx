import { act, render } from '@testing-library/react';
import { MockProxy, mock } from 'jest-mock-extended';
import React from 'react';
import { emptyGridContents, updateGridContents, GridContentsProvider, GridContentsContext, GridContentsReducer } from 'src/State/GridContents';
import SudokuRules from 'src/Sudoku/SudokuRules';
import { GameState, GameStateContext, Status } from 'src/State/GameState';
import { createTestConsumer, createTestProvider } from 'src/Test/TestContext';

describe('updateGridContents', () => {
    let testRules: MockProxy<SudokuRules>;

    beforeEach(() => {
        testRules = mock<SudokuRules>();

        // Make every answer valid by default
        testRules.setContents.mockReturnValue([]);
    });

    test('action toggleContents sets cell contents if cell is empty or different', () => {
        const initialState = emptyGridContents();
        const secondState = updateGridContents(testRules, initialState, {
            action: 'toggleContents',
            cell: 0,
            contents: 5
        });

        expect(secondState[0].contents?.[0]).toEqual(5);

        const thirdState = updateGridContents(testRules, secondState, {
            action: 'toggleContents',
            cell: 0,
            contents: 6
        });

        expect(thirdState[0].contents?.[0]).toEqual(6);
    });

    test('action toggleContents clears cell contents if current value matches', () => {
        const initialState = emptyGridContents();
        const secondState = updateGridContents(testRules, initialState, {
            action: 'toggleContents',
            cell: 0,
            contents: 5
        });

        const thirdState = updateGridContents(testRules, secondState, {
            action: 'toggleContents',
            cell: 0,
            contents: 5
        });

        expect(thirdState[0].contents).toEqual(null);
    });

    test('action toggleCandidate toggles the candidate flag for the given cell and candidate number', () => {
        const initialState = emptyGridContents();
        testRules.isValidCandidate.mockReturnValue(true);

        const secondState = updateGridContents(testRules, initialState, {
            action: 'toggleCandidate',
            cell: 0,
            candidate: 5
        });

        expect(secondState[0].candidates[5]).toEqual(true);

        const thirdState = updateGridContents(testRules, secondState, {
            action: 'toggleCandidate',
            cell: 0,
            candidate: 5
        });

        expect(thirdState[0].candidates[5]).toEqual(null);
    });

    test('action toggleContents marks contents as invalid according to rules', () => {
        const initialState = emptyGridContents();
        // Valid -> Invalid
        initialState[0].contents = [2, true];
        // Valid -> Valid
        initialState[1].contents = [3, true];
        // Invalid -> Valid
        initialState[2].contents = [4, false];
        // Invalid -> Invalid
        initialState[3].contents = [5, false];

        testRules.setContents.mockReturnValue([0, 1, 2, 3]);
        testRules.isValidContents.calledWith(0).mockReturnValue(false);
        testRules.isValidContents.calledWith(1).mockReturnValue(true);
        testRules.isValidContents.calledWith(2).mockReturnValue(true);
        testRules.isValidContents.calledWith(3).mockReturnValue(false);

        const secondState = updateGridContents(testRules, initialState, {
            action: 'toggleContents',
            cell: 20,
            contents: 5
        });

        expect(testRules.setContents).toHaveBeenCalledWith(20, 5);

        expect(secondState[0].contents).toEqual([2, false]);
        expect(secondState[1].contents).toEqual([3, true]);
        expect(secondState[2].contents).toEqual([4, true]);
        expect(secondState[3].contents).toEqual([5, false]);
    });

    test('action toggleContents marks candidates as invalid according to rules', () => {
        const initialState = emptyGridContents();
        // Valid -> Invalid
        initialState[0].candidates[1] = true;
        // Valid -> Valid
        initialState[0].candidates[2] = true;
        // Invalid -> Invalid
        initialState[0].candidates[3] = false;
        // Invalid -> Value
        initialState[0].candidates[4] = false;

        testRules.setContents.mockReturnValue([0]);
        testRules.isValidCandidate.calledWith(0, 1).mockReturnValue(false);
        testRules.isValidCandidate.calledWith(0, 2).mockReturnValue(true);
        testRules.isValidCandidate.calledWith(0, 3).mockReturnValue(false);
        testRules.isValidCandidate.calledWith(0, 4).mockReturnValue(true);

        const secondState = updateGridContents(testRules, initialState, {
            action: 'toggleContents',
            cell: 20,
            contents: 5
        });

        expect(secondState[0].candidates[1]).toEqual(false);
        expect(secondState[0].candidates[2]).toEqual(true);
        expect(secondState[0].candidates[3]).toEqual(false);
        expect(secondState[0].candidates[4]).toEqual(true);
    });

    test('action toggleCandidate marks the new candidate as valid according to rules', () => {
        const initialState = emptyGridContents();

        testRules.isValidCandidate.calledWith(20, 5).mockReturnValue(true);
        testRules.isValidCandidate.calledWith(21, 6).mockReturnValue(false);

        const secondState = updateGridContents(testRules, initialState, {
            action: 'toggleCandidate',
            cell: 20,
            candidate: 5
        });

        const thirdState = updateGridContents(testRules, secondState, {
            action: 'toggleCandidate',
            cell: 21,
            candidate: 6
        });

        expect(thirdState[20].candidates[5]).toEqual(true);
        expect(thirdState[21].candidates[6]).toEqual(false);
    });
});

describe('GridContentsProvider', () => {

    let TestConsumer: React.FunctionComponent;
    let readContext: () => GridContentsReducer;

    let TestGameStateProvider: React.FunctionComponent;
    let setGameStateContext: (value: GameState) => void;

    let rules: MockProxy<SudokuRules>;
    let notifyContentsChange: jest.MockedFunction<() => void>;

    function createGameState(status: Status) {
        return {
            status,
            rules,
            startGame: () => void(0),
            notifyContentsChange
        };
    }

    beforeEach(() => {
        [TestConsumer, readContext] = createTestConsumer(GridContentsContext);

        rules = mock<SudokuRules>();
        rules.setContents.mockReturnValue([]);
        notifyContentsChange = jest.fn();

        [TestGameStateProvider, setGameStateContext] = createTestProvider(GameStateContext, createGameState(Status.InvalidGrid));

        render(
            <TestGameStateProvider>
                <GridContentsProvider>
                    <TestConsumer></TestConsumer>
                </GridContentsProvider>
            </TestGameStateProvider>
        );
    });

    test('the grid contents and a dispatch fn is shared via context', function () {
        const [,dispatch] = readContext();

        act(() => {
            dispatch({
                action: 'toggleContents',
                cell: 0,
                contents: 9
            });
        });

        const [gridContents] = readContext();

        expect(gridContents[0].contents?.[0]).toEqual(9);
    });

    test('the grid contents are locked when GameState status is Started', function () {
        const [,dispatch] = readContext();

        act(() => {
            dispatch({
                action: 'toggleContents',
                cell: 0,
                contents: 9
            });

            dispatch({
                action: 'toggleContents',
                cell: 2,
                contents: 4
            });

            setGameStateContext(createGameState(Status.Started));
        });

        const [gridContents] = readContext();

        expect(gridContents[0].isLocked).toEqual(true);
        expect(gridContents[2].isLocked).toEqual(true);
    });

    test('GameState is notified when the grid contents change', function () {
        const [,dispatch] = readContext();

        act(() => {
            dispatch({
                action: 'toggleContents',
                cell: 0,
                contents: 9
            });
        });

        expect(notifyContentsChange).toHaveBeenCalled();
    });
});
