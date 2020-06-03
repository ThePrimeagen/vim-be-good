import { Buffer } from 'neovim';

export class GameBuffer {
    private instructions!: string[];

    constructor(private buffer: Buffer) {
        this.instructions = [];
    }

    setInstructions(instr: string[]): void {
        this.instructions = instr;
    }


    async render(toRender: string[]): Promise<void> {
    }
};

