import { IGame } from "./types";
import { Round } from "./round";
import { getRandomWord } from "./base";

const instructions = [
    "Use either # or * to jump to the other word.",
    "The round ends when either of the words is deleted.",
];

export class StarRound extends Round {
    private randomWord: string;
    private midPoint: number;
    constructor() {
        super();
        this.randomWord = getRandomWord();
        this.midPoint = 0;
    }

    public getInstructions(): string[] {
        return instructions;
    }

    public async render(game: IGame): Promise<string[]> {
        const high = Math.random() > 0.5;
        const line = game.gameBuffer.midPointRandomPoint(high);

        const lines = new Array(game.state.lineLength).fill("");
        const randWord = getRandomWord();
        const midPoint = Math.floor(game.state.lineLength / 2);

        lines[midPoint] = randWord;
        lines[line] = randWord;

        this.randomWord = randWord;
        this.midPoint = midPoint;

        console.log(
            "star -- run#rendering",
            high,
            midPoint,
            game.state.lineLength,
            lines,
        );

        return lines;
    }

    public async postRender(game: IGame): Promise<void> {
        await game.nvim.command(`:${this.midPoint}`);
    }

    public async isRoundComplete(game: IGame): Promise<boolean> {
        const lines = await game.gameBuffer.getGameLines();
        const content = lines.map((l) => l.trim()).join("");
        console.log("star-round#isRoundComplete", content, lines);
        return content === this.randomWord;
    }
}
