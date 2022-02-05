import 'src/Controls/NumberPicker.css';
import { useContext } from 'react';
import { SelectedNumberContext } from 'src/State/SelectedNumber';

export interface NumberPickerStyle extends React.CSSProperties {
    '--selected'?: number;
    '--value'?: number;
}

export const NUMBER_PICKER_OPTIONS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function NumberPicker() {
    const [selected, setSelected] = useContext(SelectedNumberContext);

    return (
        <div className="NumberPicker">
            <div style={{ '--selected': selected } as NumberPickerStyle}
                 className="--Selection"
                 data-testid="number-picker-selection"
            ></div>
            <ul className="--Values">
                {NUMBER_PICKER_OPTIONS.map(x =>
                    <li key={x}
                        onClick={() => setSelected(x)}
                        style={{ '--value': x } as NumberPickerStyle}
                    >
                        {x}
                    </li>
                )}
            </ul>
        </div>
    );
}
