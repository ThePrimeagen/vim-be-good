import { Buffer, Neovim, NvimPlugin, Window } from "neovim";
import { GameDifficulty, GameState, parseGameDifficulty } from "./game/types";
import { BaseGame, newGameState } from "./game/base";
import { DeleteGame } from "./game/delete";
import { GameBuffer } from "./game-buffer";
import { CiGame } from "./game/ci";
import { WhackAMoleGame } from "./game/whackamole";
import { Menu } from "./menu";

// this is a comment
export async function runGame(nvim: Neovim, game: BaseGame): Promise<void> {
    const buffer: GameBuffer = game.gameBuffer;

    console.log("runGame -- Game is starting");
    try {
        for (let i = 0; i < 3; ++i) {
            console.log("runGame -- Game is starting in", String(3 - i));
            await buffer.debugTitle(
                "Game is starting in",
                String(3 - i),
                "...",
            );
        }

        // TODO: this should stop here.  this seems all sorts of wrong
        await buffer.setTitle(
            "Game Started: ",
            game.state.currentCount + 1,
            "/",
            game.state.ending.count,
        );

        console.log("runGame -- Round 1 of", game.state.ending.count);

        await game.clear();
        await game.run();

        let start = Date.now();
        let missingCount = 0;
        let used = false;
        // eslint-disable-next-line no-inner-declarations
        function reset() {
            console.log("runGame -- reset");
            used = false;
            if (missingCount > 0) {
                console.log(
                    "runGame -- reset -- missing line event",
                    missingCount,
                );
                missingCount = 0;
                onLineEvent();
            }
        }

        // eslint-disable-next-line no-inner-declarations
        async function onLineEvent() {
            const startOfFunction = Date.now();

            if (used) {
                missingCount++;
                return;
            }

            used = true;

            try {
                const checkForWin = await game.checkForWin();
                console.log("runGame -- checking for win", checkForWin);
                if (!checkForWin) {
                    reset();
                    return;
                }

                const failed = await game.hasFailed();
                console.log("runGame -- checking for failed", failed);

                if (!failed) {
                    game.state.results.push(startOfFunction - start);
                }

                console.log(
                    "runGame -- End of game?",
                    game.state.currentCount >= game.state.ending.count,
                );
                if (game.state.currentCount >= game.state.ending.count) {
                    await game.gameOver();

                    const gameCount = game.state.ending.count;
                    const title = [
                        `Success: ${
                            gameCount - game.state.failureCount
                        } / ${gameCount}`,
                    ];

                    if (game.state.results.length > 0) {
                        title.push(
                            `Average Success Time!: ${
                                game.state.results.reduce((x, y) => x + y, 0) /
                                game.state.results.length
                            }`,
                        );
                    } else {
                        title.push(
                            `You didn't even have one success, maybe you should lower the difficulty...`,
                        );
                    }

                    await buffer.setTitle(title.join(" "));
                    game.finish();
                    return;
                } else {
                    console.log(
                        `Round ${game.state.currentCount + 1} / ${
                            game.state.ending.count
                        }`,
                    );
                    await buffer.setTitle(
                        `Round ${game.state.currentCount + 1} / ${
                            game.state.ending.count
                        }`,
                    );
                }

                game.state.currentCount++;

                await game.clear();
                await game.run();
                start = Date.now();
            } catch (e) {
                buffer.debugTitle("onLineEvent#error", e.message);
            }
            reset();
        }

        buffer.onLines(onLineEvent);
        game.onTimerExpired(() => {
            console.log("Index#onTimerExpired!");
            onLineEvent();
        });
    } catch (err) {
        await nvim.outWrite(`Failure ${err}\n`);
    }
}

export async function initializeGame(
    name: string,
    difficulty: GameDifficulty,
    nvim: Neovim,
    buffer: Buffer,
    window: Window,
    state: GameState,
): Promise<void> {
    let game: BaseGame | null = null;
    let gameBuffer = new GameBuffer(buffer, state.lineLength);

    if (name === "relative") {
        game = new DeleteGame(nvim, gameBuffer, state, { difficulty });
    } else if (name === "ci{") {
        game = new CiGame(nvim, gameBuffer, state, { difficulty });
    } else if (name === "whackamole") {
        game = new WhackAMoleGame(nvim, gameBuffer, state, { difficulty });
    }

    if (game) {
        runGame(nvim, game);
    }
}

const availableGames = ["relative", "ci{", "whackamole"];
const availableDifficulties = ["easy", "medium", "hard", "nightmare", "tpope"];

const stringToDiff = {
    easy: GameDifficulty.Easy,
    medium: GameDifficulty.Medium,
    hard: GameDifficulty.Hard,
    nightmare: GameDifficulty.Nightmare,
    tpope: GameDifficulty.TPope,
};

export async function getGameState(nvim: Neovim): Promise<GameState> {
    return newGameState(await nvim.buffer, await nvim.window);
}

type BufferWindow = {
    buffer: Buffer;
    window: Window;
};

export async function createFloatingWindow(nvim: Neovim): Promise<BufferWindow> {
    let rowSize = await nvim.window.height;
    let columnSize = await nvim.window.width;

    let width = Math.min( columnSize - 4, Math.max( 80, columnSize - 20 ) );
    let height = Math.min( rowSize - 4, Math.max( 30, rowSize - 10 ) );
    let top = (( rowSize - height ) / 2 ) - 1;
    let left = (( columnSize - width ) / 2 );

    // Create a scratch buffer
    const buffer = (await nvim.createBuffer(false, true)) as Buffer;

    let window = await nvim.openWindow(
        buffer, true, {
            relative: 'editor',
            row: top,
            col: left,
            width: width,
            height: height
        }
    );

    // TODO: I don't think this is the way to do this, but lets find out.
    if (typeof window === "number") {
        window = await nvim.window;
    }

    return {buffer, window};
}


export default function createPlugin(plugin: NvimPlugin): void {
    plugin.setOptions({
        dev: true,
        alwaysInit: true,
    });

    plugin.registerCommand(
        "VimBeGood",
        async (args: string[]) => {
            try {
                const useCurrentBuffer = Number(
                    await plugin.nvim.getVar("vim_be_good_floating")) === 0;

                let buffer: Buffer;
                let window: Window;

                if (useCurrentBuffer) {
                    buffer = await plugin.nvim.buffer;
                    window = await plugin.nvim.window;
                } else {
                    const bufAndWindow = await createFloatingWindow(plugin.nvim);
                    buffer = bufAndWindow.buffer;
                    window = bufAndWindow.window;
                }

                const difficulty = parseGameDifficulty(args[1]);
                const state = await getGameState(plugin.nvim);

                if (availableGames.indexOf(args[0]) >= 0) {
                    state.name = args[0];
                    await initializeGame(
                        args[0],
                        difficulty,
                        plugin.nvim,
                        buffer,
                        window,
                        state,
                    );
                }

                // TODO: ci?
                else {
                    const menu = await Menu.build(
                        plugin,
                        availableGames,
                        availableDifficulties,
                        difficulty,
                    );

                    menu.onGameSelection(
                        async (gameName: string, difficulty: string) => {
                            state.name = gameName;
                            await initializeGame(
                                gameName,
                                stringToDiff[difficulty],
                                plugin.nvim,
                                buffer,
                                window,
                                state,
                            );
                        },
                    );

                    menu.render();

                    return;
                }
            } catch (e) {
                await plugin.nvim.outWrite("Error#" + args + " " + e.message);
            }
        },
        { sync: false, nargs: "*" },
    );
}
