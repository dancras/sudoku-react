import { act, render } from '@testing-library/react';
import { SelectedNumberContext, SelectedNumberProvider } from 'src/State/SelectedNumber';
import { createTestConsumer } from 'src/Test/TestContext';

test('the selected number is shared via a context', function () {
    const [TestConsumer, readContext] = createTestConsumer(SelectedNumberContext);

    render(
        <SelectedNumberProvider>
            <TestConsumer />
        </SelectedNumberProvider>
    );

    const [initialSelectedNumber, setSelectedNumber] = readContext();
    expect(initialSelectedNumber).toEqual(1);

    act(() => {
        setSelectedNumber(3);
    });

    const [selectedNumber] = readContext();
    expect(selectedNumber).toEqual(3);
});
