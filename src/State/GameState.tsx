import { createContext, useCallback, useMemo, useReducer } from 'react';
import SudokuRules from 'src/Sudoku/SudokuRules';

export enum Status {
    InvalidGrid,
    CanStart,
    Started,
    Complete
}

export type GameState = {
    status: Status,
    rules: SudokuRules,
    startGame: () => void,
    notifyContentsChange: () => void
};

export const GameStateContext = createContext<GameState>({
    status: Status.InvalidGrid,
    rules: new SudokuRules(),
    startGame: () => void(0),
    notifyContentsChange: () => void(0)
});

export function GameStateProvider({ children, rulesFactory }: React.PropsWithChildren<{
    rulesFactory: () => SudokuRules
}>) {
    const [status, setStatus] = useReducer((currentStatus: Status, nextStatus: Status) => {

        if (nextStatus === Status.Started && currentStatus === Status.CanStart) {
            return nextStatus;
        }

        if ((nextStatus === Status.InvalidGrid || nextStatus === Status.CanStart) && currentStatus === Status.Started) {
            return currentStatus;
        }

        return nextStatus;
    }, Status.InvalidGrid);

    const rules = useMemo(() => rulesFactory(), []);

    const notifyContentsChange = useCallback(() => {
        if (rules.isEmpty()) {
            setStatus(Status.InvalidGrid);
        } else if (rules.isComplete()) {
            setStatus(Status.Complete);
        } else if (rules.isValid()) {
            setStatus(Status.CanStart);
        } else {
            setStatus(Status.InvalidGrid);
        }
    }, []);

    const startGame = useCallback(() => {
        setStatus(Status.Started);
    }, []);

    return (
        <GameStateContext.Provider value={{ status, rules, startGame, notifyContentsChange }}>
            {children}
        </GameStateContext.Provider>
    );
}



