import { act, render, screen } from '@testing-library/react';
import { useContext } from 'react';
import { SelectedNumberContext, SelectedNumberProvider, SelectedNumberState } from 'src/State/SelectedNumber';

test('the selected number is shared via a context', function () {
    let setSelectedNumber: SelectedNumberState[1] = () => undefined as void;

    function ExampleConsumer() {
        const [selectedNumber, setter] = useContext(SelectedNumberContext);
        setSelectedNumber = setter;
        return <div>example {selectedNumber}</div>;
    }

    render(
        <SelectedNumberProvider>
            <ExampleConsumer />
        </SelectedNumberProvider>
    );

    act(() => {
        setSelectedNumber(3);
    });

    expect(screen.getByText('example 3')).toBeInTheDocument();
});
