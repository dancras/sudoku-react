import 'src/Sudoku/SudokuGrid.css';
import { memo, useContext, useRef } from 'react';
import { GridContentsCell, GridContentsContext, GridContentsReducer } from 'src/State/GridContents';
import { SelectedNumberContext } from 'src/State/SelectedNumber';

function Cell({ cell, i, dispatch, selectedNumberRef }: { cell: GridContentsCell, i: number, dispatch: GridContentsReducer[1], selectedNumberRef: React.MutableRefObject<number> }) {

    function toggleContents() {
        dispatch({
            action: 'toggleContents',
            cell: i,
            contents: selectedNumberRef.current
        });
    }

    function toggleCandidate() {
        dispatch({
            action: 'toggleCandidate',
            cell: i,
            candidate: selectedNumberRef.current
        });
    }

    const [contents, isValid] = cell.contents === null ? [null, true] : cell.contents;

    return (
        <div className={`--Cell ${contents ? `-ShowingContents ${isValid ? '-Valid' : '-Invalid'}` : '-ShowingCandidates'}`}
             onClick={toggleCandidate}
             onDoubleClick={toggleContents}
        >
            <div className="--Candidates">
                {Object.entries(cell.candidates).map(([i, isValid]) =>
                    <div key={i} className={`--Candidate ${ isValid !== null ? (isValid ? '-Valid' : '-Invalid') : '' }`}>{ isValid !== null ? i : ' ' }</div>
                )}
            </div>
            <div className="--Contents">
                { contents }
            </div>
        </div>
    );
}

const MemoizedCell = memo(Cell);

export default function SudokuGrid() {
    const [gridContents, dispatchGridContentsUpdate] = useContext(GridContentsContext);
    const [selectedNumber] = useContext(SelectedNumberContext);
    const selectedNumberRef = useRef(selectedNumber);
    selectedNumberRef.current = selectedNumber;

    return (
        <div className="SudokuGrid" data-testid="sudoku-grid">
            {gridContents.map((cell, i) =>
                <MemoizedCell key={i} cell={cell} i={i} dispatch={dispatchGridContentsUpdate} selectedNumberRef={selectedNumberRef} />
            )}
        </div>
    );
}
