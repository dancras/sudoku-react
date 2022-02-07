import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import produce from 'immer';
import { emptyGridContents, GridContents, GridContentsContext, GridContentsProvider, GridContentsReducer, GridContentsUpdate } from 'src/State/GridContents';
import { SelectedNumberContext, SelectedNumberProvider, SelectedNumberState } from 'src/State/SelectedNumber';
import SudokuGrid from 'src/Sudoku/SudokuGrid';
import { createTestProvider } from 'src/Test/TestContext';

let gridContents: GridContents;
let TestGridContentsProvider: typeof GridContentsProvider;
let setGridContentsContext: (value: GridContentsReducer) => void;
let gridContentsDispatchSpy: jest.MockedFunction<GridContentsReducer[1]>;

let TestSelectedNumberProvider: typeof SelectedNumberProvider;
let setSelectedNumberContext: (value: SelectedNumberState) => void;

function setGridContents(value: GridContents) {
    setGridContentsContext([value, gridContentsDispatchSpy]);
}

beforeEach(() => {
    gridContents = emptyGridContents();
    gridContentsDispatchSpy = jest.fn();

    [TestGridContentsProvider, setGridContentsContext] = createTestProvider(
        GridContentsContext, [gridContents, gridContentsDispatchSpy]
    );

    [TestSelectedNumberProvider, setSelectedNumberContext] = createTestProvider(
        SelectedNumberContext, [1, jest.fn()]
    );

    render(
        <TestSelectedNumberProvider>
            <TestGridContentsProvider>
                <SudokuGrid />
            </TestGridContentsProvider>
        </TestSelectedNumberProvider>
    );
});

test('cells from GridContents context are rendered', () => {
    expect(screen.getByTestId('sudoku-grid').children).toHaveLength(81);
});

test('cell contents display when set', () => {
    setGridContents(produce(gridContents, (draft) => {
        draft[0].contents = [5, true];
        draft[1].contents = [8, true];
    }));

    expect(screen.getByText(5)).toBeInTheDocument();
    expect(screen.getByText(8)).toBeInTheDocument();
});

test('cell has -ShowingContents class when it has contents to show', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    expect(firstCell?.className).not.toContain('-ShowingContents');

    setGridContents(produce(gridContents, (draft) => {
        draft[0].contents = [5, true];
    }));

    expect(firstCell?.className).toContain('-ShowingContents');
});

test('dispatches toggleContents on double click', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    setSelectedNumberContext([4, jest.fn()]);

    firstCell && userEvent.dblClick(firstCell);

    expect(gridContentsDispatchSpy).toHaveBeenCalledWith({
        action: 'toggleContents',
        cell: 0,
        contents: 4
    } as GridContentsUpdate);
});

test('cell candidates display when set', () => {
    setGridContents(produce(gridContents, (draft) => {
        draft[0].candidates[1] = true;
        draft[0].candidates[9] = false;
    }));

    expect(screen.getByText(1)).toBeInTheDocument();
    expect(screen.getByText(9)).toBeInTheDocument();
    expect(screen.queryByText(2)).not.toBeInTheDocument();
});

test('cell has -ShowingCandidates class when it has no contents to show', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    expect(firstCell?.className).toContain('-ShowingCandidates');

    setGridContents(produce(gridContents, (draft) => {
        draft[0].contents = [5, true];
    }));

    expect(firstCell?.className).not.toContain('-ShowingCandidates');
});

test('cell has -Valid or -Invalid class depending on state', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    expect(firstCell?.className).not.toContain('-Valid');
    expect(firstCell?.className).not.toContain('-Invalid');

    setGridContents(produce(gridContents, (draft) => {
        draft[0].contents = [5, true];
    }));

    expect(firstCell?.className).toContain('-Valid');
    expect(firstCell?.className).not.toContain('-Invalid');

    setGridContents(produce(gridContents, (draft) => {
        draft[0].contents = [5, false];
    }));

    expect(firstCell?.className).toContain('-Invalid');
    expect(firstCell?.className).not.toContain('-Valid');
});

test('candidate has -Valid or -Invalid class depending on state', () => {

    setGridContents(produce(gridContents, (draft) => {
        draft[0].candidates[1] = true;
    }));

    const candidateElement = screen.getByText(1);

    expect(candidateElement?.className).toContain('-Valid');
    expect(candidateElement?.className).not.toContain('-Invalid');

    setGridContents(produce(gridContents, (draft) => {
        draft[0].candidates[1] = false;
    }));

    expect(candidateElement?.className).toContain('-Invalid');
    expect(candidateElement?.className).not.toContain('-Valid');

    setGridContents(produce(gridContents, (draft) => {
        draft[0].candidates[1] = null;
    }));

    expect(candidateElement?.className).not.toContain('-Invalid');
    expect(candidateElement?.className).not.toContain('-Valid');
});

test('dispatches toggleCandidate on single click', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    setSelectedNumberContext([7, jest.fn()]);

    firstCell && userEvent.click(firstCell);

    expect(gridContentsDispatchSpy).toHaveBeenCalledWith({
        action: 'toggleCandidate',
        cell: 0,
        candidate: 7
    } as GridContentsUpdate);
});
