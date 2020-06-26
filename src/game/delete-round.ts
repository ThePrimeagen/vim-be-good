import { IGame } from "./types";
import { Round } from "./round";

const deleteRoundInstructions = [
    'When you see a "DELETE ME", relative jump to it',
    "as fast as possible and delete it.",
    "",
    "",
];

export class DeleteRound extends Round {
    private jumpPoint!: number;
    constructor() {
        super();
    }

    private async getColumnOffset(game: IGame) {
        const isDefindedUserOffset = await game.nvim.eval(
            'exists("vim_be_good_delete_me_offset")',
        );
        let offset;
        console.log(
            "delete-round#getColumnOffset - isDefindedUserOffset ",
            isDefindedUserOffset,
        );
        if (game.difficulty === "noob") {
            offset = 3;
        }

        if (isDefindedUserOffset) {
            offset = Number(
                await game.nvim.getVar("vim_be_good_delete_me_offset"),
            );
            console.log("delete-round#getColumnOffset - userOffset ", offset);
        } else {
            offset = Math.floor(Math.random() * (40 - 5)) + 5;
        }
        return " ".repeat(offset);
    }

    public getInstructions(): string[] {
        return deleteRoundInstructions;
    }

    public async render(game: IGame): Promise<string[]> {
        const high = Math.random() > 0.5;
        const line = game.gameBuffer.midPointRandomPoint(high);

        const lines = new Array(game.state.lineLength).fill("");

        lines[line] = (await this.getColumnOffset(game)) + "DELETE ME";

        const middlePoint = game.gameBuffer.midPointRandomPoint(!high);
        console.log(
            "relative -- run#rendering",
            high,
            middlePoint,
            game.state.lineLength,
            lines,
        );

        this.jumpPoint = middlePoint;

        return lines;
    }

    public async postRender(game: IGame): Promise<void> {
        await game.nvim.command(`:${this.jumpPoint}`);
    }

    public async isRoundComplete(game: IGame): Promise<boolean> {
        const lines = await game.gameBuffer.getGameLines();
        const length = lines.map((l) => l.trim()).join("").length;
        console.log("delete-round#isRoundComplete", length, lines);
        return length === 0;
    }
}
