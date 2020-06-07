import { Buffer, Neovim, NvimPlugin, Window } from "neovim";
import { GameDifficulty, GameState, parseGameDifficulty } from "./game/types";
import { Round } from "./game/round";
import { DeleteRound } from "./game/delete-round";
import { Game, newGameState } from "./game/base";
import { GameBuffer } from "./game-buffer";
import { WhackAMoleRound } from "./game/whackamole-round";
import { CiRound } from "./game/ci-round";
import { Menu } from "./menu";

// this is a comment
export async function runGame(game: Game): Promise<void> {
    const nvim: Neovim = game.nvim;
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

        await game.gameBuffer.clearBoard();
        await game.startRound();
        await game.run(true);

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

            console.log("runGame -- Starting Line Event");
            try {
                console.log("runGame#try Starting State Check");

                const checkForWin = await game.checkForWin();
                console.log("runGame -- game.checkForWin -> ", checkForWin);

                const failed = await game.hasFailed();
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

                console.log(
                    "runGame -- End of game?",
                    game.state.currentCount >= game.state.ending.count,
                );

                console.log("Index -- Incrementing currentCount", game.state.currentCount, game.state.currentCount + 1);
                game.state.currentCount++;

                console.log(
                    `Round ${game.state.currentCount} / ${
                        game.state.ending.count
                    }`,
                );
                await buffer.setTitle(
                    `Round ${game.state.currentCount} / ${
                        game.state.ending.count
                    }`,
                );

                if (game.state.currentCount > game.state.ending.count) {

                    const gameCount = game.state.ending.count;
                    const title = [
                        `Success: ${
                            game.state.results.length
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
                }

                console.log("Index -- ending game round");
                await game.endRound();
                console.log("Index -- Starting round");
                await game.startRound();
                await game.run(false);

                start = Date.now();
            } catch (e) {
                buffer.debugTitle("onLineEvent#error", e.message);
            }

            console.log("Index -- Resetting from bottom of loop");
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
    const roundSet: Round[] = [];
    const gameBuffer = new GameBuffer(buffer, state.lineLength);
    const isRandom = name === "random";

    // TODO: Enum?? MAYBE
    if (name === "relative" || isRandom) {
        roundSet.push(
            new DeleteRound());
    }
    if (name === "ci{" || isRandom) {
        roundSet.push(
            new CiRound());
    }
    if (name === "whackamole" || isRandom) {
        roundSet.push(new WhackAMoleRound());
    }

    if (roundSet.length) {
        runGame(new Game(nvim, gameBuffer, state, roundSet, {difficulty}));
    }
}

const availableGames = ["relative", "ci{", "whackamole", "random"];
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
    const rowSize = await nvim.window.height;
    const columnSize = await nvim.window.width;

    const width = Math.min( columnSize - 4, Math.max( 80, columnSize - 20 ) );
    const height = Math.min( rowSize - 4, Math.max( 40, rowSize - 10 ) );
    const top = (( rowSize - height ) / 2 ) - 1;
    const left = (( columnSize - width ) / 2 );

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

                        const len = await buffer.length;
                        const contents = await buffer.getLines({
                            start: 0,
                            end: len,
                            strictIndexing: false
                        });

                        const hasContent =
                            contents.
                                map(l => l.trim()).
                                filter(x => x.length).length > 0;

                        if (hasContent) {
                            throw new Error("Your buffer is not empty and you are not using floating window mode.  Please use an empty buffer.");
                        }

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
