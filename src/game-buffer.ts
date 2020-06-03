import { Buffer } from "neovim";

import { wait } from "./wait";
import { join } from "./log";

export type LinesCallback = (args: any[]) => void;

export function getEmptyLines(len: number): string[] {
    return new Array(len).fill("");
}

export class GameBuffer {
    private instructions!: string[];
    private linesCallback?: LinesCallback;
    private listenLines: LinesCallback;

    constructor(private buffer: Buffer,
                public lineLength: number) {

        this.instructions = [];

        this.listenLines = (args: any[]) => {
            if (this.linesCallback) {
                this.linesCallback(args);
            }
        };

        this.buffer.listen("lines", this.listenLines);
    }

    public async getGameLines(): Promise<string[]> {
        const len = await this.buffer.length;
        return await this.buffer.getLines({
            start: this.getInstructionOffset(),
            end: len,
            strictIndexing: false
        });
    }

    public pickRandomLine(): number {
        return ~~(Math.random() * this.lineLength);
    }

    // TODO: I ackshually hate this.
    public midPointRandomPoint(high: boolean, padding = 0): number {
        const midPoint = this.getMidpoint();
        let line: number;
        do {
            line = this.pickRandomLine();
        } while (
            (high && line - padding > midPoint) ||
            (!high && line + padding < midPoint)
        );
        return line;
    }

    public getInstructionOffset(): number {
        return 1 + this.instructions.length;
    }

    public onLines(cb: LinesCallback): void {
        this.linesCallback = cb;
    }

    public setInstructions(instr: string[]): void {
        this.instructions = instr;
    }

    public async finish(): Promise<void> {
        this.linesCallback = undefined;
        this.buffer.off("lines", this.listenLines);
    }

    public getMidpoint(): number {
        // TODO: Brandon? Games should define their own lengths that they need
        return Math.floor(this.lineLength / 2);
    }

    public async render(lines: string[]): Promise<void> {
        const len = await this.buffer.length;
        const expectedLen = this.getTotalLength(lines);
        if (len < expectedLen + 1) {
            await this.buffer.insert(
                new Array(expectedLen - len).fill(""),
                len
            );
        }

        const toRender = [...this.instructions, ...lines].filter(
            x => x !== null && x !== undefined
        );

        await this.buffer.setLines(toRender, {
            start: 1,
            end: expectedLen,
            strictIndexing: true
        });
    }

    public async clearBoard(): Promise<void> {
        const len = await this.buffer.length;

        this.render(getEmptyLines(len));
    }

    public async debugTitle(...title: any[]): Promise<void> {
        await this.setTitle(...title);
        await wait(1000);
    }

    public async setTitle(...title: any[]): Promise<void> {
        await this.buffer.setLines(join(...title), {
            start: 0,
            end: 1
        });
    }

    protected getTotalLength(lines: string[]): number {
        return lines.length + this.instructions.length + 1;
    }
};

