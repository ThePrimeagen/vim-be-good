import { Round } from "./round";
import { IGame } from "./types";
import { getRandomWord } from "./base";
import { getEmptyLines } from "../game-buffer";

const instructions = [
    'Replace the outer container (if (...) { ... } or [ ... ]) with "bar"',
    "",
    "e.g.:",
    "[                    [",
    "   item1,            bar",
    "   item1,       ->   ]",
    "   item1,",
    "   item1,",
    "]"
];

export class CiRound extends Round {
    private currentRandomWord!: string;
    private ifStatment = false;

    constructor() { super(); }

    getInstructions(): string[] {
        return instructions;
    }

    async render(game: IGame): Promise<string[]> {
        const high = Math.random() > 0.5;
        const line = game.gameBuffer.midPointRandomPoint(high, 6);
        const lines = getEmptyLines(game.state.lineLength);

        this.currentRandomWord = getRandomWord();

        this.ifStatment = false;

        if (Math.random() > 0.5) {
            lines[line] = `if (${this.currentRandomWord}) {`;
            lines[line + 1] = ``;
            lines[line + 2] = `    if (${getRandomWord()}) { `;
            lines[line + 3] = `        ${getRandomWord()}`;
            lines[line + 4] = `    }`;
            lines[line + 5] = `}`;
            this.ifStatment = true;
        } else {
            lines[line] = `[`;
            lines[line + 1] = `    ${getRandomWord()},`;
            lines[line + 2] = `    ${getRandomWord()},`;
            lines[line + 3] = `    ${getRandomWord()},`;
            lines[line + 4] = `    ${getRandomWord()},`;
            lines[line + 5] = `]`;
        }

        const jumpPoint = game.gameBuffer.midPointRandomPoint(!high);

        await game.nvim.command(`:${String(jumpPoint)}`);

        return lines;
    }

    async isRoundComplete(game: IGame): Promise<boolean> {
        const lines = await game.gameBuffer.getGameLines();
        const contents = lines.map(l => l.trim()).join("");

        return (
            (this.ifStatment &&
                contents.toLowerCase() ===
                    `if (${this.currentRandomWord}) {bar}`) ||
            contents.toLowerCase() === `[bar]`
        );
    }
}


