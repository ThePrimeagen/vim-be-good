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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const types_1 = require("./types");
const wait_1 = __importDefault(require("../wait"));
const log_1 = require("../log");
// this is a comment
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
exports.extraWords = [
    "aar",
    "bar",
    "car",
    "dar",
    "ear",
    "far",
    "gar",
    "har",
    "iar",
    "jar",
    "kar",
    "lar",
    "mar",
    "nar",
    "oar",
    "par",
    "qar",
    "rar",
    "sar",
    "tar",
    "uar",
    "var",
    "war",
    "xar",
    "yar",
    "zar",
];
function getRandomWord() {
    return exports.extraWords[Math.floor(Math.random() * exports.extraWords.length)];
}
exports.getRandomWord = getRandomWord;
class BaseGame {
    constructor(nvim, state, opts = {
        difficulty: types_1.GameDifficulty.Easy
    }) {
        this.state = state;
        this.nvim = nvim;
        this.listenLines = (args) => {
            if (this.linesCallback) {
                this.linesCallback(args);
            }
        };
        this.state.buffer.listen("lines", this.listenLines);
    }
    onLines(cb) {
        this.linesCallback = cb;
    }
    finish() {
        fs.writeFileSync("/tmp/relative-" + Date.now(), this.state.results.map(x => x + "\n").join(','));
        this.linesCallback = undefined;
        this.state.buffer.off("lines", this.listenLines);
    }
    pickRandomLine() {
        return ~~(this.state.lineRange.start + Math.random() * this.state.lineLength);
    }
    midPointRandomPoint(midPoint, high, padding = 0) {
        let line;
        do {
            line = this.pickRandomLine();
        } while (high && (line + padding) > midPoint ||
            !high && (line + padding) < midPoint);
        return line;
    }
    debugTitle(...title) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setTitle(...title);
            yield wait_1.default(1000);
        });
    }
    setTitle(...title) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.state.buffer.
                setLines(log_1.join(...title), {
                start: 0,
                end: 1
            });
        });
    }
}
exports.BaseGame = BaseGame;
