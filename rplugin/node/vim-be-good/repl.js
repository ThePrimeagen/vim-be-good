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
const _1 = require(".");
// @ts-ignore
global.nvim = null;
function setRepl() {
    return __awaiter(this, void 0, void 0, function* () {
        //@ts-ignore
        return require("neovim/scripts/nvim").then(n => (global.nvim = n));
    });
}
exports.setRepl = setRepl;
function createGame(name) {
    return __awaiter(this, void 0, void 0, function* () {
        yield setRepl();
        const diff = types_1.GameDifficulty.Easy;
        // @ts-ignore
        const nvim = global.nvim;
        const { buffer, window, } = yield _1.createFloatingWindow(nvim);
        const gs = yield _1.getGameState(nvim);
        _1.initializeGame(name, diff, nvim, buffer, window, gs);
    });
}
exports.createGame = createGame;
