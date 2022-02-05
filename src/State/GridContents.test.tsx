import { act, render, screen } from '@testing-library/react';
import { useContext, memo } from 'react';
import { emptyGridContents, updateGridContents, GridContentsProvider, GridContentsContext, GridContentsReducer, GridContentsCell } from 'src/State/GridContents';

describe('updateGridContents', () => {
    test('action toggleContents sets cell contents if cell is empty or different', () => {
        const initialState = emptyGridContents();
        const secondState = updateGridContents(initialState, {
            action: 'toggleContents',
            cell: 0,
            contents: 5
        });

        expect(secondState[0].contents).toEqual(5);

        const thirdState = updateGridContents(secondState, {
            action: 'toggleContents',
            cell: 0,
            contents: 6
        });

        expect(thirdState[0].contents).toEqual(6);
    });

    test('action toggleContents clears cell contents if current value matches', () => {
        const initialState = emptyGridContents();
        const secondState = updateGridContents(initialState, {
            action: 'toggleContents',
            cell: 0,
            contents: 5
        });

        const thirdState = updateGridContents(secondState, {
            action: 'toggleContents',
            cell: 0,
            contents: 5
        });

        expect(thirdState[0].contents).toEqual(null);
    });

    test('action toggleCandidate toggles the candidate flag for the given cell and candidate number', () => {
        const initialState = emptyGridContents();
        const secondState = updateGridContents(initialState, {
            action: 'toggleCandidate',
            cell: 0,
            candidate: 5
        });

        expect(secondState[0].candidates[5]).toEqual(true);

        const thirdState = updateGridContents(secondState, {
            action: 'toggleCandidate',
            cell: 0,
            candidate: 5
        });

        expect(thirdState[0].candidates[5]).toEqual(false);
    });
});

test('the grid contents and a dispatch fn is shared via context', function () {
    let dispatchGridContentsUpdate: GridContentsReducer[1] = () => undefined as void;

    function ExampleConsumer() {
        const [gridContents, dispatch] = useContext(GridContentsContext);
        dispatchGridContentsUpdate = dispatch;
        return <div>{gridContents[0].contents}</div>;
    }

    render(
        <GridContentsProvider>
            <ExampleConsumer />
        </GridContentsProvider>
    );

    act(() => {
        dispatchGridContentsUpdate({
            action: 'toggleContents',
            cell: 0,
            contents: 9
        });
    });

    expect(screen.getByText('9')).toBeInTheDocument();
});

// This really only tests how immer and React.memo play together
test('consumers of individual cell data do not re-render for unrelated changes', function () {
    let dispatchGridContentsUpdate: GridContentsReducer[1] = () => undefined as void;
    const renderSpy = jest.fn();

    function CellConsumer({ cell }: { cell: GridContentsCell }) {
        renderSpy(cell.contents);
        return <div>{cell.contents}</div>;
    }

    const MemoizedCellConsumer = memo(CellConsumer);

    function ExampleConsumer() {
        const [gridContents, dispatch] = useContext(GridContentsContext);
        dispatchGridContentsUpdate = dispatch;
        return (
            <>
                <MemoizedCellConsumer cell={gridContents[0]} />
                <MemoizedCellConsumer cell={gridContents[1]} />
            </>
        );
    }

    render(
        <GridContentsProvider>
            <ExampleConsumer />
        </GridContentsProvider>
    );

    renderSpy.mockClear();

    act(() => {
        dispatchGridContentsUpdate({
            action: 'toggleContents',
            cell: 0,
            contents: 9
        });
    });

    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy).toHaveBeenCalledWith(9);
});
