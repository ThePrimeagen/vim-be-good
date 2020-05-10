import { NvimPlugin, Buffer } from 'neovim';
import wait from './wait';
import { DeleteGame } from './games/relative';
import { BaseGame } from './games/base';

module.exports = (plugin: NvimPlugin) => {
    plugin.setOptions({
        dev: true,
        alwaysInit: true,
    });

    plugin.registerCommand('VimBeGood2', async (args: string[]) => {
        try {
            let game: BaseGame;

            if (args[0] === "relative") {
                game = new DeleteGame(plugin.nvim, args.slice(1));
            }

            else {
                await plugin.nvim.outWrite('You did not do anything ' + args + '\n');
                await wait(1000);
                await plugin.nvim.outWrite('type of args = ' + typeof args + '\n');
                return;
            }

            await game.start();

        } catch (err) {
            await plugin.nvim.outWrite(`Failure ${err}\n`);
        }
    }, { sync: false, nargs: "*" });
};
