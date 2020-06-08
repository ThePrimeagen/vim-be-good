"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameDifficulty;
(function (GameDifficulty) {
    GameDifficulty["Easy"] = "easy";
    GameDifficulty["Medium"] = "medium";
    GameDifficulty["Hard"] = "hard";
    GameDifficulty["Nightmare"] = "nightmare";
    GameDifficulty["TPope"] = "tpope";
})(GameDifficulty = exports.GameDifficulty || (exports.GameDifficulty = {}));
var RoundStatus;
(function (RoundStatus) {
    RoundStatus[RoundStatus["Playing"] = 0] = "Playing";
    RoundStatus[RoundStatus["Failed"] = 1] = "Failed";
    RoundStatus[RoundStatus["Won"] = 2] = "Won";
})(RoundStatus = exports.RoundStatus || (exports.RoundStatus = {}));
function difficultyToTime(diff) {
    let out = 1000;
    switch (diff) {
        case GameDifficulty.Easy:
            out = 5000;
            break;
        case GameDifficulty.Medium:
            out = 3500;
            break;
        case GameDifficulty.Hard:
            out = 2500;
            break;
        case GameDifficulty.Nightmare:
            out = 1600;
            break;
    }
    return out;
}
exports.difficultyToTime = difficultyToTime;
function parseGameDifficulty(diff, defaultValue = GameDifficulty.Easy) {
    let difficulty = defaultValue;
    switch (diff) {
        case "easy":
            difficulty = GameDifficulty.Easy;
            break;
        case "medium":
            difficulty = GameDifficulty.Medium;
            break;
        case "hard":
            difficulty = GameDifficulty.Hard;
            break;
        case "nightmare":
            difficulty = GameDifficulty.Nightmare;
            break;
    }
    return difficulty;
}
exports.parseGameDifficulty = parseGameDifficulty;
