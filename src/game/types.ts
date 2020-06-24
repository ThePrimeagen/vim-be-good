import { Buffer, Window, Neovim } from "neovim";

export enum GameDifficulty {
    Noob = "noob",
    Easy = "easy",
    Medium = "medium",
    Hard = "hard",
    Nightmare = "nightmare",
    TPope = "tpope",
}

export type GameOptions = {
    difficulty: GameDifficulty;
};

export enum RoundStatus {
    Playing = 0,
    Failed,
    Won,
}

export function difficultyToTime(diff: GameDifficulty): number {
    let out = 1000;
    switch (diff) {
        case GameDifficulty.Easy:
            out = 5000;
            break;
        case GameDifficulty.Medium:
            out = 3500;
            break;
        case GameDifficulty.Hard:
            out = 2500;
            break;
        case GameDifficulty.Nightmare:
            out = 1600;
            break;
    }

    return out;
}

export function parseGameDifficulty(
    diff: string,
    defaultValue = GameDifficulty.Easy,
): GameDifficulty {
    let difficulty = defaultValue;
    switch (diff) {
        case "easy":
            difficulty = GameDifficulty.Easy;
            break;
        case "medium":
            difficulty = GameDifficulty.Medium;
            break;
        case "hard":
            difficulty = GameDifficulty.Hard;
            break;
        case "nightmare":
            difficulty = GameDifficulty.Nightmare;
            break;
    }

    return difficulty;
}

export type GameState = {
    buffer: Buffer;
    window: Window;
    failureCount: number;
    name: string;
    ending: { count: number };
    currentCount: number;
    lineRange: {
        start: number;
        end: number;
    };
    lineLength: number;
    results: number[];
};

export type LinesCallback = (args: any[]) => void;

export interface IGameBuffer {
    lineLength: number;
    getGameLines(): Promise<string[]>;
    pickRandomLine(): number;
    // TODO: I ackshually hate this.
    midPointRandomPoint(high: boolean, padding?: number): number;
    getOffset(): number;

    onLines(cb: LinesCallback): void;
    setInstructions(instr: string[]): void;
    finish(): Promise<void>;
    getMidpoint(): number;

    render(lines: string[]): Promise<void>;
    clearBoard(): Promise<void>;
    debugTitle(...title: any[]): Promise<void>;
    setTitle(...title: any[]): Promise<void>;
}

export interface IGame {
    nvim: Neovim;
    gameBuffer: IGameBuffer;
    state: GameState;
    difficulty: GameDifficulty;
}
