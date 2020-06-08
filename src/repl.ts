/* eslint-disable */
import { Neovim } from "neovim";
import { GameDifficulty } from "./game/types";
import { initializeGame, createFloatingWindow, getGameState } from ".";

// @ts-ignore
global.nvim = null;

export async function setRepl() {
    //@ts-ignore
    return require("neovim/scripts/nvim").then(n => (global.nvim = n));
}

export async function createGame(name: string) {
    await setRepl();
    const diff = GameDifficulty.Easy;

    // @ts-ignore
    const nvim: Neovim  = global.nvim;

    const {
        buffer,
        window,
    } = await createFloatingWindow(nvim);

    const gs = await getGameState(nvim);

    initializeGame(name, diff, nvim, buffer, window, gs);
}
