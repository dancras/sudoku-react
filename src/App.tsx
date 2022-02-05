import 'src/App.css';
import { SelectedNumberProvider } from 'src/State/SelectedNumber';
import NumberPicker from 'src/Controls/NumberPicker';
import SudokuGrid from 'src/Sudoku/SudokuGrid';
import { GridContentsProvider } from 'src/State/GridContents';

function App() {
    return (
        <div className="SudokuReact">
            <SelectedNumberProvider>
                <GridContentsProvider>
                    <SudokuGrid />
                </GridContentsProvider>
                <NumberPicker />
            </SelectedNumberProvider>
        </div>
    );
}

export default App;
