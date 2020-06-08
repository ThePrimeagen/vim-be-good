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
const whackamole_round_1 = require("./game/whackamole-round");
const ci_round_1 = require("./game/ci-round");
const vada_1 = require("./game/vada");
const menu_1 = require("./menu");
// this is a comment
function runGame(game) {
    return __awaiter(this, void 0, void 0, function* () {
        const nvim = game.nvim;
        const buffer = game.gameBuffer;
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
                    console.log("runGame -- Starting Line Event");
                    try {
                        console.log("runGame#try Starting State Check");
                        const checkForWin = yield game.checkForWin();
                        console.log("runGame -- game.checkForWin -> ", checkForWin);
                        const failed = yield game.hasFailed();
                        console.log("runGame -- hasFailed ->", failed);
                        if (!checkForWin && !failed) {
                            console.log("checkForWin was false --- resetting");
                            reset();
                            return;
                        }
                        console.log("runGame -- hasFailed ->", failed);
                        if (!failed) {
                            console.log("runGame -- !failed pushing results", startOfFunction - start);
                            game.state.results.push(startOfFunction - start);
                        }
                        console.log("runGame -- End of game?", game.state.currentCount >= game.state.ending.count);
                        console.log("Index -- Incrementing currentCount", game.state.currentCount, game.state.currentCount + 1);
                        game.state.currentCount++;
                        console.log(`Round ${game.state.currentCount} / ${game.state.ending.count}`);
                        yield buffer.setTitle(`Round ${game.state.currentCount} / ${game.state.ending.count}`);
                        if (game.state.currentCount > game.state.ending.count) {
                            const gameCount = game.state.ending.count;
                            const title = [
                                `Success: ${game.state.results.length} / ${gameCount}`,
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
                        console.log("Index -- ending game round");
                        yield game.endRound();
                        console.log("Index -- Starting round");
                        yield game.startRound();
                        yield game.run(false);
                        start = Date.now();
                    }
                    catch (e) {
                        yield buffer.debugTitle("onLineEvent#error", e.message);
                    }
                    console.log("Index -- Resetting from bottom of loop");
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
        const roundSet = [];
        const gameBuffer = new game_buffer_1.GameBuffer(buffer, state.lineLength);
        const isRandom = name === "random";
        // TODO: Enum?? MAYBE
        if (name === "relative" || isRandom) {
            roundSet.push(new delete_round_1.DeleteRound());
        }
        if (name === "vada" || isRandom) {
            roundSet.push(new vada_1.VadaRound());
        }
        if (name === "ci{" || isRandom) {
            roundSet.push(new ci_round_1.CiRound());
        }
        if (name === "whackamole" || isRandom) {
            roundSet.push(new whackamole_round_1.WhackAMoleRound());
        }
        if (roundSet.length) {
            runGame(new base_1.Game(nvim, gameBuffer, state, roundSet, { difficulty }));
        }
    });
}
exports.initializeGame = initializeGame;
const availableGames = ["vada", "relative", "ci{", "whackamole", "random"];
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
        const rowSize = yield nvim.window.height;
        const columnSize = yield nvim.window.width;
        const width = Math.min(columnSize - 4, Math.max(80, columnSize - 20));
        const height = Math.min(rowSize - 4, Math.max(50, rowSize - 10));
        const top = ((rowSize - height) / 2) - 1;
        const left = ((columnSize - width) / 2);
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
                const len = yield buffer.length;
                const contents = yield buffer.getLines({
                    start: 0,
                    end: len,
                    strictIndexing: false
                });
                const hasContent = contents.
                    map(l => l.trim()).
                    filter(x => x.length).length > 0;
                console.log("Checking to see if buffer has content", hasContent);
                if (hasContent) {
                    throw new Error("Your buffer is not empty and you are not using floating window mode.  Please use an empty buffer.");
                }
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
            yield plugin.nvim.outWrite(`Error: ${args} ${e.message}\n`);
        }
    }), { sync: false, nargs: "*" });
}
exports.default = createPlugin;
