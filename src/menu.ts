import { Buffer, NvimPlugin, Window } from "neovim";

export class Menu {
    private buffer?: Buffer;
    private plugin: NvimPlugin;
    private window?: Window;
    //eslint-disable-next-line @typescript-eslint/ban-types
    private gameSelectionCallback?: Function;
    private headerLines = [
        "VimBeGood is a collection of small games for neovim which are",
        "intended to help you improve your vim proficiency.",
        ""
    ];
    private gameInstructions = [
        "Select a Game (delete from the list to select)",
        "----------------------------------------------"
    ];

    private difficultyInstructions = [
        "",
        "Select a Difficulty (delete from the list to select)",
        "----------------------------------------------------"
    ];
    private gameList: string[];
    private difficultyList: string[];
    private difficultyLines: string[] = [];
    private footer = [
        "",
        "",
        "",
        "",
        "Created by ThePrimeagen",
        "           Brandoncc",
        "https://github.com/ThePrimeagen/vim-be-good"
    ];
    private fullMenu: string[] = [];
    //eslint-disable-next-line @typescript-eslint/no-inferrable-types
    private firstGameLineIndex: number = -1;
    //eslint-disable-next-line @typescript-eslint/no-inferrable-types
    private firstDifficultyLineIndex: number = -1;
    private selectedDifficulty: string;

    constructor(
        plugin: NvimPlugin,
        games,
        difficulties,
        selectedDifficulty,
        __allowCreation
    ) {
        if (!__allowCreation) {
            throw new Error(
                "Menu cannot be instantiated, you must use the builder"
            );
        }

        this.plugin = plugin;
        this.lineEventHandler = this.lineEventHandler.bind(this);
        this.gameList = games;
        this.difficultyList = difficulties;
        this.selectedDifficulty = difficulties[0];
        this.generateMenuLines();
    }

    static async build(
        plugin: NvimPlugin,
        availableGames: string[],
        availableDifficulties: string[],
        selectedDifficulty
    ) {
        const menu = new Menu(
            plugin,
            availableGames,
            availableDifficulties,
            selectedDifficulty,
            true
        );

        await menu.setup();

        return menu;
    }

    public async setup() {
        this.buffer = await this.plugin.nvim.buffer;
        this.window = await this.plugin.nvim.window;
    }

    public async clearScreen() {
        await this.buffer?.remove(0, await this.buffer?.length, true);
    }

    public async render() {
        if (!this.window) {
            return;
        }

        this.stopHandlingLineEvents();
        await this.clearScreen();
        await this.buffer?.setLines(this.fullMenu, { start: 0 });
        this.window.cursor = [this.firstGameLineIndex, 0];
        this.handleLineEvents();
    }

    public onGameSelection(cb) {
        this.gameSelectionCallback = cb;
    }

    private async lineEventHandler(
        buffer,
        _changedTick,
        _firstLine,
        lastLine,
        _newData,
        _more
    ) {
        try {
            if (!this.window) {
                return;
            }

            const newLines = await buffer.lines;
            const deletedCount = this.fullMenu.length - newLines.length;

            if (deletedCount === 1) {
                const selectedGame = this.gameList[
                    lastLine - this.firstGameLineIndex
                ];

                const selectedDifficulty = this.difficultyList[
                    lastLine - this.firstDifficultyLineIndex
                ];

                if (selectedGame) {
                    this.stopHandlingLineEvents();

                    await this.clearScreen();

                    this.gameSelectionCallback?.(
                        selectedGame,
                        this.selectedDifficulty
                    );
                } else if (selectedDifficulty) {
                    this.selectedDifficulty = selectedDifficulty;
                    this.stopHandlingLineEvents();
                    this.generateMenuLines();

                    await this.render();
                } else {
                    await this.render();
                }
            } else {
                await this.render();
            }
        } catch (e) {
            await this.plugin.nvim.outWrite(
                "Error while handling line: " + e.message + "\n"
            );
        }
    }

    private handleLineEvents() {
        this.buffer?.listen("lines", this.lineEventHandler);
    }

    private stopHandlingLineEvents() {
        this.buffer?.unlisten("lines", this.lineEventHandler);
    }

    private createDifficultyLines(difficulties) {
        return difficulties.map(diff => {
            if (this.selectedDifficulty === diff) {
                return `[X] ${diff}`;
            } else {
                return `[ ] ${diff}`;
            }
        });
    }

    private generateMenuLines() {
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
