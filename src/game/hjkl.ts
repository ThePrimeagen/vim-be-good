import { Round } from "./round";
import { IGame } from "./types";

const instructions = [
    "Remove the x with using only h,j,k,l, and x.  Remember, this is for you to be better.",
    "Using the arrow keys only makes you dumber.  Trust me.  I am a scientist",
    "",
    "",
];

export class HjklRound extends Round {
    private cY!: number;
    private cX!: number;

    constructor() {
        super();
    }

    getInstructions(): string[] {
        return instructions;
    }

    getRando(count = 4): number {
        return (Math.random() * count) | 0;
    }

    // The goal is to make a required 4 keypresses to get to the x
    async render(game: IGame): Promise<string[]> {
        const out: string[][] = [
            '    '.split(''),
            '    '.split(''),
            '    '.split(''),
        ];

        let xX: number;
        let xY: number;
        let cX: number;
        let cY: number;

        do {
            xX = this.getRando();
            xY = this.getRando(3);
            cX = this.getRando();
            cY = this.getRando(3);
        } while (xX === cX || xY === cY);

        out[xY][xX] = 'x';

        console.log("hjkl Render", [xX, xY], [cX, cY]);

        this.cY = cY;
        this.cX = cX;

        return out.map(l => l.join(''));
    }

    public async postRender(game: IGame): Promise<void> {

        console.log("hjkl Render: Setting Position", this.cY + game.gameBuffer.getOffset() + 1);
        console.log("hjkl Render: norm!_");
        console.log(`hjkl Render: :norm!${this.cX}h`);

        await game.nvim.command(`:${this.cY + game.gameBuffer.getOffset() + 1}`);
        await game.nvim.command(`:norm!_`);
        await game.nvim.command(`:norm!${this.cX}h`);
    }

    async isRoundComplete(game: IGame): Promise<boolean> {
        const lines = await game.gameBuffer.getGameLines();
        const contents = lines.map((l) => l.trim()).join("");

        return contents.length === 0;
    }
}
