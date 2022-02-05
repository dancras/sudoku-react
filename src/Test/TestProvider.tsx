import React, { useCallback, useState } from 'react';
import { act } from '@testing-library/react';
import { ReactReducer } from 'src/State/UtilityTypes';

export function createTestProvider<R extends ReactReducer<any, any>>(Context: React.Context<R>, initialValue: R[0]): [typeof TestProvider, jest.MockedFunction<R[1]>, (v: R[0]) => void] {
    const updateSpy = jest.fn();
    let setter: React.Dispatch<React.SetStateAction<R[0]>> = () => void(0);

    function setStateValue(value: R[0]) {
        act(() => {
            setter(value);
        });
    }

    function TestProvider({ children }: React.PropsWithChildren<unknown>) {
        const [value, setValue] = useState(initialValue);
        setter = setValue;

        const interceptUpdate: R[1] = useCallback((update) => {
            updateSpy(update);
        }, []);

        return (
            <Context.Provider value={[value, interceptUpdate] as R}>
                { children }
            </Context.Provider>
        );
    }

    return [TestProvider, updateSpy, setStateValue];
}
