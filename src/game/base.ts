import * as fs from "fs";
import { Neovim, Buffer, Window } from "neovim";
import { GameBuffer } from "../game-buffer";
import { Round } from "./round";
import {
    GameState,
    GameOptions,
    GameDifficulty,
    difficultyToTime,
    IGame,
} from "./types";

// this is a comment
export function newGameState(buffer: Buffer, window: Window): GameState {
    return {
        buffer,
        name: "",
        failureCount: 0,
        window,
        ending: { count: 10 },
        currentCount: 1,
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

export class Game implements IGame {
    private difficulty: GameDifficulty;
    private timerId?: ReturnType<typeof setTimeout>;
    private onExpired: (() => void)[];
    private timerExpired: boolean;
    public currentRound!: Round;

    constructor(
        public nvim: Neovim,
        public gameBuffer: GameBuffer,
        public state: GameState,
        public rounds: Round[],
        opts: GameOptions = {
            difficulty: GameDifficulty.Easy
        }
    ) {
        this.onExpired = [];
        this.timerExpired = false;
        this.difficulty = opts.difficulty;
    }

    public async startRound(): Promise<void> {
        console.log("Game#startRound");

        const nextRound =
            this.rounds[Math.floor(Math.random() * this.rounds.length)];

        if (this.currentRound === nextRound) {
            console.log("Game#startRound currentRound === nextRound");
            return;
        }

        const instructions = nextRound.getInstructions();

        await this.gameBuffer.clearBoard();
        this.gameBuffer.setInstructions(instructions);

        this.currentRound = nextRound;
    }

    public async checkForWin(): Promise<boolean> {
        return await this.currentRound.isRoundComplete(this);
    }

    public async hasFailed(): Promise<boolean> {
        console.log(`Game#hasFailed -> ${this.timerExpired}`);
        return this.timerExpired;
    }

    public async run(firstRun: boolean): Promise<void> {
        console.log(`Game#run(${firstRun})`);
        const lines = await this.currentRound.render(this);
        await this.gameBuffer.render(lines);

        if (this.currentRound.isTimedRound()) {
            console.log("Game -- run -- starting timer");
            this.startTimer();
        }
    }

    // Anything left to do here?
    public async endRound(): Promise<void> {
        this.clearTimer();
    }

    public async finish(): Promise<void> {
        const fName = `/tmp/${this.state.name}-${Date.now()}.csv`;
        const results = this.state.results.map(x => x + "").join(",\n");

        console.log("base -- finish", fName, results);

        fs.writeFileSync(
            fName,
            results,
        );

        await this.gameBuffer.finish();
    }

    private startTimer(): void {
        const time = this.currentRound.getTimeoutTime(this.difficulty);

        console.log("base - startTimer", time);

        this.timerExpired = false;

        this.timerId = setTimeout(() => {
            this.timerExpired = true;
            this.onExpired.forEach(cb => cb());

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore I HATE YOU TYPESCRIPT
            this.timerId = 0;
        }, time);
    }

    private clearTimer(): void {
        console.log("base - clearTimer", this.timerId);

        if (this.timerId) {
            clearTimeout(this.timerId);
        }
    }

    public onTimerExpired(cb: () => void): void {
        console.log("On timer expired");
        this.onExpired.push(cb);
    }
}

export abstract class BaseGame {
    private difficulty: GameDifficulty;
    private timerId?: ReturnType<typeof setTimeout>;
    private onExpired: (() => void)[];

    constructor(
        public nvim: Neovim,
        public gameBuffer: GameBuffer,
        public state: GameState,
        opts: GameOptions = {
            difficulty: GameDifficulty.Easy
        }
    ) {
        this.onExpired = [];
        this.difficulty = opts.difficulty;
    }

    protected async render(lines: string[]): Promise<void> {
        await this.gameBuffer.render(lines);
    }

    public async finish(): Promise<void> {
        const fName = `/tmp/${this.state.name}-${Date.now()}.csv`;
        const results = this.state.results.map(x => x + "").join(",\n");

        console.log("base -- finish", fName, results);

        fs.writeFileSync(
            fName,
            results,
        );

        await this.gameBuffer.finish();
    }

    public async gameOver(): Promise<void> {
        // no op which can be optionally utilized by subclasses
    }

    protected startTimer(): void {
        const time = difficultyToTime(this.difficulty);
        console.log("base - startTimer", time);

        this.timerId = setTimeout(() => {
            this.onExpired.forEach(cb => cb());

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore I HATE YOU TYPESCRIPT
            this.timerId = 0;
        }, time);
    }

    protected clearTimer(): void {
        console.log("base - clearTimer", this.timerId);

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
