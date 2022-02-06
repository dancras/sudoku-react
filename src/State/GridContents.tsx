import { createContext, useMemo, useReducer } from 'react';
import produce from 'immer';
import { ReactReducer } from 'src/State/UtilityTypes';
import SudokuRules from 'src/Sudoku/SudokuRules';

export type GridContentsReducer = ReactReducer<GridContents, GridContentsUpdate>;

export const GridContentsContext = createContext<GridContentsReducer>([emptyGridContents(), () => void(0)]);

export type Answer = [number, boolean];

export type GridContentsCell = {
    contents: Answer | null,
    candidates: Record<number, boolean | null>
}

export type GridContents = GridContentsCell[];

export type GridContentsUpdate = {
    action: 'toggleContents',
    cell: number,
    contents: number
} | {
    action: 'toggleCandidate',
    cell: number,
    candidate: number
};

function emptyGridContentsCell(): GridContentsCell {
    return {
        contents: null,
        candidates: {
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: null,
            7: null,
            8: null,
            9: null
        }
    };
}

export function emptyGridContents(): GridContents {
    return Array.from({ length: 81 }).map(emptyGridContentsCell);
}

export function updateGridContents(rules: SudokuRules, currentState: GridContents, update: GridContentsUpdate): GridContents {
    return produce(currentState, draft => {
        const cell = draft[update.cell];

        if (update.action === 'toggleContents') {
            cell.contents = cell.contents?.[0] === update.contents ? null : [update.contents, true];

            const affectedCells = rules.setContents(update.cell, cell.contents ? cell.contents[0] : null);

            affectedCells.forEach(i => {
                const contents = draft[i].contents;
                if (contents !== null) {
                    contents[1] = rules.isValidContents(i);
                }

                for (const key in draft[i].candidates) {
                    const j = parseInt(key);
                    if (draft[i].candidates[j] !== null) {
                        draft[i].candidates[j] = rules.isValidCandidate(i, j);
                    }
                }
            });

        } else if (update.action === 'toggleCandidate') {

            cell.candidates[update.candidate] = cell.candidates[update.candidate] === null ?
                rules.isValidCandidate(update.cell, update.candidate) :
                null;
        }
    });
}

export function GridContentsProvider({ children }: React.PropsWithChildren<unknown>) {
    const rules = useMemo(() => new SudokuRules(), []);
    const gridContentsReducer = useReducer((state: GridContents, update: GridContentsUpdate) => updateGridContents(rules, state, update), emptyGridContents());
    return (
        <GridContentsContext.Provider value={gridContentsReducer}>
            {children}
        </GridContentsContext.Provider>
    );
}
