import { Neovim } from "neovim";
import { GameBuffer } from "../game-buffer";
import { GameState, GameOptions } from "./types";
import { BaseGame, getRandomSentence } from "./base";

export class WhackAMoleGame extends BaseGame {
    private instructionLines = [
        "How to Play:",
        "------------",
        "",
        "Use vim movements to locate the character with the arrow under it as ",
        "quickly as possible. Then invert the character's case to win."
    ];
    private winLine: string;
    private outputStartRow = 2;

    constructor(nvim: Neovim, buffer: GameBuffer, state: GameState, opts?: GameOptions) {
        super(nvim, buffer, state, opts);

        this.winLine = "";
    }

    // I think I could make this all abstract...
    async hasFailed(): Promise<boolean> {
        return false;
    }

    async run(): Promise<void> {
        const sentence = getRandomSentence();
        let chosenLocation: number = 0;

        do {
            const location = Math.floor(Math.random() * sentence.length);

            if (location > 0 && /[A-Za-z]/.test(sentence[location])) {
                chosenLocation = location;
            }
        } while (!chosenLocation);

        const pointerLine = sentence
            .split("")
            .map((_, index) => (index === chosenLocation ? "^" : " "))
            .join("");

        this.winLine = this.createWinLine(sentence, chosenLocation);

        await this.state.buffer.setLines(
            [...this.instructionLines, "", sentence, pointerLine],
            {
                start: this.outputStartRow,
                strictIndexing: true
            }
        );

        this.state.window.cursor = [
            this.instructionLines.length + this.outputStartRow + 1,
            0
        ];
    }

    async clear(): Promise<void> {
        const len = await this.state.buffer.length;
        await this.state.buffer.remove(0, len, true);
        await this.state.buffer.insert(
            new Array(this.state.lineRange.end).fill(""),
            0
        );
    }

    async gameOver(): Promise<void> {
        await this.clear();
    }

    async checkForWin(): Promise<boolean> {
        const lines = await this.state.buffer.getLines({
            start: this.instructionLines.length + this.outputStartRow + 1,
            end: this.instructionLines.length + this.outputStartRow + 2,
            strictIndexing: false
        });

        return lines[0] === this.winLine;
    }

    private createWinLine(sentence: string, targetColumn: number): string {
        const preTargetChar = sentence.slice(0, targetColumn);
        const postTargetChar = sentence.slice(targetColumn + 1);
        let targetChar = sentence[targetColumn];

        if (/[a-z]/.test(targetChar)) {
            targetChar = targetChar.toUpperCase();
        } else {
            targetChar = targetChar.toLowerCase();
        }

        return preTargetChar + targetChar + postTargetChar;
    }
}
