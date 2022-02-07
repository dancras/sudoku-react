import { render } from '@testing-library/react';
import { mock, MockProxy } from 'jest-mock-extended';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { GameStateProvider, GameStateContext, Status, GameState } from 'src/State/GameState';
import SudokuRules from 'src/Sudoku/SudokuRules';
import { createTestConsumer } from 'src/Test/TestContext';

let TestConsumer: React.FunctionComponent;
let readContext: () => GameState;
let rules: MockProxy<SudokuRules>;

beforeEach(() => {
    [TestConsumer, readContext] = createTestConsumer(GameStateContext);
    rules = mock<SudokuRules>();

    render(
        <GameStateProvider rulesFactory={() => rules}>
            <TestConsumer></TestConsumer>
        </GameStateProvider>
    );
});

test('it passes rules by context', () => {
    expect(readContext().rules).toEqual(rules);
});

test('it sets status to InvalidGrid if grid is empty after change', () => {
    const { notifyContentsChange } = readContext();
    rules.isEmpty.mockReturnValue(true);

    act(() => {
        notifyContentsChange();
    });

    const { status } = readContext();

    expect(status).toEqual(Status.InvalidGrid);
});

test('it sets status to CanStart if not empty and is valid', () => {
    const { notifyContentsChange } = readContext();
    rules.isEmpty.mockReturnValue(false);
    rules.isValid.mockReturnValue(true);

    act(() => {
        notifyContentsChange();
    });

    const { status } = readContext();

    expect(status).toEqual(Status.CanStart);
});

test('it reverts back to InvalidGrid if no longer valid on next change', () => {
    const { notifyContentsChange } = readContext();
    rules.isEmpty.mockReturnValue(false);
    rules.isValid.mockReturnValue(true);

    act(() => {
        notifyContentsChange();
    });

    rules.isValid.mockReturnValue(false);

    act(() => {
        notifyContentsChange();
    });

    const { status } = readContext();

    expect(status).toEqual(Status.InvalidGrid);
});

test('it sets status to Complete if rules say its complete', () => {
    const { notifyContentsChange } = readContext();
    rules.isValid.mockReturnValue(true);
    rules.isComplete.mockReturnValue(true);

    act(() => {
        notifyContentsChange();
    });

    const { status } = readContext();

    expect(status).toEqual(Status.Complete);
});

test('it sets status to Started and locks grid contents if the start function is called and status is CanStart', () => {
    const { notifyContentsChange, startGame } = readContext();
    rules.isValid.mockReturnValue(true);

    act(() => {
        notifyContentsChange();
        startGame();
    });

    expect(readContext().status).toEqual(Status.Started);

    // it does not return to CanStart state after Started is reached
    act(() => {
        notifyContentsChange();
    });

    expect(readContext().status).toEqual(Status.Started);

    // it does not return to InvalidGrid state after Started is reached
    rules.isValid.mockReturnValue(false);

    act(() => {
        notifyContentsChange();
    });

    expect(readContext().status).toEqual(Status.Started);
});
