export type ReactReducer<T, Q> = [T, React.Dispatch<Q>];
export type ReactState<T> = [T, React.Dispatch<React.SetStateAction<T>>];
