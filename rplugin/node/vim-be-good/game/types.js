"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameDifficulty;
(function (GameDifficulty) {
    GameDifficulty["Easy"] = "easy";
    GameDifficulty["Medium"] = "medium";
    GameDifficulty["Hard"] = "hard";
    GameDifficulty["Nightmare"] = "nightmare";
})(GameDifficulty = exports.GameDifficulty || (exports.GameDifficulty = {}));
function parseGameDifficulty(diff, defaultValue = GameDifficulty.Easy) {
    let difficulty = defaultValue;
    switch (diff) {
        case 'easy':
            difficulty = GameDifficulty.Easy;
            break;
        case 'medium':
            difficulty = GameDifficulty.Medium;
            break;
        case 'hard':
            difficulty = GameDifficulty.Hard;
            break;
        case 'nightmare':
            difficulty = GameDifficulty.Nightmare;
            break;
    }
    return difficulty;
}
exports.parseGameDifficulty = parseGameDifficulty;
