import { Neovim, NvimPlugin } from "neovim";
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
    state: GameState,
): Promise<void> {
    let game: BaseGame | null = null;
    let buffer = new GameBuffer(await nvim.buffer, state.lineLength);

    if (name === "relative") {
        game = new DeleteGame(nvim, buffer, state, { difficulty });
    } else if (name === "ci{") {
        game = new CiGame(nvim, buffer, state, { difficulty });
    } else if (name === "whackamole") {
        game = new WhackAMoleGame(nvim, buffer, state, { difficulty });
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

export default function createPlugin(plugin: NvimPlugin): void {
    plugin.setOptions({
        dev: true,
        alwaysInit: true,
    });

    plugin.registerCommand(
        "VimBeGood",
        async (args: string[]) => {
            try {
                const buffer = await plugin.nvim.buffer;
                const length = await buffer.length;
                const lines = await buffer.getLines({
                    start: 0,
                    end: length,
                    strictIndexing: true,
                });

                const lengthOfLines = lines
                    .reduce((acc, x) => acc + x, "")
                    .trim().length;

                if (lengthOfLines > 0) {
                    plugin.nvim.errWriteLine("Your file is not empty.");
                    return;
                }

                const difficulty = parseGameDifficulty(args[1]);
                const state = await getGameState(plugin.nvim);

                if (availableGames.indexOf(args[0]) >= 0) {
                    state.name = args[0];
                    await initializeGame(
                        args[0],
                        difficulty,
                        plugin.nvim,
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
