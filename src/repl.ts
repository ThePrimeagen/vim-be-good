
// @ts-ignore
global.nvim = null;

export async function setRepl() {
    //@ts-ignore
    require("neovim/scripts/nvim").then(n => (global.nvim = n));
}
