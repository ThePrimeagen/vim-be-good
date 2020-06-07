import { IGame } from "./types";
import { Round } from "./round";

const deleteRoundInstructions = [
    'When you see a "DELETE ME", relative jump to it',
    "as fast as possible and delete it.",
    "",
    "",
];

export class DeleteRound extends Round {
    constructor() {
        super();
    }

    public getInstructions(): string[] {
        return deleteRoundInstructions;
    }

    public async render(game: IGame): Promise<string[]> {
        const high = Math.random() > 0.5;
        const line = game.gameBuffer.midPointRandomPoint(high);

        const lines = new Array(game.state.lineLength).fill("");
        lines[line] = "                              DELETE ME";

        const middlePoint = game.gameBuffer.midPointRandomPoint(!high);
        console.log(
            "relative -- run#rendering",
            high,
            middlePoint,
            game.state.lineLength,
            lines,
        );

        await game.nvim.command(`:${String(middlePoint)}`);

        return lines;
    }

    public async isRoundComplete(game: IGame): Promise<boolean> {
        const lines = await game.gameBuffer.getGameLines();
        const length = lines.map((l) => l.trim()).join("").length;
        console.log("delete-round#isRoundComplete", length, lines);
        return length === 0;
    }
}
