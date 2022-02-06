import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import React, { ReactNode, useContext } from 'react';
import { act } from 'react-dom/test-utils';
import { GameStateProvider, GameStateContext, Status } from 'src/State/GameState';
import SudokuRules from 'src/Sudoku/SudokuRules';

function TestConsumer<T>({ Context, children }: { Context: React.Context<T>, children: (value: T) => ReactNode }) {
    return <>{ children(useContext(Context)) }</>;
}

test('it passes rules by context', () => {
    const expectedRules = new SudokuRules();
    const valueSpy = jest.fn();
    valueSpy.mockReturnValue(<></>);

    render(
        <GameStateProvider rulesFactory={() => expectedRules}>
            <TestConsumer Context={GameStateContext}>
                {({ rules }) => valueSpy(rules) }
            </TestConsumer>
        </GameStateProvider>
    );

    expect(valueSpy).toHaveBeenCalledWith(expectedRules);
});

test('it sets status to invalid if grid is empty after change', () => {
    const rules = mock<SudokuRules>();
    const factorySpy = jest.fn();
    factorySpy.mockReturnValue(rules);

    render(
        <GameStateProvider rulesFactory={factorySpy}>
            <TestConsumer Context={GameStateContext}>
                {({ status }) => status === Status.InvalidGrid ? <>expected</> : <></> }
            </TestConsumer>
        </GameStateProvider>
    );

    const onContentsChange = factorySpy.mock.calls[0][0];
    rules.isEmpty.mockReturnValue(true);

    act(() => {
        onContentsChange();
    });

    expect(screen.getByText('expected')).toBeInTheDocument();
});

test('it sets status to CanStart if not empty and is valid', () => {
    const rules = mock<SudokuRules>();
    const factorySpy = jest.fn();
    factorySpy.mockReturnValue(rules);

    render(
        <GameStateProvider rulesFactory={factorySpy}>
            <TestConsumer Context={GameStateContext}>
                {({ status }) => status === Status.CanStart ? <>expected</> : <></> }
            </TestConsumer>
        </GameStateProvider>
    );

    const onContentsChange = factorySpy.mock.calls[0][0];
    rules.isEmpty.mockReturnValue(false);
    rules.isValid.mockReturnValue(true);

    act(() => {
        onContentsChange();
    });

    expect(screen.getByText('expected')).toBeInTheDocument();
});

test('it sets status to Complete if rules say its complete', () => {
    const rules = mock<SudokuRules>();
    const factorySpy = jest.fn();
    factorySpy.mockReturnValue(rules);

    render(
        <GameStateProvider rulesFactory={factorySpy}>
            <TestConsumer Context={GameStateContext}>
                {({ status }) => status === Status.Complete ? <>expected</> : <></> }
            </TestConsumer>
        </GameStateProvider>
    );

    const onContentsChange = factorySpy.mock.calls[0][0];
    rules.isValid.mockReturnValue(true);
    rules.isComplete.mockReturnValue(true);

    act(() => {
        onContentsChange();
    });

    expect(screen.getByText('expected')).toBeInTheDocument();
});

test('it sets status to Started and locks grid contents if the start function is called and status is CanStart', () => {
    const rules = mock<SudokuRules>();
    const factorySpy = jest.fn();
    factorySpy.mockReturnValue(rules);

    render(
        <GameStateProvider rulesFactory={factorySpy}>
            <TestConsumer Context={GameStateContext}>
                {({ status, startGame }) =>
                    status === Status.Started ? <>expected</> : <div onClick={startGame}>start</div>
                }
            </TestConsumer>
        </GameStateProvider>
    );

    const onContentsChange = factorySpy.mock.calls[0][0];
    rules.isValid.mockReturnValue(true);

    act(() => {
        onContentsChange();
    });

    userEvent.click(screen.getByText('start'));

    // it does not return to CanStart state after Started is reached
    act(() => {
        onContentsChange();
    });

    expect(screen.getByText('expected')).toBeInTheDocument();
});
