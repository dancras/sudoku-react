import 'src/Sudoku/SudokuGrid.css';
import { memo, useContext, useRef } from 'react';
import { GridContentsCell, GridContentsContext, GridContentsReducer } from 'src/State/GridContents';
import { SelectedNumberContext } from 'src/State/SelectedNumber';
import { GameStateContext, Status } from 'src/State/GameState';

// Values we need to use in cell events but don't want to cause re-renders
type ContextInfo = React.MutableRefObject<{
    status: Status,
    selectedNumber: number
}>;

function Cell({ cell, i, dispatch, contextInfo }: { cell: GridContentsCell, i: number, dispatch: GridContentsReducer[1], contextInfo: ContextInfo }) {

    function toggleContents() {
        dispatch({
            action: 'toggleContents',
            cell: i,
            contents: contextInfo.current.selectedNumber
        });
    }

    function toggleCandidate() {
        dispatch({
            action: 'toggleCandidate',
            cell: i,
            candidate: contextInfo.current.selectedNumber
        });
    }

    function handleClick() {
        if (cell.isLocked) {
            return;
        } else if (contextInfo.current.status === Status.Started) {
            toggleCandidate();
        } else if (contextInfo.current.status !== Status.Complete) {
            toggleContents();
        }
    }

    function handleDoubleClick() {
        if (!cell.isLocked && contextInfo.current.status === Status.Started) {
            toggleContents();
        }
    }

    const [contents, isValid] = cell.contents === null ? [null, true] : cell.contents;

    return (
        <div className={`--Cell ${cell.isLocked ? '-Locked' : ''} ${contents ? `-ShowingContents ${isValid ? '-Valid' : '-Invalid'}` : '-ShowingCandidates'}`}
             onClick={handleClick}
             onDoubleClick={handleDoubleClick}
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
    const { status } = useContext(GameStateContext);
    const contextInfo: ContextInfo = useRef({ selectedNumber, status });
    contextInfo.current = { selectedNumber, status };

    return (
        <div className="SudokuGrid" data-testid="sudoku-grid">
            {gridContents.map((cell, i) =>
                <MemoizedCell key={i} cell={cell} i={i} dispatch={dispatchGridContentsUpdate} contextInfo={contextInfo} />
            )}
        </div>
    );
}
