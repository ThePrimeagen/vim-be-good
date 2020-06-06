"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const round_1 = require("./round");
const base_1 = require("./base");
const game_buffer_1 = require("../game-buffer");
const instructions = [
    'Replace the outer container (if (...) { ... } or [ ... ]) with "bar"',
    "",
    "e.g.:",
    "[                    [",
    "   item1,            bar",
    "   item1,       ->   ]",
    "   item1,",
    "   item1,",
    "]"
];
class CiRound extends round_1.Round {
    constructor() {
        super();
        this.ifStatment = false;
    }
    getInstructions() {
        return instructions;
    }
    render(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const high = Math.random() > 0.5;
            const line = game.gameBuffer.midPointRandomPoint(high, 6);
            const lines = game_buffer_1.getEmptyLines(game.state.lineLength);
            this.currentRandomWord = base_1.getRandomWord();
            this.ifStatment = false;
            if (Math.random() > 0.5) {
                lines[line] = `if (${this.currentRandomWord}) {`;
                lines[line + 1] = ``;
                lines[line + 2] = `    if (${base_1.getRandomWord()}) { `;
                lines[line + 3] = `        ${base_1.getRandomWord()}`;
                lines[line + 4] = `    }`;
                lines[line + 5] = `}`;
                this.ifStatment = true;
            }
            else {
                lines[line] = `[`;
                lines[line + 1] = `    ${base_1.getRandomWord()},`;
                lines[line + 2] = `    ${base_1.getRandomWord()},`;
                lines[line + 3] = `    ${base_1.getRandomWord()},`;
                lines[line + 4] = `    ${base_1.getRandomWord()},`;
                lines[line + 5] = `]`;
            }
            const jumpPoint = game.gameBuffer.midPointRandomPoint(!high);
            yield game.nvim.command(`:${String(jumpPoint)}`);
            return lines;
        });
    }
    isRoundComplete(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield game.gameBuffer.getGameLines();
            const contents = lines.map(l => l.trim()).join("");
            return ((this.ifStatment &&
                contents.toLowerCase() ===
                    `if (${this.currentRandomWord}) {bar}`) ||
                contents.toLowerCase() === `[bar]`);
        });
    }
}
exports.CiRound = CiRound;
