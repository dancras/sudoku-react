function getRowStart(i: number) {
    return Math.floor(i / 9) * 9;
}

function getRowIndex(i: number) {
    return Math.floor(getRowStart(i) / 9);
}

function getRowMembers(i: number) {
    const rowStart = Math.floor(i / 9) * 9;
    return Array.from({ length: 9 }).map((x, i) => rowStart + i);
}

function getColumnStart(i: number) {
    return i % 9;
}

function getColumnIndex(i: number) {
    return getColumnStart(i);
}

function getColumnMembers(i: number) {
    const columnStart = i % 9;
    return Array.from({ length: 9 }).map((x, i) => columnStart + i * 9);
}

export function getBlockStart(i: number) {
    return (Math.floor(i / 27) * 27) + (i % 9) - (i % 3);
}

export function getBlockIndex(i: number) {
    const blockStart = getBlockStart(i);

    if (blockStart < 9) {
        return Math.floor(blockStart / 3);
    } else if (blockStart < 36) {
        return Math.floor(3 + (blockStart - 27) / 3);
    } else {
        return Math.floor(6 + (blockStart - 54) / 3);
    }
}

function getBlockMembers(i: number) {
    const topLeft = getBlockStart(i);
    return [
        topLeft, topLeft + 1, topLeft + 2,
        topLeft + 9, topLeft + 10, topLeft + 11,
        topLeft + 18, topLeft + 19, topLeft + 20
    ];
}

function emptyRecord<T>(length: number, startIndex: number, fill: (i: number) => T) {
    return Array.from<void>({ length: 9 }).reduce((acc, x, i) => {
        const j = startIndex + i;
        acc[j] = fill(j);
        return acc;
    }, {} as Record<number, T>);
}

export default class SudokuRules {

    contents: Record<number, number | null>;

    rowOccurrences: Record<number, Record<number, number>>;

    columnOccurrences: Record<number, Record<number, number>>;

    blockOccurrences: Record<number, Record<number, number>>;

    constructor() {
        this.contents = emptyRecord(81, 0, () => null);

        this.rowOccurrences = emptyRecord(9, 0, () => emptyRecord(9, 1, () => 0));
        this.columnOccurrences = emptyRecord(9, 0, () => emptyRecord(9, 1, () => 0));
        this.blockOccurrences = emptyRecord(9, 0, () => emptyRecord(9, 1, () => 0));
    }

    isValidCandidate(i: number, candidate: number): boolean {
        const rowIndex = getRowIndex(i);
        const columnIndex = getColumnIndex(i);
        const blockIndex = getBlockIndex(i);

        return Math.max(
            this.rowOccurrences[rowIndex][candidate],
            this.columnOccurrences[columnIndex][candidate],
            this.blockOccurrences[blockIndex][candidate]
        ) === 0;
    }

    isValidContents(i: number): boolean {
        const contents = this.contents[i];

        if (contents === null) {
            return true;
        }

        const rowIndex = getRowIndex(i);
        const columnIndex = getColumnIndex(i);
        const blockIndex = getBlockIndex(i);

        return Math.max(
            this.rowOccurrences[rowIndex][contents],
            this.columnOccurrences[columnIndex][contents],
            this.blockOccurrences[blockIndex][contents]
        ) === 1;
    }

    setContents(i: number, contents: number | null): number[] {
        const previousContents = this.contents[i];

        this.contents[i] = contents;

        const rowIndex = getRowIndex(i);
        const columnIndex = getColumnIndex(i);
        const blockIndex = getBlockIndex(i);

        if (previousContents !== null) {
            this.rowOccurrences[rowIndex][previousContents] -= 1;
            this.columnOccurrences[columnIndex][previousContents] -= 1;
            this.blockOccurrences[blockIndex][previousContents] -= 1;
        }

        if (contents !== null) {
            this.rowOccurrences[rowIndex][contents] += 1;
            this.columnOccurrences[columnIndex][contents] += 1;
            this.blockOccurrences[blockIndex][contents] += 1;
        }

        const rowMembers = getRowMembers(i);
        const columnMembers = getColumnMembers(i);
        const blockMembers = getBlockMembers(i);

        const allConnected = new Set(
            rowMembers.concat(columnMembers).concat(blockMembers)
        );

        return Array.from(allConnected);
    }
}
