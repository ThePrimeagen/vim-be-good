import { Neovim, Buffer } from 'neovim';
import { BaseGame } from './base'

export class DeleteGame extends BaseGame {
    constructor(nvim: Neovim, args: string[]) {
        super(nvim, args);
    }

    // @ts-ignore
    async onLineChange(...args: any[]): Promise<void> {
        const startOfFunction = Date.now();

        try {
            if (!(await this.checkForWin())) {
                return;
            }

            this.finishRound(startOfFunction);
            if (this.isFinished()) {
                console.log("Results");
                this.state.results.forEach(x => console.log(x));
                await this.setTitle(this.state, `Average!: ${this.state.results.reduce((x, y) => x + y, 0) / this.state.results.length}`);
                this.stopListening();
                return;
            } else {
                console.log("setTitle", `Round ${this.state.currentCount + 1} / ${this.state.ending.count}`);
                await this.setTitle(`Round ${this.state.currentCount + 1} / ${this.state.ending.count}`);
            }

            this.state.currentCount++;
        } catch (e) {
            this.debugTitle(this.state, "onLineEvent#error", e.message);
        }
    }

    async run() {
        await this.setTitle("Round", this.state.currentCount, this.state.ending.count);

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


