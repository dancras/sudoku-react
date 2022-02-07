import { useContext } from 'react';
import { GameStateContext, Status } from 'src/State/GameState';

export default function ButtonBar() {
    const { status, startGame } = useContext(GameStateContext);

    const showStartButton = status === Status.InvalidGrid || status === Status.CanStart;

    return (
        <div className="ButtonBar">
            { showStartButton && <button disabled={ status === Status.InvalidGrid } onClick={ startGame }>Start</button> }
        </div>
    );
}
