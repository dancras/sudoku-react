import { createContext, useState } from 'react';
import { ReactState } from 'src/State/UtilityTypes';

export type SelectedNumberState = ReactState<number>;

export const SelectedNumberContext = createContext<SelectedNumberState>([0, () => void(0)]);

export function SelectedNumberProvider({ children }: React.PropsWithChildren<unknown>) {
    const selectedNumberState = useState(1);
    return (
        <SelectedNumberContext.Provider value={selectedNumberState}>
            {children}
        </SelectedNumberContext.Provider>
    );
}
