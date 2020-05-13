import { Neovim } from 'neovim';
import { GameState, GameOptions } from './types';
import { BaseGame } from './base';

// this is a comment
export class DeleteGame extends BaseGame {
    constructor(nvim: Neovim, state: GameState, opts?: GameOptions) {
        super(nvim, state, opts);
    }

    async run() {
        const high = Math.random() > 0.5;
        const midPoint = this.state.lineLength / 2 + this.state.lineRange.start;
        const line = this.midPointRandomPoint(midPoint, high);
        const lines = new Array(this.state.lineLength).fill('');
        lines[line] = "                              DELETE ME";

        await this.nvim.command(`:${String(this.midPointRandomPoint(midPoint, !high))}`);
        await this.state.buffer.setLines(lines, {
            start: this.state.lineRange.start,
            end: this.state.lineRange.end,
            strictIndexing: true
        });
    }

    async clear() {
        const len = await this.state.buffer.length;
        await this.state.buffer.remove(0, len, true);
        await this.state.buffer.insert(new Array(this.state.lineRange.end).fill(''), 0);
    }

    async checkForWin(): Promise<boolean> {
        const lines = await this.state.buffer.getLines({
            start: this.state.lineRange.start,
            end: await this.state.buffer.length,
            strictIndexing: false
        });

        const length = lines.map(l => l.trim()).join('').length;
        return length === 0;
    }
}

