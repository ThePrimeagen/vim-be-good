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
class DeleteGame extends base_1.BaseGame {
    constructor(nvim, state, opts) {
        super(nvim, state, opts);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const high = Math.random() > 0.5;
            const midPoint = this.state.lineLength / 2 + this.state.lineRange.start;
            const line = this.midPointRandomPoint(midPoint, high);
            const lines = new Array(this.state.lineLength).fill('');
            lines[line] = "                              DELETE ME";
            yield this.nvim.command(`:${String(this.midPointRandomPoint(midPoint, !high))}`);
            yield this.state.buffer.setLines(lines, {
                start: this.state.lineRange.start,
                end: this.state.lineRange.end,
                strictIndexing: true
            });
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            const len = yield this.state.buffer.length;
            yield this.state.buffer.remove(0, len, true);
            yield this.state.buffer.insert(new Array(this.state.lineRange.end).fill(''), 0);
        });
    }
    checkForWin() {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield this.state.buffer.getLines({
                start: this.state.lineRange.start,
                end: yield this.state.buffer.length,
                strictIndexing: false
            });
            const length = lines.map(l => l.trim()).join('').length;
            return length === 0;
        });
    }
}
exports.DeleteGame = DeleteGame;
