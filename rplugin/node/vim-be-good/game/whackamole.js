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
class WhackAMoleGame extends base_1.BaseGame {
    constructor(nvim, buffer, state, opts) {
        super(nvim, buffer, state, opts);
        this.instructionLines = [
            "How to Play:",
            "------------",
            "",
            "Use vim movements to locate the character with the arrow under it as ",
            "quickly as possible. Then invert the character's case to win."
        ];
        this.outputStartRow = 2;
        this.winLine = "";
    }
    // I think I could make this all abstract...
    hasFailed() {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const sentence = base_1.getRandomSentence();
            const chosenLocation = Math.floor(Math.random() * sentence.length);
            const pointerLine = sentence
                .split("")
                .map((_, index) => (index === chosenLocation ? "^" : " "))
                .join("");
            this.winLine = this.createWinLine(sentence, chosenLocation);
            yield this.state.buffer.setLines([...this.instructionLines, "", sentence, pointerLine], {
                start: this.outputStartRow,
                strictIndexing: true
            });
            this.state.window.cursor = [
                this.instructionLines.length + this.outputStartRow + 1,
                0
            ];
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            const len = yield this.state.buffer.length;
            yield this.state.buffer.remove(0, len, true);
            yield this.state.buffer.insert(new Array(this.state.lineRange.end).fill(""), 0);
        });
    }
    gameOver() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.clear();
        });
    }
    checkForWin() {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield this.state.buffer.getLines({
                start: this.instructionLines.length + this.outputStartRow + 1,
                end: this.instructionLines.length + this.outputStartRow + 2,
                strictIndexing: false
            });
            return lines[0] === this.winLine;
        });
    }
    createWinLine(sentence, targetColumn) {
        const preTargetChar = sentence.slice(0, targetColumn);
        const postTargetChar = sentence.slice(targetColumn + 1);
        let targetChar = sentence[targetColumn];
        if (/[a-z]/.test(targetChar)) {
            targetChar = targetChar.toUpperCase();
        }
        else {
            targetChar = targetChar.toLowerCase();
        }
        return preTargetChar + targetChar + postTargetChar;
    }
}
exports.WhackAMoleGame = WhackAMoleGame;
