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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const types_1 = require("./types");
// this is a comment
function newGameState(buffer, window) {
    return {
        buffer,
        name: "",
        failureCount: 0,
        window,
        ending: { count: 10 },
        currentCount: 0,
        lineRange: { start: 2, end: 22 },
        lineLength: 20,
        results: []
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
    "zar"
];
exports.extraSentences = [
    "One is the best Prime Number",
    "Brandon is the best One",
    "I Twitch when I think about the Discord",
    "My dog is also my dawg",
    "The internet is an amazing place full of interesting facts",
    "Did you know the internet crosses continental boundaries using a wire?!",
    "I am out of interesting facts to type here",
    "Others should contribute more sentences to be used in the game"
];
function getRandomWord() {
    return exports.extraWords[Math.floor(Math.random() * exports.extraWords.length)];
}
exports.getRandomWord = getRandomWord;
function getRandomSentence() {
    return exports.extraSentences[Math.floor(Math.random() * exports.extraSentences.length)];
}
exports.getRandomSentence = getRandomSentence;
class BaseGame {
    constructor(nvim, gameBuffer, state, opts = {
        difficulty: types_1.GameDifficulty.Easy
    }) {
        this.nvim = nvim;
        this.gameBuffer = gameBuffer;
        this.state = state;
        this.state = state;
        this.onExpired = [];
        this.difficulty = opts.difficulty;
    }
    render(lines) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.gameBuffer.render(lines);
        });
    }
    finish() {
        return __awaiter(this, void 0, void 0, function* () {
            const fName = `/tmp/${this.state.name}-${Date.now()}.csv`;
            const results = this.state.results.map(x => x + "").join(",\n");
            console.log("base -- finish", fName, results);
            fs.writeFileSync(fName, results);
            yield this.gameBuffer.finish();
        });
    }
    gameOver() {
        return __awaiter(this, void 0, void 0, function* () {
            // no op which can be optionally utilized by subclasses
        });
    }
    startTimer() {
        const time = types_1.difficultyToTime(this.difficulty);
        console.log("base - startTimer", time);
        this.timerId = setTimeout(() => {
            this.onExpired.forEach(cb => cb());
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore I HATE YOU TYPESCRIPT
            this.timerId = 0;
        }, time);
    }
    clearTimer() {
        console.log("base - clearTimer", this.timerId);
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
    }
    onTimerExpired(cb) {
        this.onExpired.push(cb);
    }
}
exports.BaseGame = BaseGame;
