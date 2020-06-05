"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class Round {
    getTimeoutTime(diff) {
        let out = 1000;
        switch (diff) {
            case types_1.GameDifficulty.Easy:
                out = 5000;
                break;
            case types_1.GameDifficulty.Medium:
                out = 3500;
                break;
            case types_1.GameDifficulty.Hard:
                out = 2500;
                break;
            case types_1.GameDifficulty.Nightmare:
                out = 1600;
                break;
        }
        console.log("WhackAMoleRound#getTimeoutTime", out);
        return out;
    }
    isTimedRound() {
        return true;
    }
}
exports.Round = Round;
