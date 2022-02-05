import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import produce from 'immer';
import { emptyGridContents, GridContents, GridContentsContext, GridContentsProvider, GridContentsReducer, GridContentsUpdate } from 'src/State/GridContents';
import { SelectedNumberContext, SelectedNumberProvider } from 'src/State/SelectedNumber';
import SudokuGrid from 'src/Sudoku/SudokuGrid';
import { createTestProvider } from 'src/Test/TestProvider';

let gridContents: GridContents;
let TestGridContentsProvider: typeof GridContentsProvider;
let gridContentsDispatchSpy: jest.MockedFunction<GridContentsReducer[1]>;
let setGridContents: (value: GridContents) => void;

let TestSelectedNumberProvider: typeof SelectedNumberProvider;
let setSelectedNumber: (value: number) => void;

beforeEach(() => {
    gridContents = emptyGridContents();

    [TestGridContentsProvider, gridContentsDispatchSpy, setGridContents] = createTestProvider(
        GridContentsContext,
        gridContents
    );

    [TestSelectedNumberProvider, /* */, setSelectedNumber] = createTestProvider(
        SelectedNumberContext,
        1
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
        draft[0].contents = 5;
        draft[1].contents = 8;
    }));

    expect(screen.getByText(5)).toBeInTheDocument();
    expect(screen.getByText(8)).toBeInTheDocument();
});

test('cell has -ShowingContents class when it has contents to show', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    expect(firstCell?.className).not.toContain('-ShowingContents');

    setGridContents(produce(gridContents, (draft) => {
        draft[0].contents = 5;
    }));

    expect(firstCell?.className).toContain('-ShowingContents');
});

test('dispatches toggleContents on double click', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    setSelectedNumber(4);

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
        draft[0].candidates[9] = true;
    }));

    expect(screen.getByText(1)).toBeInTheDocument();
    expect(screen.getByText(9)).toBeInTheDocument();
    expect(screen.queryByText(2)).not.toBeInTheDocument();
});

test('cell has -ShowingCandidates class when it has no contents to show', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    expect(firstCell?.className).toContain('-ShowingCandidates');

    setGridContents(produce(gridContents, (draft) => {
        draft[0].contents = 5;
    }));

    expect(firstCell?.className).not.toContain('-ShowingCandidates');
});

test('dispatches toggleCandidate on single click', () => {
    const firstCell = screen.getByTestId('sudoku-grid').firstElementChild;

    setSelectedNumber(7);

    firstCell && userEvent.click(firstCell);

    expect(gridContentsDispatchSpy).toHaveBeenCalledWith({
        action: 'toggleCandidate',
        cell: 0,
        candidate: 7
    } as GridContentsUpdate);
});
