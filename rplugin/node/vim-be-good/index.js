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
const delete_round_1 = require("./game/delete-round");
const base_1 = require("./game/base");
const game_buffer_1 = require("./game-buffer");
const menu_1 = require("./menu");
// this is a comment
function runGame(game) {
    return __awaiter(this, void 0, void 0, function* () {
        const nvim = game.nvim;
        const buffer = game.gameBuffer;
        ;
        console.log("runGame -- Game is starting");
        try {
            for (let i = 0; i < 3; ++i) {
                console.log("runGame -- Game is starting in", String(3 - i));
                yield buffer.debugTitle("Game is starting in", String(3 - i), "...");
            }
            // TODO: this should stop here.  this seems all sorts of wrong
            yield buffer.setTitle("Game Started: ", game.state.currentCount + 1, "/", game.state.ending.count);
            console.log("runGame -- Round 1 of", game.state.ending.count);
            yield game.gameBuffer.clearBoard();
            yield game.startRound();
            yield game.run(true);
            let start = Date.now();
            let missingCount = 0;
            let used = false;
            // eslint-disable-next-line no-inner-declarations
            function reset() {
                console.log("runGame -- reset");
                used = false;
                if (missingCount > 0) {
                    console.log("runGame -- reset -- missing line event", missingCount);
                    missingCount = 0;
                    onLineEvent();
                }
            }
            // eslint-disable-next-line no-inner-declarations
            function onLineEvent() {
                return __awaiter(this, void 0, void 0, function* () {
                    const startOfFunction = Date.now();
                    if (used) {
                        missingCount++;
                        return;
                    }
                    used = true;
                    try {
                        const checkForWin = yield game.checkForWin();
                        console.log("runGame -- checking for win", checkForWin);
                        if (!checkForWin) {
                            reset();
                            return;
                        }
                        const failed = yield game.hasFailed();
                        console.log("runGame -- checking for failed", failed);
                        if (!failed) {
                            game.state.results.push(startOfFunction - start);
                        }
                        console.log("runGame -- End of game?", game.state.currentCount >= game.state.ending.count);
                        if (game.state.currentCount >= game.state.ending.count) {
                            const gameCount = game.state.ending.count;
                            const title = [
                                `Success: ${gameCount - game.state.failureCount} / ${gameCount}`,
                            ];
                            if (game.state.results.length > 0) {
                                title.push(`Average Success Time!: ${game.state.results.reduce((x, y) => x + y, 0) /
                                    game.state.results.length}`);
                            }
                            else {
                                title.push(`You didn't even have one success, maybe you should lower the difficulty...`);
                            }
                            yield buffer.setTitle(title.join(" "));
                            game.finish();
                            return;
                        }
                        else {
                            console.log(`Round ${game.state.currentCount + 1} / ${game.state.ending.count}`);
                            yield buffer.setTitle(`Round ${game.state.currentCount + 1} / ${game.state.ending.count}`);
                        }
                        console.log("Index -- Incrementing currentCount", game.state.currentCount, game.state.currentCount + 1);
                        game.state.currentCount++;
                        console.log("Index -- ending game round");
                        yield game.endRound();
                        console.log("Index -- Starting round");
                        yield game.startRound();
                        console.log("Index -- Run game false");
                        yield game.run(false);
                        start = Date.now();
                    }
                    catch (e) {
                        buffer.debugTitle("onLineEvent#error", e.message);
                    }
                    reset();
                });
            }
            buffer.onLines(onLineEvent);
            game.onTimerExpired(() => {
                console.log("Index#onTimerExpired!");
                onLineEvent();
            });
        }
        catch (err) {
            yield nvim.outWrite(`Failure ${err}\n`);
        }
    });
}
exports.runGame = runGame;
function initializeGame(name, difficulty, nvim, buffer, window, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let roundSet = [];
        let gameBuffer = new game_buffer_1.GameBuffer(buffer, state.lineLength);
        if (name === "relative") {
            roundSet.push(new delete_round_1.DeleteRound());
            /*
        } else if (name === "ci{") {
            game = new CiGame(nvim, gameBuffer, state, { difficulty });
        } else if (name === "whackamole") {
            game = new WhackAMoleGame(nvim, gameBuffer, state, { difficulty });
            */
        }
        if (roundSet.length) {
            runGame(new base_1.Game(nvim, gameBuffer, state, roundSet, { difficulty }));
        }
    });
}
exports.initializeGame = initializeGame;
//const availableGames = ["relative", "ci{", "whackamole"];
const availableGames = ["relative"];
const availableDifficulties = ["easy", "medium", "hard", "nightmare", "tpope"];
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
function createFloatingWindow(nvim) {
    return __awaiter(this, void 0, void 0, function* () {
        let rowSize = yield nvim.window.height;
        let columnSize = yield nvim.window.width;
        let width = Math.min(columnSize - 4, Math.max(80, columnSize - 20));
        let height = Math.min(rowSize - 4, Math.max(30, rowSize - 10));
        let top = ((rowSize - height) / 2) - 1;
        let left = ((columnSize - width) / 2);
        // Create a scratch buffer
        const buffer = (yield nvim.createBuffer(false, true));
        let window = yield nvim.openWindow(buffer, true, {
            relative: 'editor',
            row: top,
            col: left,
            width: width,
            height: height
        });
        // TODO: I don't think this is the way to do this, but lets find out.
        if (typeof window === "number") {
            window = yield nvim.window;
        }
        return { buffer, window };
    });
}
exports.createFloatingWindow = createFloatingWindow;
function createPlugin(plugin) {
    plugin.setOptions({
        dev: true,
        alwaysInit: true,
    });
    plugin.registerCommand("VimBeGood", (args) => __awaiter(this, void 0, void 0, function* () {
        try {
            const useCurrentBuffer = Number(yield plugin.nvim.getVar("vim_be_good_floating")) === 0;
            let buffer;
            let window;
            if (useCurrentBuffer) {
                buffer = yield plugin.nvim.buffer;
                window = yield plugin.nvim.window;
            }
            else {
                const bufAndWindow = yield createFloatingWindow(plugin.nvim);
                buffer = bufAndWindow.buffer;
                window = bufAndWindow.window;
            }
            const difficulty = types_1.parseGameDifficulty(args[1]);
            const state = yield getGameState(plugin.nvim);
            if (availableGames.indexOf(args[0]) >= 0) {
                state.name = args[0];
                yield initializeGame(args[0], difficulty, plugin.nvim, buffer, window, state);
            }
            // TODO: ci?
            else {
                const menu = yield menu_1.Menu.build(plugin, availableGames, availableDifficulties, difficulty);
                menu.onGameSelection((gameName, difficulty) => __awaiter(this, void 0, void 0, function* () {
                    state.name = gameName;
                    yield initializeGame(gameName, stringToDiff[difficulty], plugin.nvim, buffer, window, state);
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
exports.default = createPlugin;
