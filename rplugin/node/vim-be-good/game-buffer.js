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
const wait_1 = require("./wait");
const log_1 = require("./log");
function getEmptyLines(len) {
    return new Array(len).fill("");
}
exports.getEmptyLines = getEmptyLines;
class GameBuffer {
    constructor(buffer, lineLength) {
        this.buffer = buffer;
        this.lineLength = lineLength;
        this.instructions = [];
        this.listenLines = (args) => {
            if (this.linesCallback) {
                this.linesCallback(args);
            }
        };
        this.buffer.listen("lines", this.listenLines);
    }
    getGameLines() {
        return __awaiter(this, void 0, void 0, function* () {
            const len = yield this.buffer.length;
            const allLines = yield this.buffer.getLines({
                start: 0,
                end: len,
                strictIndexing: false,
            });
            const lines = allLines.slice(this.getOffset(), len);
            console.log("GameBuffer#getGameLines", this.getOffset(), len, lines);
            console.log("GameBuffer#getGameLines", allLines);
            return lines;
        });
    }
    pickRandomLine() {
        return ~~(Math.random() * this.lineLength);
    }
    // TODO: I ackshually hate this.
    midPointRandomPoint(high, padding = 0) {
        const midPoint = this.getMidpoint();
        let line;
        do {
            line = this.pickRandomLine();
        } while ((high && line - padding > midPoint) ||
            (!high && line + padding < midPoint));
        return line;
    }
    getOffset() {
        return 1 + this.instructions.length;
    }
    onLines(cb) {
        console.log("GameBuffer#onLines");
        this.linesCallback = cb;
    }
    setInstructions(instr) {
        console.log("GameBuffer#setInstructions", instr);
        this.instructions = instr;
    }
    finish() {
        return __awaiter(this, void 0, void 0, function* () {
            this.linesCallback = undefined;
            this.buffer.off("lines", this.listenLines);
        });
    }
    getMidpoint() {
        // TODO: Brandon? Games should define their own lengths that they need
        return Math.floor(this.lineLength / 2);
    }
    render(lines) {
        return __awaiter(this, void 0, void 0, function* () {
            const len = yield this.buffer.length;
            const expectedLen = this.getTotalLength(lines);
            if (len < expectedLen + 1) {
                yield this.buffer.insert(new Array(expectedLen - len).fill(""), len);
            }
            const toRender = [...this.instructions, ...lines].filter((x) => x !== null && x !== undefined);
            console.log("GameBuffer -- To Render", toRender);
            yield this.buffer.setLines(toRender, {
                start: 1,
                end: expectedLen,
                strictIndexing: true,
            });
        });
    }
    clearBoard() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("GameBuffer#clearBoard");
            const len = yield this.buffer.length;
            yield this.render(getEmptyLines(len));
        });
    }
    debugTitle(...title) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setTitle(...title);
            yield wait_1.wait(1000);
        });
    }
    setTitle(...title) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.buffer.setLines(log_1.join(...title), {
                start: 0,
                end: 1,
            });
        });
    }
    getTotalLength(lines) {
        return lines.length + this.instructions.length + 1;
    }
}
exports.GameBuffer = GameBuffer;
