import SudokuRules, { getBlockStart, getBlockIndex } from 'src/Sudoku/SudokuRules';

describe('setContents()', () => {
    test('returns all connected cell indexes for the updated cell', () => {
        const rules = new SudokuRules();

        expect(rules.setContents(0, 5)).toEqual(expect.arrayContaining([
            0, 1, 2, 3, 4, 5, 6, 7, 8,
            9, 10, 11, 18, 19, 20,
            27, 36, 45, 54, 63, 72
        ]));
        expect(rules.setContents(14, 9)).toEqual(expect.arrayContaining([
            5, 9, 10, 11, 12, 13, 14, 15, 16, 17,
            23, 32, 41, 50, 59, 68, 77
        ]));
    });

    test('throws error if new contents matches existing', () => {
        const rules = new SudokuRules();
        rules.setContents(0, 5);
        expect(() => rules.setContents(0, 5)).toThrowError();
    });
});

describe('isEmpty()', () => {
    test('returns false when it has any contents', () => {
        const rules = new SudokuRules();

        expect(rules.isEmpty()).toEqual(true);

        rules.setContents(0, 1);
        expect(rules.isEmpty()).toEqual(false);

        rules.setContents(50, 4);
        expect(rules.isEmpty()).toEqual(false);

        rules.setContents(0, null);
        expect(rules.isEmpty()).toEqual(false);

        rules.setContents(50, null);
        expect(rules.isEmpty()).toEqual(true);
    });
});

describe('isValid()', () => {
    test('returns true when no row, column or block has more than 1 of a number', () => {
        const rules = new SudokuRules();

        expect(rules.isValid()).toEqual(true);

        // 1 2 * * * * * * *
        // * * * 1 * * 2 * *
        // * *
        // * 1
        rules.setContents(0, 1);
        rules.setContents(0, 2);
        rules.setContents(12, 1);
        rules.setContents(15, 2);
        rules.setContents(28, 1);
        expect(rules.isValid()).toEqual(true);
    });

    test('returns false when row, column or block has more than 1 of a number', () => {
        const rules = new SudokuRules();

        // 1 * * 1 * * * * *
        rules.setContents(0, 1);
        rules.setContents(3, 1);
        expect(rules.isValid()).toEqual(false);

        // 1 * * * * * * * *
        rules.setContents(3, null);
        expect(rules.isValid()).toEqual(true);

        // 1 * * * * * * * *
        // 1 * *
        rules.setContents(9, 1);
        expect(rules.isValid()).toEqual(false);

        // 1 2 * * * * * * *
        // 2 * *
        rules.setContents(1, 2);
        rules.setContents(9, 2);
        expect(rules.isValid()).toEqual(false);

        // 1 * * * * * * * *
        // 2 * *
        rules.setContents(1, null);
        expect(rules.isValid()).toEqual(true);
    });
});

describe('isComplete()', () => {
    test('returns true for a complete valid grid only', () => {
        const rules = new SudokuRules();

        const solutionText = `
483921657
967345821
251876493
548132976
729564138
136798245
372689514
814253769
695417382`;

        let i = 0;
        solutionText.trim().split('\n').forEach(line => {
            const row = line.trim().split('');
            row.forEach(cell => {
                rules.setContents(i, parseInt(cell));
                i++;
            });
        });

        expect(rules.isComplete()).toEqual(true);

        rules.setContents(0, 5);
        expect(rules.isComplete()).toEqual(false);

        rules.setContents(0, 4);
        expect(rules.isComplete()).toEqual(true);

        rules.setContents(26, null);
        expect(rules.isComplete()).toEqual(false);

        rules.setContents(26, 3);
        expect(rules.isComplete()).toEqual(true);

        rules.setContents(80, 3);
        expect(rules.isComplete()).toEqual(false);
    });
});

describe('isValidContents()', () => {

    test('returns true or false depending on duplicate contents in the same row', () => {
        const rules = new SudokuRules();

        // 5 * * * * * * * *
        rules.setContents(0, 5);
        expect(rules.isValidContents(0)).toEqual(true);

        // 5 * * 5 * * * * *
        rules.setContents(3, 5);
        expect(rules.isValidContents(0)).toEqual(false);
        expect(rules.isValidContents(3)).toEqual(false);

        // * * * 5 * * * * *
        rules.setContents(0, null);
        expect(rules.isValidContents(0)).toEqual(true);
        expect(rules.isValidContents(3)).toEqual(true);

        // * * * 5 * * 5 * *
        rules.setContents(6, 5);
        expect(rules.isValidContents(0)).toEqual(true);
        expect(rules.isValidContents(3)).toEqual(false);
        expect(rules.isValidContents(6)).toEqual(false);
    });

    test('returns true or false depending on duplicate contents in the same column', () => {
        const rules = new SudokuRules();

        // Comment visualisations are rotated 90 degrees
        // 5 * * 5 * * * * *
        rules.setContents(0, 5);
        rules.setContents(27, 5);
        expect(rules.isValidContents(0)).toEqual(false);
        expect(rules.isValidContents(27)).toEqual(false);

        // * * * 5 * * * * *
        rules.setContents(0, null);
        expect(rules.isValidContents(0)).toEqual(true);
        expect(rules.isValidContents(27)).toEqual(true);

        // * * * 5 * * 5 * *
        rules.setContents(54, 5);
        expect(rules.isValidContents(0)).toEqual(true);
        expect(rules.isValidContents(27)).toEqual(false);
        expect(rules.isValidContents(54)).toEqual(false);
    });

    test('returns true or false depending on duplicate contents in the same block', () => {
        const rules = new SudokuRules();

        // 5 * *
        // * 5 *
        // * * *
        rules.setContents(0, 5);
        rules.setContents(10, 5);
        expect(rules.isValidContents(0)).toEqual(false);
        expect(rules.isValidContents(10)).toEqual(false);

        // * * *
        // * 5 *
        // * * *
        rules.setContents(0, null);
        expect(rules.isValidContents(0)).toEqual(true);
        expect(rules.isValidContents(10)).toEqual(true);

        // * * *
        // * 5 *
        // * * 5
        rules.setContents(20, 5);
        expect(rules.isValidContents(0)).toEqual(true);
        expect(rules.isValidContents(10)).toEqual(false);
        expect(rules.isValidContents(20)).toEqual(false);
    });

    test('continues returning false if another number is causing invalid state', () => {
        const rules = new SudokuRules();

        // 5 4 4
        // * 5 *
        // * * *
        rules.setContents(0, 5);
        rules.setContents(1, 4);
        rules.setContents(2, 4);
        rules.setContents(10, 5);
        expect(rules.isValidContents(1)).toEqual(false);

        // 5 4 4
        // * * *
        // * * *
        rules.setContents(10, null);
        expect(rules.isValidContents(1)).toEqual(false);
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

describe('block member calculations', () => {
    test('block start is the top left member of any block', () => {
        expect(getBlockStart(0)).toEqual(0);
        expect(getBlockStart(20)).toEqual(0);
        expect(getBlockStart(6)).toEqual(6);
        expect(getBlockStart(26)).toEqual(6);
        expect(getBlockStart(30)).toEqual(30);
        expect(getBlockStart(50)).toEqual(30);
    });

    test('block index is calculated correctly', () => {
        expect(getBlockIndex(0)).toEqual(0);
        expect(getBlockIndex(3)).toEqual(1);
        expect(getBlockIndex(6)).toEqual(2);
        expect(getBlockIndex(27)).toEqual(3);
        expect(getBlockIndex(30)).toEqual(4);
        expect(getBlockIndex(33)).toEqual(5);
        expect(getBlockIndex(54)).toEqual(6);
        expect(getBlockIndex(57)).toEqual(7);
        expect(getBlockIndex(60)).toEqual(8);
    });
});
