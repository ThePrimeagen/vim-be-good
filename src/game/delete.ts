import { Neovim } from "neovim";
import { GameBuffer, getEmptyLines } from "../game-buffer";
import { GameState, GameOptions } from "./types";
import { BaseGame } from "./base";

// this is a comment
export class DeleteGame extends BaseGame {
    private failed: boolean;

    constructor(nvim: Neovim, buffer: GameBuffer, state: GameState, opts?: GameOptions) {
        super(nvim, buffer, state, opts);
        this.failed = false;

        this.gameBuffer.setInstructions([
            'When you see a "DELETE ME", relative jump to it',
            "as fast as possible and delete it.",
            "",
            ""
        ]);

        this.onTimerExpired(async () => {
            console.log("DeleteGame#onTimerExpired!");
            this.state.failureCount++;
            this.failed = true;
        });
    }

    async hasFailed(): Promise<boolean> {
        return this.failed;
    }

    async run(): Promise<void> {
        const high = Math.random() > 0.5;
        const line = this.gameBuffer.midPointRandomPoint(high);

        const lines = new Array(this.state.lineLength).fill("");
        lines[line] = "                              DELETE ME";


        const middlePoint = this.gameBuffer.midPointRandomPoint(!high);
        console.log("relative -- run#rendering", middlePoint, lines);

        await this.nvim.command(`:${String(middlePoint)}`);
        await this.render(lines);

        this.startTimer();
    }

    async clear(): Promise<void> {
        this.failed = false;
        this.clearTimer();
        await this.render(getEmptyLines(this.state.lineLength));
    }

    async checkForWin(): Promise<boolean> {
        if (this.failed) {
            return true;
        }

        const lines = await this.state.buffer.getLines({
            start: this.gameBuffer.getInstructionOffset(),
            end: await this.state.buffer.length,
            strictIndexing: false
        });

        const length = lines.map(l => l.trim()).join("").length;
        return length === 0;
    }
}
