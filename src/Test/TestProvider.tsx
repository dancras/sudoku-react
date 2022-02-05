import React, { useCallback, useState } from 'react';
import { act } from '@testing-library/react';
import { ReactReducer } from 'src/State/UtilityTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTestProvider<R extends ReactReducer<any, any>>(Context: React.Context<R>, initialValue: R[0]): [typeof TestProvider, jest.MockedFunction<R[1]>, (v: R[0]) => void] {
    const updateSpy = jest.fn();
    let setStateValue: React.Dispatch<React.SetStateAction<R[0]>> = () => void(0);

    function setStateValueInActBlock(value: R[0]) {
        act(() => {
            setStateValue(value);
        });
    }

    function TestProvider({ children }: React.PropsWithChildren<unknown>) {
        const [value, setValue] = useState(initialValue);
        setStateValue = setValue;

        const interceptUpdate: R[1] = useCallback((update) => {
            updateSpy(update);
        }, []);

        return (
            <Context.Provider value={[value, interceptUpdate] as R}>
                { children }
            </Context.Provider>
        );
    }

    return [TestProvider, updateSpy, setStateValueInActBlock];
}
