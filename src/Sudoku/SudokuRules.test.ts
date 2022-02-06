import SudokuRules from 'src/Sudoku/SudokuRules';

describe('setContents()', () => {
    test('returns an empty array when no valid states change', () => {
        const rules = new SudokuRules();

        expect(rules.setContents(0, 5)[0]).toEqual([]);
        expect(rules.setContents(1, 6)[0]).toEqual([]);
        expect(rules.setContents(80, 2)[0]).toEqual([]);
    });

    test('returns an array containing cell indexes invalid cell indexes in the same row', () => {
        const rules = new SudokuRules();

        // 5 * * 5 * * 5 * *
        expect(rules.setContents(0, 5)[0]).toEqual([]);
        expect(rules.setContents(3, 5)[0]).toEqual([0, 3]);
        expect(rules.setContents(6, 5)[0]).toEqual([0, 3, 6]);
    });

    test('returns an array containing cell indexes invalid cell indexes in the same column', () => {
        const rules = new SudokuRules();

        // 5
        // *
        // *
        // 5
        // *
        // *
        // 5
        // *
        // *
        expect(rules.setContents(0, 5)[0]).toEqual([]);
        expect(rules.setContents(27, 5)[0]).toEqual([0, 27]);
        expect(rules.setContents(54, 5)[0]).toEqual([0, 27, 54]);
    });

    test('returns an array containing cell indexes invalid cell indexes in the same block', () => {
        const rules = new SudokuRules();

        // 5 * *
        // * 5 *
        // * * 5
        expect(rules.setContents(0, 5)[0]).toEqual([]);
        expect(rules.setContents(10, 5)[0]).toEqual([0, 10]);
        expect(rules.setContents(20, 5)[0]).toEqual([0, 10, 20]);
    });

    test('de-duplicates any members that are invalid in row column and block', () => {
        const rules = new SudokuRules();

        // 5 * 5
        // * * *
        // 5 * 5
        expect(rules.setContents(0, 5)[0]).toEqual([]);
        expect(rules.setContents(2, 5)[0]).toEqual(expect.arrayContaining([0, 2]));
        expect(rules.setContents(18, 5)[0]).toEqual(expect.arrayContaining([0, 2, 18]));
        expect(rules.setContents(20, 5)[0]).toEqual(expect.arrayContaining([0, 2, 18, 20]));
    });

    test('returns all connected cell indexes for the updated cell', () => {
        const rules = new SudokuRules();

        expect(rules.setContents(0, 5)[1]).toEqual(expect.arrayContaining([
            0, 1, 2, 3, 4, 5, 6, 7, 8,
            9, 10, 11, 18, 19, 20,
            27, 36, 45, 54, 63, 72
        ]));
        expect(rules.setContents(14, 9)[1]).toEqual(expect.arrayContaining([
            5, 9, 10, 11, 12, 13, 14, 15, 16, 17,
            23, 32, 41, 50, 59, 68, 77
        ]));
    });
});

describe('isValidCandidate()', () => {
    test('returns true when no connected cell contains candidate', () => {
        const rules = new SudokuRules();
        rules.setContents(1, 4);
        rules.setContents(49, 5);

        expect(rules.isValidCandidate(0, 5)).toEqual(true);
        expect(rules.isValidCandidate(40, 2)).toEqual(true);
        expect(rules.isValidCandidate(72, 3)).toEqual(true);
    });

    test('returns false if a cell in same row has candidate', () => {
        const rules = new SudokuRules();
        rules.setContents(1, 5);
        rules.setContents(9, 3);

        expect(rules.isValidCandidate(0, 5)).toEqual(false);
        expect(rules.isValidCandidate(14, 3)).toEqual(false);
    });

    test('returns false if a cell in same column has candidate', () => {
        const rules = new SudokuRules();
        rules.setContents(0, 5);
        rules.setContents(10, 6);

        expect(rules.isValidCandidate(72, 5)).toEqual(false);
        expect(rules.isValidCandidate(28, 6)).toEqual(false);
    });

    test('returns false if a cell in same block has candidate', () => {
        const rules = new SudokuRules();
        rules.setContents(4, 5);
        rules.setContents(8, 6);

        expect(rules.isValidCandidate(14, 5)).toEqual(false);
        expect(rules.isValidCandidate(6, 6)).toEqual(false);
    });
});
