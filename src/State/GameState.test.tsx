import { render } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { GameStateProvider, GameStateContext, Status, GameState } from 'src/State/GameState';
import SudokuRules from 'src/Sudoku/SudokuRules';
import { createTestConsumer } from 'src/Test/TestContext';

let TestConsumer: React.FunctionComponent;
let readContext: () => GameState;

beforeEach(() => {
    [TestConsumer, readContext] = createTestConsumer(GameStateContext);
});

test('it passes rules by context', () => {
    const expectedRules = new SudokuRules();

    render(
        <GameStateProvider rulesFactory={() => expectedRules}>
            <TestConsumer></TestConsumer>
        </GameStateProvider>
    );

    const { rules } = readContext();
    expect(rules).toEqual(expectedRules);
});

test('it sets status to InvalidGrid if grid is empty after change', () => {
    const rules = mock<SudokuRules>();

    render(
        <GameStateProvider rulesFactory={() => rules}>
            <TestConsumer></TestConsumer>
        </GameStateProvider>
    );

    const { notifyContentsChange } = readContext();
    rules.isEmpty.mockReturnValue(true);

    act(() => {
        notifyContentsChange();
    });

    const { status } = readContext();

    expect(status).toEqual(Status.InvalidGrid);
});

test('it sets status to CanStart if not empty and is valid', () => {
    const rules = mock<SudokuRules>();

    render(
        <GameStateProvider rulesFactory={() => rules}>
            <TestConsumer></TestConsumer>
        </GameStateProvider>
    );

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
    const rules = mock<SudokuRules>();

    render(
        <GameStateProvider rulesFactory={() => rules}>
            <TestConsumer></TestConsumer>
        </GameStateProvider>
    );

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
    const rules = mock<SudokuRules>();

    render(
        <GameStateProvider rulesFactory={() => rules}>
            <TestConsumer></TestConsumer>
        </GameStateProvider>
    );

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
    const rules = mock<SudokuRules>();

    render(
        <GameStateProvider rulesFactory={() => rules}>
            <TestConsumer></TestConsumer>
        </GameStateProvider>
    );

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
