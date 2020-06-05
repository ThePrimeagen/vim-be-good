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
        currentCount: 1,
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
class Game {
    constructor(nvim, gameBuffer, state, rounds, opts = {
        difficulty: types_1.GameDifficulty.Easy
    }) {
        this.nvim = nvim;
        this.gameBuffer = gameBuffer;
        this.state = state;
        this.rounds = rounds;
        this.onExpired = [];
        this.timerExpired = false;
        this.difficulty = opts.difficulty;
    }
    startRound() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Game#startRound");
            const nextRound = this.rounds[Math.floor(Math.random() * this.rounds.length)];
            if (this.currentRound === nextRound) {
                console.log("Game#startRound currentRound === nextRound");
                return;
            }
            const instructions = nextRound.getInstructions();
            yield this.gameBuffer.clearBoard();
            this.gameBuffer.setInstructions(instructions);
            this.currentRound = nextRound;
        });
    }
    checkForWin() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.currentRound.isRoundComplete(this);
        });
    }
    hasFailed() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Game#hasFailed -> ${this.timerExpired}`);
            return this.timerExpired;
        });
    }
    run(firstRun) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Game#run(${firstRun})`);
            const lines = yield this.currentRound.render(this);
            yield this.gameBuffer.render(lines);
            if (this.currentRound.isTimedRound()) {
                console.log("Game -- run -- starting timer");
                this.startTimer();
            }
        });
    }
    // Anything left to do here?
    endRound() {
        return __awaiter(this, void 0, void 0, function* () {
            this.clearTimer();
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
    startTimer() {
        const time = this.currentRound.getTimeoutTime(this.difficulty);
        console.log("base - startTimer", time);
        this.timerExpired = false;
        this.timerId = setTimeout(() => {
            this.timerExpired = true;
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
        console.log("On timer expired");
        this.onExpired.push(cb);
    }
}
exports.Game = Game;
