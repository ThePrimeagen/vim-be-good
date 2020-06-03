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
const game_buffer_1 = require("../game-buffer");
const base_1 = require("./base");
// this is a comment
class DeleteGame extends base_1.BaseGame {
    constructor(nvim, buffer, state, opts) {
        super(nvim, buffer, state, opts);
        this.failed = false;
        this.gameBuffer.setInstructions([
            'When you see a "DELETE ME", relative jump to it',
            "as fast as possible and delete it.",
            "",
            ""
        ]);
        this.onTimerExpired(() => __awaiter(this, void 0, void 0, function* () {
            console.log("DeleteGame#onTimerExpired!");
            this.state.failureCount++;
            this.failed = true;
        }));
    }
    hasFailed() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.failed;
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const high = Math.random() > 0.5;
            const line = this.gameBuffer.midPointRandomPoint(high);
            const lines = new Array(this.state.lineLength).fill("");
            lines[line] = "                              DELETE ME";
            yield this.nvim.command(`:${String(this.gameBuffer.midPointRandomPoint(!high))}`);
            yield this.render(lines);
            this.startTimer();
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            this.failed = false;
            this.clearTimer();
            yield this.render(game_buffer_1.getEmptyLines(this.state.lineLength));
        });
    }
    checkForWin() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.failed) {
                return true;
            }
            const lines = yield this.state.buffer.getLines({
                start: this.gameBuffer.getInstructionOffset(),
                end: yield this.state.buffer.length,
                strictIndexing: false
            });
            const length = lines.map(l => l.trim()).join("").length;
            return length === 0;
        });
    }
}
exports.DeleteGame = DeleteGame;
