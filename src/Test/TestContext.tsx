import React, { useContext, useState } from 'react';
import { act } from '@testing-library/react';

export function createTestProvider<T>(Context: React.Context<T>, defaultValue?: T) {
    let setContextValueReference: (value: T) => void;

    function setContextValue(value: T) {
        act(() => {
            setContextValueReference(value);
        });
    }

    function TestProvider({ children }: React.PropsWithChildren<unknown>) {
        const [value, setValue] = useState<T | undefined>(defaultValue);
        setContextValueReference = setValue;
        return !value ? <></> : (
            <Context.Provider value={value}>
                { children }
            </Context.Provider>
        );
    }

    return [TestProvider, setContextValue] as [typeof TestProvider, typeof setContextValue];
}

export function createTestConsumer<T>(Context: React.Context<T>) {
    let contextValue: T;

    function readContext(): T {
        return contextValue;
    }

    function TestConsumer() {
        const value = useContext(Context);
        contextValue = value;
        return <></>;
    }

    return [TestConsumer, readContext] as [typeof TestConsumer, typeof readContext];
}
