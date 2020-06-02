import { Neovim } from "neovim";
import { GameState, GameOptions } from "./types";
import { getEmptyLines, BaseGame } from "./base";

// this is a comment
export class DeleteGame extends BaseGame {
    private failed: boolean;

    constructor(nvim: Neovim, state: GameState, opts?: GameOptions) {
        super(nvim, state, opts);
        this.failed = false;

        this.setInstructions([
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
        const line = this.midPointRandomPoint(high);

        const lines = new Array(this.state.lineLength).fill("");
        lines[line] = "                              DELETE ME";

        await this.nvim.command(`:${String(this.midPointRandomPoint(!high))}`);
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
            start: this.getInstructionOffset(),
            end: await this.state.buffer.length,
            strictIndexing: false
        });

        const length = lines.map(l => l.trim()).join("").length;
        return length === 0;
    }
}
