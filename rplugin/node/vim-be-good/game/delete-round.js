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
const deleteRoundInstructions = [
    'When you see a "DELETE ME", relative jump to it',
    "as fast as possible and delete it.",
    "",
    "",
];
class DeleteRound extends round_1.Round {
    constructor() {
        super();
    }
    getInstructions() {
        return deleteRoundInstructions;
    }
    render(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const high = Math.random() > 0.5;
            const line = game.gameBuffer.midPointRandomPoint(high);
            const lines = new Array(game.state.lineLength).fill("");
            lines[line] = "                              DELETE ME";
            const middlePoint = game.gameBuffer.midPointRandomPoint(!high);
            console.log("relative -- run#rendering", high, middlePoint, game.state.lineLength, lines);
            yield game.nvim.command(`:${String(middlePoint)}`);
            return lines;
        });
    }
    isRoundComplete(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield game.gameBuffer.getGameLines();
            const length = lines.map((l) => l.trim()).join("").length;
            console.log("delete-round#isRoundComplete", length, lines);
            return length === 0;
        });
    }
}
exports.DeleteRound = DeleteRound;
