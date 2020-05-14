import { Neovim } from 'neovim';
import { GameState, GameOptions } from './types';
import { getRandomWord, BaseGame } from './base';

export class CiGame extends BaseGame {
    private currentRandomWord: string;
    private ifStatment: boolean = false;
    constructor(nvim: Neovim, state: GameState, opts?: GameOptions) {
        super(nvim, state, opts);
        this.currentRandomWord = "";
        this.ifStatment = false;
        this.setInstructions([
            "Replace the outer container (if (...) { ... } or [ ... ]) with \"bar\"",
            "",
            "e.g.:",
            "[                    [",
            "   item1,            bar",
            "   item1,       ->   ]",
            "   item1,",
            "   item1,",
            "]",
        ]);
    }

    async run() {
        const high = Math.random() > 0.5;
        const line = this.midPointRandomPoint(high, 6);
        const lines = new Array(this.state.lineLength).fill("");

        this.currentRandomWord = getRandomWord();

        this.ifStatment = false;
        if (Math.random() > 0.5) {
            lines[line] = `if (${this.currentRandomWord}) {`;
            lines[line + 1] = ``;
            lines[line + 2] = `    if (${getRandomWord()}) { `;
            lines[line + 3] = `        ${getRandomWord()}`;
            lines[line + 4] = `    }`;
            lines[line + 5] = `}`;
            this.ifStatment = true;
        }
        else {
            lines[line] = `[`;
            lines[line + 1] = `    ${getRandomWord()},`;
            lines[line + 2] = `    ${getRandomWord()},`;
            lines[line + 3] = `    ${getRandomWord()},`;
            lines[line + 4] = `    ${getRandomWord()},`;
            lines[line + 5] = `]`;
        }

        const jumpPoint = this.midPointRandomPoint(!high);
        await this.nvim.command(`:${String(jumpPoint)}`);
        this.render(lines);
    }

    async clear() {
        const len = await this.state.buffer.length;
        await this.state.buffer.remove(0, len, true);
        await this.state.buffer.insert(new Array(this.state.lineRange.end).fill(""), 0);
        await this.nvim.command("normal!<C-[>");
    }

    async checkForWin(): Promise<boolean> {
        const lines = await this.state.buffer.getLines({
            start: this.getInstructionOffset(),
            end: await this.state.buffer.length,
            strictIndexing: false
        });

        const contents = lines.map(l => l.trim()).join("");

        return this.ifStatment && contents.toLowerCase() === `if (${this.currentRandomWord}) {bar}` ||
            contents.toLowerCase() === `[bar]`;
    }
}

