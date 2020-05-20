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
const types_1 = require("./game/types");
const base_1 = require("./game/base");
const delete_1 = require("./game/delete");
const ci_1 = require("./game/ci");
const whackamole_1 = require("./game/whackamole");
const menu_1 = require("./menu");
// this is a comment
function runGame(game) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (let i = 0; i < 3; ++i) {
                yield game.debugTitle("Game is starting in", String(3 - i), "...");
            }
            yield game.setTitle("Game Started: ", game.state.currentCount + 1, "/", game.state.ending.count);
            yield game.clear();
            yield game.run();
            let start = Date.now();
            let missingCount = 0;
            let used = false;
            function reset() {
                used = false;
                if (missingCount > 0) {
                    missingCount = 0;
                    onLineEvent();
                }
            }
            function onLineEvent() {
                return __awaiter(this, void 0, void 0, function* () {
                    const startOfFunction = Date.now();
                    if (used) {
                        missingCount++;
                        return;
                    }
                    used = true;
                    try {
                        if (!(yield game.checkForWin())) {
                            reset();
                            return;
                        }
                        const failed = yield game.hasFailed();
                        if (!failed) {
                            game.state.results.push(startOfFunction - start);
                        }
                        if (game.state.currentCount >= game.state.ending.count) {
                            yield game.gameOver();
                            const gameCount = game.state.ending.count;
                            const title = [
                                `Success: ${gameCount - game.state.failureCount} / ${gameCount}`,
                            ];
                            if (game.state.results.length > 0) {
                                title.push(`Average Success Time!: ${game.state.results.reduce((x, y) => x + y, 0) / game.state.results.length}`);
                            }
                            else {
                                title.push(`You didn't even have one success, maybe you should lower the difficulty...`);
                            }
                            yield game.setTitle(title.join(' '));
                            game.finish();
                            return;
                        }
                        else {
                            yield game.setTitle(`Round ${game.state.currentCount + 1} / ${game.state.ending.count}`);
                        }
                        game.state.currentCount++;
                        yield game.clear();
                        yield game.run();
                        start = Date.now();
                    }
                    catch (e) {
                        game.debugTitle("onLineEvent#error", e.message);
                    }
                    reset();
                });
            }
            game.onLines(onLineEvent);
            game.onTimerExpired(() => {
                console.log("Index#onTimerExpired!");
                onLineEvent();
            });
        }
        catch (err) {
            yield game.nvim.outWrite(`Failure ${err}\n`);
        }
    });
}
exports.runGame = runGame;
function initializeGame(name, difficulty, nvim, state) {
    let game = null;
    if (name === "relative") {
        game = new delete_1.DeleteGame(nvim, state, { difficulty });
    }
    else if (name === "ci{") {
        game = new ci_1.CiGame(nvim, state, { difficulty });
    }
    else if (name === "whackamole") {
        game = new whackamole_1.WhackAMoleGame(nvim, state, { difficulty });
    }
    if (game) {
        runGame(game);
    }
    ;
}
exports.initializeGame = initializeGame;
const availableGames = ["relative", "ci{", "whackamole"];
const availableDifficulties = [
    "easy", "medium", "hard", "nightmare", "tpope"
];
const stringToDiff = {
    easy: types_1.GameDifficulty.Easy,
    medium: types_1.GameDifficulty.Medium,
    hard: types_1.GameDifficulty.Hard,
    nightmare: types_1.GameDifficulty.Nightmare,
    tpope: types_1.GameDifficulty.TPope,
};
function getGameState(nvim) {
    return __awaiter(this, void 0, void 0, function* () {
        return base_1.newGameState(yield nvim.buffer, yield nvim.window);
    });
}
exports.getGameState = getGameState;
function default_1(plugin) {
    plugin.setOptions({
        dev: true,
        alwaysInit: true,
    });
    plugin.registerCommand("VimBeGood", (args) => __awaiter(this, void 0, void 0, function* () {
        try {
            const buffer = yield plugin.nvim.buffer;
            const length = yield buffer.length;
            const lines = yield buffer.getLines({
                start: 0,
                end: length,
                strictIndexing: true
            });
            const lengthOfLines = lines.reduce((acc, x) => acc + x, "").trim().length;
            if (lengthOfLines > 0) {
                plugin.nvim.errWriteLine("Your file is not empty.");
                return;
            }
            let difficulty = types_1.parseGameDifficulty(args[1]);
            const state = yield getGameState(plugin.nvim);
            if (availableGames.indexOf(args[0]) >= 0) {
                state.name = args[0];
                initializeGame(args[0], difficulty, plugin.nvim, state);
            }
            // TODO: ci?
            else {
                const menu = yield menu_1.Menu.build(plugin, availableGames, availableDifficulties, difficulty);
                menu.onGameSelection((gameName, difficulty) => __awaiter(this, void 0, void 0, function* () {
                    state.name = gameName;
                    initializeGame(gameName, stringToDiff[difficulty], plugin.nvim, state);
                }));
                menu.render();
                return;
            }
        }
        catch (e) {
            yield plugin.nvim.outWrite("Error#" + args + " " + e.message);
        }
    }), { sync: false, nargs: "*" });
}
exports.default = default_1;
;
