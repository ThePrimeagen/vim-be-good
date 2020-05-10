import { Neovim, Buffer } from "neovim";
import { GameState } from "./types";
import { log, join } from "./log";
import wait from "../wait";

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

export abstract class BaseGame {
    // @ts-ignore
    public state: GameState;

    public nvim: Neovim;

    // @ts-ignore
    public buffer: Buffer;

    protected args: string[];
    protected onDetach?: () => Promise<void>;

    protected res?: (any?: any[]) => void;
    protected rej?: (any?: any[]) => void;

    // @ts-ignore
    private detachListener: () => Promise<void>;
    // @ts-ignore
    private linesListener: (...args: any[]) => Promise<void>;

    private roundStart: number;

    constructor(nvim: Neovim, args: string[]) {
        this.nvim = nvim;
        this.args = args;
        this.init();
        this.roundStart = 0;
    }

    private async init() {
        this.buffer = await this.nvim.buffer;

        this.state = newGameState(this.buffer);
        this.detachListener = async function detach() {
            // TODO: Alert something?
            if (this.onDetach) {
                this.onDetach();
            }
        };
        this.state.buffer.listen("detach", this.detachListener);

        let missedChanges = 0;
        let used = false;

        async function handleLineChange(...args: any[]) {
            if (used) {
                missedChanges++;
                return;
            }

            used = true;

            // @ts-ignore
            if (this.onLineChange) {
                // @ts-ignore
                await this.onLineChange(...args);

                if (missedChanges) {
                    missedChanges = 0;
                    used = false;
                    handleLineChange([]);
                }

            }

            used = false;
        }

        this.linesListener = handleLineChange.bind(this);
        this.state.buffer.listen("lines", this.linesListener);
    }

    abstract onLineChange: (...args: any[]) => Promise<void>;

    protected pickRandomLine(): number {
        return ~~(this.state.lineRange.start + Math.random() * this.state.lineLength);
    }

    protected midPointRandomPoint(midPoint: number, high: boolean) {
        let line: number;
        do {
            line = this.pickRandomLine();
        } while (high && line > midPoint ||
                 !high && line < midPoint);
        return line;
    }

    async start() {
        for (let i = 0; i < 3; ++i) {
            await this.debugTitle("Game is starting in", String(3 - i), "...");
        }

        while (!this.isFinished()) {
            this.clear();
            this.run();
            this.startTimer();

            // TODO: probably use a generator
            await (new Promise((res, rej) => {
                this.res = res;
                this.rej = rej;
            }));
        }
    }

    startTimer() {
        this.roundStart = Date.now();
    }

    abstract async run();
    abstract async clear();

    abstract async checkForWin(state: GameState): Promise<boolean>;

    stopListening() {
        this.state.buffer.off("lines", this.linesListener);
        this.state.buffer.on("lines", this.detachListener);
    }

    finishRound(time = Date.now()) {
        this.state.currentCount++;
        this.state.results.push(time - this.roundStart);
    }

    isFinished() {
        return this.state.currentCount >= this.state.ending.count;
    }

    async debugTitle(...title: any[]) {
        await this.setTitle(...title);
        await wait(1000);
    }

    async setTitle(...title: any[]) {
        await this.state.buffer.
            setLines(
                join(...title), {
                    start: 0,
                    end: 1
                });
    }
}

