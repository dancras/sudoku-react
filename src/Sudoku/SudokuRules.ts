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
    return Array.from<void>({ length: length }).reduce((acc, x, i) => {
        const j = startIndex + i;
        acc[j] = fill(j);
        return acc;
    }, {} as Record<number, T>);
}

export default class SudokuRules {

    contents: Record<number, number | null>;

    contentsCount: number;

    rowOccurrences: Record<number, Record<number, number>>;

    columnOccurrences: Record<number, Record<number, number>>;

    blockOccurrences: Record<number, Record<number, number>>;

    excessOccurrences: number;

    constructor() {
        this.contents = emptyRecord(81, 0, () => null);

        this.contentsCount = 0;
        this.excessOccurrences = 0;

        this.rowOccurrences = emptyRecord(9, 0, () => emptyRecord(9, 1, () => 0));
        this.columnOccurrences = emptyRecord(9, 0, () => emptyRecord(9, 1, () => 0));
        this.blockOccurrences = emptyRecord(9, 0, () => emptyRecord(9, 1, () => 0));
    }

    isEmpty() {
        return this.contentsCount === 0;
    }

    isValid() {
        return this.excessOccurrences === 0;
    }

    isComplete() {
        return this.contentsCount == 81 && this.isValid();
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

    /**
     * All modifications to row/column/block occurrences must be done with these to keep track of status
     */
    #increaseOccurrences(occurrences: Record<number, number>, contents: number) {
        occurrences[contents]++;

        if (occurrences[contents] > 1) {
            this.excessOccurrences++;
        }
    }

    #decreaseOccurrences(occurrences: Record<number, number>, contents: number) {
        occurrences[contents]--;

        if (occurrences[contents] > 0) {
            this.excessOccurrences--;
        }
    }

    setContents(i: number, contents: number | null): number[] {
        const previousContents = this.contents[i];

        // Our use cases don't expect this to happen and supporting it requires more logic
        if (previousContents === contents) {
            throw new Error('SudokuRules.setContents called with existing contents unexpectedly');
        }

        this.contents[i] = contents;

        const rowIndex = getRowIndex(i);
        const columnIndex = getColumnIndex(i);
        const blockIndex = getBlockIndex(i);

        if (previousContents !== null) {
            this.#decreaseOccurrences(this.rowOccurrences[rowIndex], previousContents);
            this.#decreaseOccurrences(this.columnOccurrences[columnIndex], previousContents);
            this.#decreaseOccurrences(this.blockOccurrences[blockIndex], previousContents);
        } else {
            this.contentsCount++;
        }

        if (contents !== null) {
            this.#increaseOccurrences(this.rowOccurrences[rowIndex], contents);
            this.#increaseOccurrences(this.columnOccurrences[columnIndex], contents);
            this.#increaseOccurrences(this.blockOccurrences[blockIndex], contents);
        } else {
            this.contentsCount--;
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
