import { Neovim } from "neovim";
import { GameBuffer } from "../game-buffer";
import { GameState, GameOptions } from "./types";
import { getRandomWord, BaseGame } from "./base";

export class CiGame extends BaseGame {
    private currentRandomWord: string;
    private ifStatment = false;
    constructor(nvim: Neovim, buffer: GameBuffer, state: GameState, opts?: GameOptions) {
        super(nvim, buffer, state, opts);
        this.currentRandomWord = "";
        this.ifStatment = false;
        this.gameBuffer.setInstructions([
            'Replace the outer container (if (...) { ... } or [ ... ]) with "bar"',
            "",
            "e.g.:",
            "[                    [",
            "   item1,            bar",
            "   item1,       ->   ]",
            "   item1,",
            "   item1,",
            "]"
        ]);
    }

    // I think I could make this all abstract...
    async hasFailed(): Promise<boolean> {
        return false;
    }

    async run(): Promise<void> {
        const high = Math.random() > 0.5;
        const line = this.gameBuffer.midPointRandomPoint(high, 6);
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
        } else {
            lines[line] = `[`;
            lines[line + 1] = `    ${getRandomWord()},`;
            lines[line + 2] = `    ${getRandomWord()},`;
            lines[line + 3] = `    ${getRandomWord()},`;
            lines[line + 4] = `    ${getRandomWord()},`;
            lines[line + 5] = `]`;
        }

        const jumpPoint = this.gameBuffer.midPointRandomPoint(!high);
        this.state.window.cursor = [this.gameBuffer.getInstructionOffset() + jumpPoint, 0];
        this.render(lines);
    }

    async clear(): Promise<void> {
        const len = await this.state.buffer.length;
        await this.state.buffer.remove(0, len, true);
        await this.state.buffer.insert(
            new Array(this.state.lineRange.end).fill(""),
            0
        );
        await this.nvim.command("normal!<C-[>");
    }

    async checkForWin(): Promise<boolean> {
        const lines = await this.gameBuffer.getGameLines();
        const contents = lines.map(l => l.trim()).join("");

        return (
            (this.ifStatment &&
                contents.toLowerCase() ===
                    `if (${this.currentRandomWord}) {bar}`) ||
            contents.toLowerCase() === `[bar]`
        );
    }
}
