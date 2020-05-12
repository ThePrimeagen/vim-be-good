import { Neovim, NvimPlugin, Buffer } from 'neovim';
import wait from './wait';
import { GameState, GameOptions, parseGameDifficulty } from './game/types';
import { BaseGame, newGameState, getRandomWord } from './game/base';
import { DeleteGame } from './game/delete';


export class CfGame extends BaseGame {
    private currentRandomWord: string;
    private ifStatment: boolean;
    constructor(nvim: Neovim, state: GameState, opts?: GameOptions) {
        super(nvim, state, opts);
        this.currentRandomWord = "";
    }

    async run() {
        const high = Math.random() > 0.5;
        const midPoint = this.state.lineLength / 2 + this.state.lineRange.start;
        const line = this.midPointRandomPoint(midPoint, high, 6);

        const lines = new Array(this.state.lineLength).fill('');

        this.currentRandomWord = getRandomWord();

        this.ifStatment = false;
        if (Math.random() > 0.5) {
            lines[line] = `if (${this.currentRandomWord}) {`;
            lines[line + 1] = ``;
            lines[line + 2] = `    if (${getRandomWord()}) { `;
            lines[line + 3] = `        ${getRandomWord()}`;
            lines[line + 4] = `    }`;
            lines[line + 5] = `}`;
            this.ifStatment = true;
        }
        else {
            lines[line] = `[`;
            lines[line + 1] = `    ${getRandomWord()},`;
            lines[line + 2] = `    ${getRandomWord()},`;
            lines[line + 3] = `    ${getRandomWord()},`;
            lines[line + 4] = `    ${getRandomWord()},`;
            lines[line + 5] = `]`;
        }

        await this.nvim.command(`:${String(this.midPointRandomPoint(midPoint, !high))}`);
        await this.state.buffer.setLines(lines, {
            start: this.state.lineRange.start,
            end: this.state.lineRange.end,
            strictIndexing: true
        });
    }

    async clear() {
        const len = await this.state.buffer.length;
        await this.state.buffer.remove(0, len, true);
        await this.state.buffer.insert(new Array(this.state.lineRange.end).fill(''), 0);
        await this.nvim.command("normal!<C-[>");
    }

    async checkForWin(): Promise<boolean> {
        const lines = await this.state.buffer.getLines({
            start: this.state.lineRange.start,
            end: await this.state.buffer.length,
            strictIndexing: false
        });

        const contents = lines.map(l => l.trim()).join('');

        return this.ifStatment && contents.toLowerCase() === `if (${this.currentRandomWord}) {bar}` ||
            contents.toLowerCase() === `[bar]`;
    }
}

export async function runGame(game: BaseGame) {
    try {
        for (let i = 0; i < 3; ++i) {
            await game.debugTitle("Game is starting in", String(3 - i), "...");
        }

        await game.setTitle("Game Started: ",
                            game.state.currentCount + 1,
                            "/", game.state.ending.count);
        await game.clear();
        await game.run();

        let start = Date.now();
        let missingCount = 0;
        let used = false;
        function reset() {
            used = false;
            if (missingCount > 0) {
                missingCount = 0;
                onLineEvent([]);
            }
        }

        async function onLineEvent(...args: any[]) {
            const startOfFunction = Date.now();

            if (used) {
                missingCount++;
                return;
            }

            used = true;

            try {
                if (!(await game.checkForWin())) {
                    reset();
                    return;
                }

                game.state.results.push(startOfFunction - start);
                if (game.state.currentCount >= game.state.ending.count) {
                    await game.setTitle(`Average!: ${game.state.results.reduce((x, y) => x + y, 0) / game.state.results.length}`);
                    game.finish();
                    return;
                }
                else {
                    await game.setTitle(`Round ${game.state.currentCount + 1} / ${game.state.ending.count}`);
                }

                game.state.currentCount++;

                await game.clear();
                await game.run();
                start = Date.now();
            } catch (e) {
                game.debugTitle("onLineEvent#error", e.message);
            }
            reset();
        }

        game.onLines(onLineEvent);
    } catch (err) {
        await game.nvim.outWrite(`Failure ${err}\n`);
    }
}

const availableGames = ["relative", "ci{"];
export default function(plugin: NvimPlugin) {
    plugin.setOptions({
        dev: true,
        alwaysInit: true,
    });

    plugin.registerCommand("VimBeGood2", async (args: string[]) => {
        try {
            const buffer = await plugin.nvim.buffer;
            const length = await buffer.length;
            const lines = await buffer.getLines({
                start: 0,
                end: length,
                strictIndexing: true
            });

            const lengthOfLines = lines.reduce((acc, x) => acc + x, "").trim().length;

            if (lengthOfLines > 0) {
                plugin.nvim.errWriteLine("Your file is not empty.")
                return;
            }

            const bufferOutOfMyMind = await plugin.nvim.buffer;
            const state = newGameState(bufferOutOfMyMind);
            const difficulty = parseGameDifficulty(args[1]);

            let game: BaseGame;

            if (args[0] === "relative") {
                game = new DeleteGame(plugin.nvim, state, {difficulty});
            }
            else if (args[0] === "ci{") {
                game = new CfGame(plugin.nvim, state, {difficulty});
            }

            // TODO: ci?
            else {
                await plugin.nvim.outWrite("VimBeGood: <gameName>  -- Available Games: " + availableGames.join() + "\n");
                return;
            }

            runGame(game);

        } catch (e) {
            await plugin.nvim.outWrite("Error#" + args + " " + e.message);
        }
    }, { sync: false, nargs: "*" });
};
