import * as fs from "fs";
import { Neovim, Buffer, Window } from "neovim";
import { GameBuffer } from "../game-buffer";
import {
    GameState,
    GameOptions,
    GameDifficulty,
    difficultyToTime
} from "./types";

// this is a comment
export function newGameState(buffer: Buffer, window: Window): GameState {
    return {
        buffer,
        name: "",
        failureCount: 0,
        window,
        ending: { count: 10 },
        currentCount: 0,
        lineRange: { start: 2, end: 22 },
        lineLength: 20,
        results: []
    };
}

export const extraWords = [
    "aar",
    "bar",
    "car",
    "dar",
    "ear",
    "far",
    "gar",
    "har",
    "iar",
    "jar",
    "kar",
    "lar",
    "mar",
    "nar",
    "oar",
    "par",
    "qar",
    "rar",
    "sar",
    "tar",
    "uar",
    "var",
    "war",
    "xar",
    "yar",
    "zar"
];

export const extraSentences = [
    "One is the best Prime Number",
    "Brandon is the best One",
    "I Twitch when I think about the Discord",
    "My dog is also my dawg",
    "The internet is an amazing place full of interesting facts",
    "Did you know the internet crosses continental boundaries using a wire?!",
    "I am out of interesting facts to type here",
    "Others should contribute more sentences to be used in the game"
];

export function getRandomWord(): string {
    return extraWords[Math.floor(Math.random() * extraWords.length)];
}

export function getRandomSentence(): string {
    return extraSentences[Math.floor(Math.random() * extraSentences.length)];
}

export abstract class BaseGame {
    private difficulty: GameDifficulty;
    private timerId?: ReturnType<typeof setTimeout>;
    private onExpired: (() => void)[];

    constructor(
        public gameBuffer: GameBuffer,
        private state: GameState,
        opts: GameOptions = {
            difficulty: GameDifficulty.Easy
        }
    ) {
        this.state = state;
        this.onExpired = [];
        this.difficulty = opts.difficulty;
    }

    protected async render(lines: string[]): Promise<void> {
        await this.gameBuffer.render(lines);
    }

    public async finish(): Promise<void> {
        const fName = `/tmp/${this.state.name}-${Date.now()}.csv`;
        fs.writeFileSync(
            fName,
            this.state.results.map(x => x + "").join(",\n")
        );

        await this.gameBuffer.finish();
    }

    public async gameOver(): Promise<void> {
        // no op which can be optionally utilized by subclasses
    }

    protected startTimer(): void {
        this.timerId = setTimeout(() => {
            this.onExpired.forEach(cb => cb());

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore I HATE YOU TYPESCRIPT
            this.timerId = 0;
        }, difficultyToTime(this.difficulty));
    }

    protected clearTimer(): void {
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
    }

    public onTimerExpired(cb: () => void): void {
        this.onExpired.push(cb);
    }

    abstract hasFailed(): Promise<boolean>;
    abstract run(): Promise<void>;
    abstract clear(): Promise<void>;
    abstract checkForWin(): Promise<boolean>;
}
