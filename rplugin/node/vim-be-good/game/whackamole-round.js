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
const instructionLines = [
    "How to Play:",
    "------------",
    "",
    "Use vim movements to locate the character with the arrow under it as ",
    "quickly as possible. Then invert the character's case to win.",
    "",
];
class WhackAMoleRound extends round_1.Round {
    constructor() {
        super();
        this.outputStartRow = 2;
        this.winLine = "";
    }
    getInstructions() {
        return instructionLines;
    }
    render(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const sentence = base_1.getRandomSentence();
            let chosenLocation = 0;
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
            yield game.nvim.command(`:${String(instructionLines.length + this.outputStartRow + 1)}`);
            return [sentence, pointerLine];
        });
    }
    isRoundComplete(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield game.gameBuffer.getGameLines();
            console.log("WhackAMoleRound#isRoundComplete", lines.indexOf(this.winLine) !== -1, lines);
            return lines.indexOf(this.winLine) !== -1;
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
exports.WhackAMoleRound = WhackAMoleRound;
