import { render, screen } from '@testing-library/react';
import NumberPicker from 'src/Controls/NumberPicker';

test('something happens', () => {
    render(<NumberPicker />);
    expect(screen.getByText('numbers')).toBeInTheDocument();
});
