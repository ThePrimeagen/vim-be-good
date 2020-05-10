import { Neovim, NvimPlugin, Buffer } from 'neovim';
import wait from './wait';

export type GameState = {
    buffer: Buffer;
    ending: {count: number};
    currentCount: number;
    lineRange: {
        start: number,
        end: number
    };
    lineLength: number;
    results: number[];
}

export async function log(nvim: Neovim, ...args: (string | number)[]) {
    await nvim.outWrite(join(...args));
}

export class DeleteGame {
    private state: GameState;
    private nvim: Neovim;

    constructor(nvim: Neovim, state: GameState) {
        this.state = state;
        this.nvim = nvim;
    }

    private pickRandomLine(): number {
        return ~~(this.state.lineRange.start + Math.random() * this.state.lineLength);
    }

    private midPointRandomPoint(midPoint: number, high: boolean) {
        let line: number;
        do {
            line = this.pickRandomLine();
        } while (high && line > midPoint ||
                 !high && line < midPoint);
        return line;
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

    async write(...args: (string | number)[]) {
        log(this.nvim, ...args);
    }

    async checkForWin(state: GameState): Promise<boolean> {
        const lines = await state.buffer.getLines({
            start: state.lineRange.start,
            end: await state.buffer.length,
            strictIndexing: false
        });

        const length = lines.map(l => l.trim()).join('').length;
        return length === 0;
    }
}

export function join(...args: any[]): string {
    return args.
        map(x => typeof x === 'object' ? JSON.stringify(x) : x).
        join(' ');
}

async function debugTitle(state: GameState, ...title: any[]) {
    await setTitle(state, ...title);
    await wait(1000);
}

async function setTitle(state: GameState, ...title: any[]) {
    await state.buffer.
        setLines(
            join(...title), {
                start: 0,
                end: 1
            });
}

export function newGameState(buffer: Buffer): GameState {
    return {
        buffer,
        ending: { count: 10 },
        currentCount: 0,
        lineRange: {start: 2, end: 22},
        lineLength: 20,
        results: [],
    }
}

export async function runDeleteGame(nvim: Neovim) {
    try {
        await log(nvim, "Does this work?");
        const bufferOutOfMyMind = await nvim.buffer;
        const state = newGameState(bufferOutOfMyMind);

        for (let i = 0; i < 3; ++i) {
            await debugTitle(state, "Game is starting in", String(3 - i), "...");
        }

        const game = new DeleteGame(nvim, state);
        await setTitle(state, "Game Started: ", state.currentCount + 1, "/", state.ending.count);
        await game.clear();
        await game.run();
        let start = Date.now();

        let missingCount = 0;
        let used = false;
        function reset() {
            used = false;
            if (missingCount > 0) {
                missingCount = 0;
                onLineEvent([]);
            }
        }
        async function onLineEvent(...args: any[]) {
            const startOfFunction = Date.now();

            if (used) {
                missingCount++;
                return;
            }

            used = true;
            try {
                if (!(await game.checkForWin(state))) {
                    reset();
                    return;
                }

                state.results.push(startOfFunction - start);
                if (state.currentCount >= state.ending.count) {
                    console.log("Results");
                    state.results.forEach(x => console.log(x));
                    await setTitle(state, `Average!: ${state.results.reduce((x, y) => x + y, 0) / state.results.length}`);
                    bufferOutOfMyMind.off("lines", onLineEvent);
                    return;
                }
                else {
                    console.log("setTitle", `Round ${state.currentCount + 1} / ${state.ending.count}`);
                    await setTitle(state, `Round ${state.currentCount + 1} / ${state.ending.count}`);
                }

                state.currentCount++;

                await game.clear();
                await game.run();
                start = Date.now();
            } catch (e) {
                debugTitle(state, "onLineEvent#error", e.message);
            }
            reset();
        }

        bufferOutOfMyMind.listen("lines", onLineEvent);
    } catch (err) {
        await nvim.outWrite(`Failure ${err}\n`);
    }
}

export async function setRepl() {
    //@ts-ignore
    require('neovim/scripts/nvim').then((n) => global.nvim = n)
}

module.exports = (plugin: NvimPlugin) => {
    plugin.setOptions({
        dev: true,
        alwaysInit: true,
    });

    plugin.registerCommand('VimBeGood2', async (args: string[]) => {
        try {
            if (args[0] === "relative") {
                runDeleteGame(plugin.nvim);
            }
            else {
                await plugin.nvim.outWrite('You did not do anything ' + args + '\n');
                await wait(1000);
                await plugin.nvim.outWrite('type of args = ' + typeof args + '\n');
            }
        } catch (e) {
            await plugin.nvim.outWrite("Error#" + args + " " + e.message);
        }
    }, { sync: false, nargs: "*" });
};
