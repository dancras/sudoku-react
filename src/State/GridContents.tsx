import { createContext, useReducer } from 'react';
import produce from 'immer';
import { ReactReducer } from 'src/State/UtilityTypes';

export type GridContentsReducer = ReactReducer<GridContents, GridContentsUpdate>;

export const GridContentsContext = createContext<GridContentsReducer>([emptyGridContents(), () => void(0)]);

export type GridContentsCell = {
    contents: number | null,
    candidates: Record<number, boolean>
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
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
            6: false,
            7: false,
            8: false,
            9: false
        }
    };
}

export function emptyGridContents(): GridContents {
    return Array.from({ length: 81 }).map(emptyGridContentsCell);
}

export function updateGridContents(currentState: GridContents, update: GridContentsUpdate): GridContents {
    return produce(currentState, draft => {
        const cell = draft[update.cell];

        if (update.action === 'toggleContents') {
            cell.contents = cell.contents === update.contents ? null : update.contents;
        } else if (update.action === 'toggleCandidate') {
            cell.candidates[update.candidate] = !cell.candidates[update.candidate];
        }
    });
}

export function GridContentsProvider({ children }: React.PropsWithChildren<unknown>) {
    const gridContentsReducer = useReducer(updateGridContents, emptyGridContents());
    return (
        <GridContentsContext.Provider value={gridContentsReducer}>
            {children}
        </GridContentsContext.Provider>
    );
}
