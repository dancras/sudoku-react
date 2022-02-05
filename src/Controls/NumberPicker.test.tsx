import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectedNumberProvider } from 'src/State/SelectedNumber';
import NumberPicker, { NUMBER_PICKER_OPTIONS } from 'src/Controls/NumberPicker';

test('numbers 1 to 9 are displayed', () => {
    render(
        <SelectedNumberProvider>
            <NumberPicker />
        </SelectedNumberProvider>
    );
    NUMBER_PICKER_OPTIONS.forEach(x => expect(screen.getByText(x)).toBeInTheDocument());
});

test('the --value css variable is set on number elements', () => {
    render(
        <SelectedNumberProvider>
            <NumberPicker />
        </SelectedNumberProvider>
    );
    expect(screen.getByText(2).getAttribute('style')).toContain('--value: 2');
});


test('the --selected css variable is updated when an option is clicked', function () {
    render(
        <SelectedNumberProvider>
            <NumberPicker />
        </SelectedNumberProvider>
    );

    const option3 = screen.getByText(3);
    const selection = screen.getByTestId('number-picker-selection');

    expect(selection.getAttribute('style')).toContain('--selected: 1');

    userEvent.click(option3);

    expect(selection.getAttribute('style')).toContain('--selected: 3');
});
