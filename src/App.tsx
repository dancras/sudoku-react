import 'src/App.css';
import { SelectedNumberProvider } from 'src/State/SelectedNumber';
import NumberPicker from 'src/Controls/NumberPicker';
import SudokuGrid from 'src/Sudoku/SudokuGrid';
import { GridContentsProvider } from 'src/State/GridContents';
import ButtonBar from 'src/ButtonBar';
import { GameStateProvider } from 'src/State/GameState';
import SudokuRules from 'src/Sudoku/SudokuRules';

function App() {
    return (
        <div className="SudokuReact">
            <GameStateProvider rulesFactory={() => new SudokuRules()}>
                <SelectedNumberProvider>
                    <GridContentsProvider>
                        <SudokuGrid />
                    </GridContentsProvider>
                    <NumberPicker />
                    <ButtonBar></ButtonBar>
                </SelectedNumberProvider>
            </GameStateProvider>
        </div>
    );
}

export default App;
