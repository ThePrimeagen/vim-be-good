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
class Menu {
    constructor(plugin, games, difficulties, selectedDifficulty, __allowCreation) {
        this.headerLines = [
            "VimBeGood2 is a collection of small games for neovim which are",
            "intended to help you improve your vim proficiency.",
            ""
        ];
        this.gameInstructions = [
            "Select a Game (delete from the list to select)",
            "----------------------------------------------"
        ];
        this.difficultyInstructions = [
            "",
            "Select a Difficulty (delete from the list to select)",
            "----------------------------------------------------"
        ];
        this.difficultyLines = [];
        this.footer = [
            "",
            "",
            "",
            "",
            "Created by ThePrimeagen",
            "           Brandoncc",
            "https://github.com/ThePrimeagen/vim-be-good"
        ];
        this.fullMenu = [];
        //eslint-disable-next-line @typescript-eslint/no-inferrable-types
        this.firstGameLineIndex = -1;
        //eslint-disable-next-line @typescript-eslint/no-inferrable-types
        this.firstDifficultyLineIndex = -1;
        if (!__allowCreation) {
            throw new Error("Menu cannot be instantiated, you must use the builder");
        }
        this.plugin = plugin;
        this.lineEventHandler = this.lineEventHandler.bind(this);
        this.gameList = games;
        this.difficultyList = difficulties;
        this.selectedDifficulty = difficulties[0];
        this.generateMenuLines();
    }
    static build(plugin, availableGames, availableDifficulties, selectedDifficulty) {
        return __awaiter(this, void 0, void 0, function* () {
            const menu = new Menu(plugin, availableGames, availableDifficulties, selectedDifficulty, true);
            yield menu.setup();
            return menu;
        });
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("menu -- Setup Starting");
            this.buffer = yield this.plugin.nvim.buffer;
            this.window = yield this.plugin.nvim.window;
            console.log("menu -- Setup Finished");
        });
    }
    clearScreen() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("menu -- clearScreen");
            yield ((_a = this.buffer) === null || _a === void 0 ? void 0 : _a.remove(0, yield ((_b = this.buffer) === null || _b === void 0 ? void 0 : _b.length), true));
        });
    }
    render() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.window) {
                return;
            }
            this.stopHandlingLineEvents();
            yield this.clearScreen();
            yield ((_a = this.buffer) === null || _a === void 0 ? void 0 : _a.setLines(this.fullMenu, { start: 0 }));
            this.window.cursor = [this.firstGameLineIndex, 0];
            this.handleLineEvents();
        });
    }
    onGameSelection(cb) {
        this.gameSelectionCallback = cb;
    }
    lineEventHandler(buffer, _changedTick, _firstLine, lastLine, _newData, _more) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.window) {
                    return;
                }
                const newLines = yield buffer.lines;
                const deletedCount = this.fullMenu.length - newLines.length;
                console.log("menu -- onLineChange", deletedCount);
                if (deletedCount === 1) {
                    const selectedGame = this.gameList[lastLine - this.firstGameLineIndex];
                    const selectedDifficulty = this.difficultyList[lastLine - this.firstDifficultyLineIndex];
                    console.log("menu -- onLineChange, if deletedCount === 1", selectedGame, selectedDifficulty);
                    if (selectedGame) {
                        console.log("menu -- onLineChange, selectedGame");
                        this.stopHandlingLineEvents();
                        yield this.clearScreen();
                        (_a = this.gameSelectionCallback) === null || _a === void 0 ? void 0 : _a.call(this, selectedGame, this.selectedDifficulty);
                    }
                    else if (selectedDifficulty) {
                        console.log("menu -- onLineChange, selectedDifficulty");
                        this.selectedDifficulty = selectedDifficulty;
                        this.stopHandlingLineEvents();
                        this.generateMenuLines();
                        yield this.render();
                    }
                    else {
                        console.log("menu -- onLineChange, NOTHING WAS FOUND");
                        yield this.render();
                    }
                }
                else {
                    yield this.render();
                }
            }
            catch (e) {
                yield this.plugin.nvim.outWrite("Error while handling line: " + e.message + "\n");
            }
        });
    }
    handleLineEvents() {
        var _a;
        (_a = this.buffer) === null || _a === void 0 ? void 0 : _a.listen("lines", this.lineEventHandler);
    }
    stopHandlingLineEvents() {
        var _a;
        (_a = this.buffer) === null || _a === void 0 ? void 0 : _a.unlisten("lines", this.lineEventHandler);
    }
    createDifficultyLines(difficulties) {
        return difficulties.map(diff => {
            if (this.selectedDifficulty === diff) {
                return `[X] ${diff}`;
            }
            else {
                return `[ ] ${diff}`;
            }
        });
    }
    generateMenuLines() {
        this.difficultyLines = this.createDifficultyLines(this.difficultyList);
        this.fullMenu = [
            ...this.headerLines,
            ...this.gameInstructions,
            ...this.gameList,
            ...this.difficultyInstructions,
            ...this.difficultyLines,
            ...this.footer
        ];
        this.firstGameLineIndex =
            this.headerLines.length + this.gameInstructions.length + 1;
        this.firstDifficultyLineIndex =
            this.headerLines.length +
                this.gameInstructions.length +
                this.gameList.length +
                this.difficultyInstructions.length +
                1;
    }
}
exports.Menu = Menu;
