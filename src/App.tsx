import 'src/App.css';
import { SelectedNumberProvider } from 'src/State/SelectedNumber';
import NumberPicker from 'src/Controls/NumberPicker';

function App() {
    return (
        <div className="Sudoku">
            <SelectedNumberProvider>
                <NumberPicker />
            </SelectedNumberProvider>
        </div>
    );
}

export default App;
