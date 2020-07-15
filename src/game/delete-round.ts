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

    private async getGameOptions(game: IGame) {
        type userOptionsType = { [key: string]: number };

        let randomOffset: number = 0;
        let fixedOffset: number = 0;

        const isDefinedUserRandomOffset = await game.nvim.eval(
            'exists("vim_be_good_delete_me_random_offset")',
        );
        const isDefinedUserFixedOffset = await game.nvim.eval(
            'exists("vim_be_good_delete_me_fixed_offset")',
        );

        if (isDefinedUserRandomOffset) {
            randomOffset = Number(
                await game.nvim.getVar("vim_be_good_delete_me_random_offset"),
            );
        }
        if (isDefinedUserFixedOffset) {
            fixedOffset = Number(
                await game.nvim.getVar("vim_be_good_delete_me_fixed_offset"),
            );
        }

        console.log(
            "delete-round#getGameOptions - isDefinedUserRandomOffset ",
            randomOffset,
        );
        console.log(
            "delete-round#getGameOptions - isDefinedUserFixedOffset ",
            fixedOffset,
        );

        let userOptions: userOptionsType = {
            vim_be_good_delete_me_random_offset: randomOffset,
            vim_be_good_delete_me_fixed_offset: fixedOffset,
        };

        return userOptions;
    }

    private async getColumnOffset(game: IGame) {
        let userOptions = await this.getGameOptions(game);
        let randomOffset = userOptions["vim_be_good_delete_me_random_offset"];
        let fixedOffset = userOptions["vim_be_good_delete_me_fixed_offset"];
        let offset: number;

        let difficultyToOffset = {
            noob: { min: 0, max: 0 },
            easy: { min: 3, max: 10 },
            medium: { min: 5, max: 20 },
            hard: { min: 10, max: 30 },
            nightmare: { min: 15, max: 35 },
            tpope: { min: 30, max: 40 },
        };

        offset =
            Math.floor(
                Math.random() *
                    (difficultyToOffset[game.difficulty].max -
                        difficultyToOffset[game.difficulty].min),
            ) + difficultyToOffset[game.difficulty].min;
        console.log("delete-round#getColumnOffset - levelOffset ", offset);

        if (randomOffset > 0) {
            console.log(
                "delete-round#getColumnOffset - userRandomOffset ",
                randomOffset,
            );

            offset =
                Math.floor(Math.random() * (40 - randomOffset)) + randomOffset;
        }

        if (fixedOffset > 0) {
            console.log(
                "delete-round#getColumnOffset - userFixedOffset ",
                fixedOffset,
            );
            offset = fixedOffset;
        }

        console.log("delete-round#getColumnOffset - offset ", offset);
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
