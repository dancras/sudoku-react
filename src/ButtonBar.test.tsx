import { render, screen } from '@testing-library/react';
import { createTestProvider } from 'src/Test/TestContext';
import { GameStateContext, Status } from 'src/State/GameState';
import SudokuRules from 'src/Sudoku/SudokuRules';
import ButtonBar from 'src/ButtonBar';
import userEvent from '@testing-library/user-event';

describe('Start Button', () => {

    it('it is disabled when status is InvalidGrid', () => {

        const [TestGameStateProvider] = createTestProvider(GameStateContext, {
            status: Status.InvalidGrid,
            rules: new SudokuRules(),
            startGame: jest.fn(),
            notifyContentsChange: jest.fn()
        });

        render(
            <TestGameStateProvider>
                <ButtonBar></ButtonBar>
            </TestGameStateProvider>
        );

        expect(screen.getByText('Start')).toBeDisabled();

    });

    it('it calls startGame when clicked and status is CanStart', () => {
        const startGameSpy = jest.fn();

        const [TestGameStateProvider] = createTestProvider(GameStateContext, {
            status: Status.CanStart,
            rules: new SudokuRules(),
            startGame: startGameSpy,
            notifyContentsChange: jest.fn()
        });

        render(
            <TestGameStateProvider>
                <ButtonBar></ButtonBar>
            </TestGameStateProvider>
        );

        userEvent.click(screen.getByText('Start'));

        expect(startGameSpy).toHaveBeenCalled();
    });

    it('it is not present when status is Started or Complete', () => {
        const [TestGameStateProvider, setContextValue] = createTestProvider(GameStateContext, {
            status: Status.Started,
            rules: new SudokuRules(),
            startGame: jest.fn(),
            notifyContentsChange: jest.fn()
        });

        render(
            <TestGameStateProvider>
                <ButtonBar></ButtonBar>
            </TestGameStateProvider>
        );

        expect(screen.queryByText('Start')).not.toBeInTheDocument();

        setContextValue({
            status: Status.Complete,
            rules: new SudokuRules(),
            startGame: jest.fn(),
            notifyContentsChange: jest.fn()
        });

        expect(screen.queryByText('Start')).not.toBeInTheDocument();
    });

});
