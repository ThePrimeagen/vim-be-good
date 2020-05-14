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
// this is a comment
class DeleteGame extends base_1.BaseGame {
    constructor(nvim, state, opts) {
        super(nvim, state, opts);
        this.setInstructions([
            "When you see a \"DELETE ME\", relative jump to it",
            "as fast as possible and delete it.",
            "",
            "",
        ]);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const high = Math.random() > 0.5;
            const line = this.midPointRandomPoint(high);
            const lines = new Array(this.state.lineLength).fill('');
            lines[line] = "                              DELETE ME";
            yield this.nvim.command(`:${String(this.midPointRandomPoint(!high))}`);
            yield this.render(lines);
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.render(base_1.getEmptyLines(this.state.lineLength));
        });
    }
    checkForWin() {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield this.state.buffer.getLines({
                start: this.getInstructionOffset(),
                end: yield this.state.buffer.length,
                strictIndexing: false
            });
            const length = lines.map(l => l.trim()).join('').length;
            return length === 0;
        });
    }
}
exports.DeleteGame = DeleteGame;
