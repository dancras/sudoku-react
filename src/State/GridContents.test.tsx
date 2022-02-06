import { act, render, screen } from '@testing-library/react';
import { MockProxy, mock } from 'jest-mock-extended';
import { useContext, memo } from 'react';
import { emptyGridContents, updateGridContents, GridContentsProvider, GridContentsContext, GridContentsReducer, GridContentsCell } from 'src/State/GridContents';
import SudokuRules from 'src/Sudoku/SudokuRules';

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

test('the grid contents and a dispatch fn is shared via context', function () {
    let dispatchGridContentsUpdate: GridContentsReducer[1] = () => undefined as void;

    function ExampleConsumer() {
        const [gridContents, dispatch] = useContext(GridContentsContext);
        dispatchGridContentsUpdate = dispatch;
        return <div>{gridContents[0].contents?.[0]}</div>;
    }

    render(
        <GridContentsProvider>
            <ExampleConsumer />
        </GridContentsProvider>
    );

    act(() => {
        dispatchGridContentsUpdate({
            action: 'toggleContents',
            cell: 0,
            contents: 9
        });
    });

    expect(screen.getByText('9')).toBeInTheDocument();
});

// This really only tests how immer and React.memo play together
test('consumers of individual cell data do not re-render for unrelated changes', function () {
    let dispatchGridContentsUpdate: GridContentsReducer[1] = () => undefined as void;
    const renderSpy = jest.fn();

    function CellConsumer({ cell }: { cell: GridContentsCell }) {
        renderSpy(cell.contents?.[0]);
        return <div>{cell.contents?.[0]}</div>;
    }

    const MemoizedCellConsumer = memo(CellConsumer);

    function ExampleConsumer() {
        const [gridContents, dispatch] = useContext(GridContentsContext);
        dispatchGridContentsUpdate = dispatch;
        return (
            <>
                <MemoizedCellConsumer cell={gridContents[0]} />
                <MemoizedCellConsumer cell={gridContents[1]} />
            </>
        );
    }

    render(
        <GridContentsProvider>
            <ExampleConsumer />
        </GridContentsProvider>
    );

    renderSpy.mockClear();

    act(() => {
        dispatchGridContentsUpdate({
            action: 'toggleContents',
            cell: 0,
            contents: 9
        });
    });

    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy).toHaveBeenCalledWith(9);
});
