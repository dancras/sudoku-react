function getRowMembers(i: number) {
    const rowStart = Math.floor(i / 9) * 9;
    return Array.from({ length: 9 }).map((x, i) => rowStart + i);
}

function getColumnMembers(i: number) {
    const columnStart = i % 9;
    return Array.from({ length: 9 }).map((x, i) => columnStart + i * 9);
}

function getBlockMembers(i: number) {
    const topLeft = Math.floor(i / 27) + (i % 9) - (i % 3);
    return [
        topLeft, topLeft + 1, topLeft + 2,
        topLeft + 9, topLeft + 10, topLeft + 11,
        topLeft + 18, topLeft + 19, topLeft + 20
    ];
}



export default class SudokuRules {
    contents: (number | null)[];

    constructor() {
        this.contents = Array.from<null>({ length: 81 }).fill(null);
    }

    #getInvalidMembers(members: number[], contents: number) {
        const matchingMembers = members.filter(i => this.contents[i] === contents);
        return matchingMembers.length > 1 ? matchingMembers : [];
    }

    isValidCandidate(i: number, candidate: number): boolean {
        const rowMatches = getRowMembers(i).filter(j => this.contents[j] === candidate);
        const columnMatches = getColumnMembers(i).filter(j => this.contents[j] === candidate);
        const blockMatches = getBlockMembers(i).filter(j => this.contents[j] === candidate);

        return rowMatches.length + columnMatches.length + blockMatches.length === 0;
    }

    setContents(i: number, contents: number): [number[], number[]] {
        this.contents[i] = contents;

        const rowMembers = getRowMembers(i);
        const invalidRowMembers = this.#getInvalidMembers(rowMembers, contents);

        const columnMembers = getColumnMembers(i);
        const invalidColumnMembers = this.#getInvalidMembers(columnMembers, contents);

        const blockMembers = getBlockMembers(i);
        const invalidBlockMembers = this.#getInvalidMembers(blockMembers, contents);

        const allConnected = new Set(
            rowMembers.concat(columnMembers).concat(blockMembers)
        );

        const allInvalid = new Set(
            invalidRowMembers.concat(invalidColumnMembers).concat(invalidBlockMembers)
        );

        return [Array.from(allInvalid), Array.from(allConnected)];
    }
}
