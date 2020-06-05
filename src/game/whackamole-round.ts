import { IGame } from "./types";
import { Round } from "./round";
import { getRandomSentence } from "./base";

const instructionLines = [
    "How to Play:",
    "------------",
    "",
    "Use vim movements to locate the character with the arrow under it as ",
    "quickly as possible. Then invert the character's case to win.",
    "",
];

export class WhackAMoleRound extends Round {
    private winLine: string;
    private outputStartRow = 2;

    constructor() {
        super();
        this.winLine = "";
    }

    public getInstructions(): string[] {
        return instructionLines;
    }

    public async render(game: IGame): Promise<string[]> {
        const sentence = getRandomSentence();
        let chosenLocation = 0;

        do {
            const location = Math.floor(Math.random() * sentence.length);

            if (location > 0 && /[A-Za-z]/.test(sentence[location])) {
                chosenLocation = location;
            }
        } while (!chosenLocation);

        const pointerLine = sentence
            .split("")
            .map((_, index) => (index === chosenLocation ? "^" : " "))
            .join("");

        this.winLine = this.createWinLine(sentence, chosenLocation);

        await game.nvim.command(`:${String(instructionLines.length + this.outputStartRow + 1)}`);

        return [
            sentence,
            pointerLine
        ];
    }

    public async isRoundComplete(game: IGame): Promise<boolean> {
        const lines = await game.gameBuffer.getGameLines();
        console.log("WhackAMoleRound#isRoundComplete", lines.indexOf(this.winLine) !== -1, lines);

        return lines.indexOf(this.winLine) !== -1;
    }

    private createWinLine(sentence: string, targetColumn: number): string {
        const preTargetChar = sentence.slice(0, targetColumn);
        const postTargetChar = sentence.slice(targetColumn + 1);
        let targetChar = sentence[targetColumn];

        if (/[a-z]/.test(targetChar)) {
            targetChar = targetChar.toUpperCase();
        } else {
            targetChar = targetChar.toLowerCase();
        }

        return preTargetChar + targetChar + postTargetChar;
    }
}

