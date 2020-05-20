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
const base_1 = require("./base");
class CiGame extends base_1.BaseGame {
    constructor(nvim, state, opts) {
        super(nvim, state, opts);
        this.ifStatment = false;
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
    // I think I could make this all abstract...
    hasFailed() {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const high = Math.random() > 0.5;
            const line = this.midPointRandomPoint(high, 6);
            const lines = new Array(this.state.lineLength).fill("");
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
            const jumpPoint = this.midPointRandomPoint(!high);
            this.state.window.cursor = [this.getInstructionOffset() + jumpPoint, 0];
            this.render(lines);
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            const len = yield this.state.buffer.length;
            yield this.state.buffer.remove(0, len, true);
            yield this.state.buffer.insert(new Array(this.state.lineRange.end).fill(""), 0);
            yield this.nvim.command("normal!<C-[>");
        });
    }
    checkForWin() {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield this.state.buffer.getLines({
                start: this.getInstructionOffset(),
                end: yield this.state.buffer.length,
                strictIndexing: false
            });
            const contents = lines.map(l => l.trim()).join("");
            return this.ifStatment && contents.toLowerCase() === `if (${this.currentRandomWord}) {bar}` ||
                contents.toLowerCase() === `[bar]`;
        });
    }
}
exports.CiGame = CiGame;
