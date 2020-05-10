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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wait_1 = __importDefault(require("./wait"));
function log(nvim, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        yield nvim.outWrite(join(...args));
    });
}
exports.log = log;
class DeleteGame {
    constructor(nvim, state) {
        this.state = state;
        this.nvim = nvim;
    }
    pickRandomLine() {
        return ~~(this.state.lineRange.start + Math.random() * this.state.lineLength);
    }
    midPointRandomPoint(midPoint, high) {
        let line;
        do {
            line = this.pickRandomLine();
        } while (high && line > midPoint ||
            !high && line < midPoint);
        return line;
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
    write(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            log(this.nvim, ...args);
        });
    }
    checkForWin(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield state.buffer.getLines({
                start: state.lineRange.start,
                end: yield state.buffer.length,
                strictIndexing: false
            });
            const length = lines.map(l => l.trim()).join('').length;
            return length === 0;
        });
    }
}
exports.DeleteGame = DeleteGame;
function join(...args) {
    return args.
        map(x => typeof x === 'object' ? JSON.stringify(x) : x).
        join(' ');
}
exports.join = join;
function debugTitle(state, ...title) {
    return __awaiter(this, void 0, void 0, function* () {
        yield setTitle(state, ...title);
        yield wait_1.default(1000);
    });
}
function setTitle(state, ...title) {
    return __awaiter(this, void 0, void 0, function* () {
        yield state.buffer.
            setLines(join(...title), {
            start: 0,
            end: 1
        });
    });
}
function newGameState(buffer) {
    return {
        buffer,
        ending: { count: 10 },
        currentCount: 0,
        lineRange: { start: 2, end: 22 },
        lineLength: 20,
        results: [],
    };
}
exports.newGameState = newGameState;
function runDeleteGame(nvim) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield log(nvim, "Does this work?");
            const bufferOutOfMyMind = yield nvim.buffer;
            const state = newGameState(bufferOutOfMyMind);
            for (let i = 0; i < 3; ++i) {
                yield debugTitle(state, "Game is starting in", String(3 - i), "...");
            }
            const game = new DeleteGame(nvim, state);
            yield setTitle(state, "Game Started: ", state.currentCount + 1, "/", state.ending.count);
            yield game.clear();
            yield game.run();
            let start = Date.now();
            let missingCount = 0;
            let used = false;
            function reset() {
                used = false;
                if (missingCount > 0) {
                    missingCount = 0;
                    onLineEvent([]);
                }
            }
            function onLineEvent(...args) {
                return __awaiter(this, void 0, void 0, function* () {
                    const startOfFunction = Date.now();
                    if (used) {
                        missingCount++;
                        return;
                    }
                    used = true;
                    try {
                        if (!(yield game.checkForWin(state))) {
                            reset();
                            return;
                        }
                        state.results.push(startOfFunction - start);
                        if (state.currentCount >= state.ending.count) {
                            console.log("Results");
                            state.results.forEach(x => console.log(x));
                            yield setTitle(state, `Average!: ${state.results.reduce((x, y) => x + y, 0) / state.results.length}`);
                            bufferOutOfMyMind.off("lines", onLineEvent);
                            return;
                        }
                        else {
                            console.log("setTitle", `Round ${state.currentCount + 1} / ${state.ending.count}`);
                            yield setTitle(state, `Round ${state.currentCount + 1} / ${state.ending.count}`);
                        }
                        state.currentCount++;
                        yield game.clear();
                        yield game.run();
                        start = Date.now();
                    }
                    catch (e) {
                        debugTitle(state, "onLineEvent#error", e.message);
                    }
                    reset();
                });
            }
            bufferOutOfMyMind.listen("lines", onLineEvent);
        }
        catch (err) {
            yield nvim.outWrite(`Failure ${err}\n`);
        }
    });
}
exports.runDeleteGame = runDeleteGame;
function setRepl() {
    return __awaiter(this, void 0, void 0, function* () {
        //@ts-ignore
        require('neovim/scripts/nvim').then((n) => global.nvim = n);
    });
}
exports.setRepl = setRepl;
module.exports = (plugin) => {
    plugin.setOptions({
        dev: true,
        alwaysInit: true,
    });
    plugin.registerCommand('VimBeGood2', (args) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (args[0] === "relative") {
                runDeleteGame(plugin.nvim);
            }
            else {
                yield plugin.nvim.outWrite('You did not do anything ' + args + '\n');
                yield wait_1.default(1000);
                yield plugin.nvim.outWrite('type of args = ' + typeof args + '\n');
            }
        }
        catch (e) {
            yield plugin.nvim.outWrite("Error#" + args + " " + e.message);
        }
    }), { sync: false, nargs: "*" });
};
