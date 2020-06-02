import { Neovim, NvimPlugin } from "neovim";
import { GameDifficulty, GameState, parseGameDifficulty } from "./game/types";
import { BaseGame, newGameState } from "./game/base";
import { DeleteGame } from "./game/delete";
import { CiGame } from "./game/ci";
import { WhackAMoleGame } from "./game/whackamole";
import { Menu } from "./menu";

// this is a comment
export async function runGame(game: BaseGame): Promise<void> {
    try {
        for (let i = 0; i < 3; ++i) {
            await game.debugTitle("Game is starting in", String(3 - i), "...");
        }

        await game.setTitle(
            "Game Started: ",
            game.state.currentCount + 1,
            "/",
            game.state.ending.count
        );
        await game.clear();
        await game.run();

        let start = Date.now();
        let missingCount = 0;
        let used = false;
        // eslint-disable-next-line no-inner-declarations
        function reset() {
            used = false;
            if (missingCount > 0) {
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
                if (!(await game.checkForWin())) {
                    reset();
                    return;
                }

                const failed = await game.hasFailed();

                if (!failed) {
                    game.state.results.push(startOfFunction - start);
                }

                if (game.state.currentCount >= game.state.ending.count) {
                    await game.gameOver();

                    const gameCount = game.state.ending.count;
                    const title = [
                        `Success: ${
                            gameCount - game.state.failureCount
                        } / ${gameCount}`
                    ];

                    if (game.state.results.length > 0) {
                        title.push(
                            `Average Success Time!: ${
                                game.state.results.reduce((x, y) => x + y, 0) /
                                game.state.results.length
                            }`
                        );
                    } else {
                        title.push(
                            `You didn't even have one success, maybe you should lower the difficulty...`
                        );
                    }

                    await game.setTitle(title.join(" "));
                    game.finish();
                    return;
                } else {
                    await game.setTitle(
                        `Round ${game.state.currentCount + 1} / ${
                            game.state.ending.count
                        }`
                    );
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
        game.onTimerExpired(() => {
            console.log("Index#onTimerExpired!");
            onLineEvent();
        });
    } catch (err) {
        await game.nvim.outWrite(`Failure ${err}\n`);
    }
}

export function initializeGame(
    name: string,
    difficulty: GameDifficulty,
    nvim: Neovim,
    state: GameState
): Promise<void> | void {
    let game: BaseGame | null = null;

    if (name === "relative") {
        game = new DeleteGame(nvim, state, { difficulty });
    } else if (name === "ci{") {
        game = new CiGame(nvim, state, { difficulty });
    } else if (name === "whackamole") {
        game = new WhackAMoleGame(nvim, state, { difficulty });
    }

    if (game) {
        runGame(game);
    }
}

const availableGames = ["relative", "ci{", "whackamole"];
const availableDifficulties = ["easy", "medium", "hard", "nightmare", "tpope"];

const stringToDiff = {
    easy: GameDifficulty.Easy,
    medium: GameDifficulty.Medium,
    hard: GameDifficulty.Hard,
    nightmare: GameDifficulty.Nightmare,
    tpope: GameDifficulty.TPope
};

export async function getGameState(nvim: Neovim): Promise<GameState> {
    return newGameState(await nvim.buffer, await nvim.window);
}

export default function (plugin: NvimPlugin): void {
    plugin.setOptions({
        dev: true,
        alwaysInit: true
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
                    strictIndexing: true
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
                    initializeGame(args[0], difficulty, plugin.nvim, state);
                }

                // TODO: ci?
                else {
                    const menu = await Menu.build(
                        plugin,
                        availableGames,
                        availableDifficulties,
                        difficulty
                    );

                    menu.onGameSelection(
                        async (gameName: string, difficulty: string) => {
                            state.name = gameName;
                            initializeGame(
                                gameName,
                                stringToDiff[difficulty],
                                plugin.nvim,
                                state
                            );
                        }
                    );

                    menu.render();

                    return;
                }
            } catch (e) {
                await plugin.nvim.outWrite("Error#" + args + " " + e.message);
            }
        },
        { sync: false, nargs: "*" }
    );
}
