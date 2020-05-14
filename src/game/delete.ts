import { Neovim } from 'neovim';
import { GameState, GameOptions } from './types';
import { getEmptyLines, BaseGame } from './base';

// this is a comment
export class DeleteGame extends BaseGame {
    constructor(nvim: Neovim, state: GameState, opts?: GameOptions) {
        super(nvim, state, opts);

        this.setInstructions([
            "When you see a \"DELETE ME\", relative jump to it",
            "as fast as possible and delete it.",
            "",
            "",
        ]);
    }

    async run() {
        const high = Math.random() > 0.5;
        const line = this.midPointRandomPoint(high);
        const lines = new Array(this.state.lineLength).fill('');
        lines[line] = "                              DELETE ME";

        await this.nvim.command(`:${String(this.midPointRandomPoint(!high))}`);
        await this.render(lines);
    }

    async clear() {
        await this.render(getEmptyLines(this.state.lineLength));
    }

    async checkForWin(): Promise<boolean> {
        const lines = await this.state.buffer.getLines({
            start: this.getInstructionOffset(),
            end: await this.state.buffer.length,
            strictIndexing: false
        });

        const length = lines.map(l => l.trim()).join('').length;
        return length === 0;
    }
}

