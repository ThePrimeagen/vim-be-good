import { Buffer, Window } from 'neovim';

export enum GameDifficulty {
    Easy = 'easy',
    Medium = 'medium',
    Hard = 'hard',
    Nightmare = 'nightmare',
}

export type GameOptions = {
    difficulty: GameDifficulty;
};

export function parseGameDifficulty(
    diff: string, defaultValue = GameDifficulty.Easy): GameDifficulty {

    let difficulty = defaultValue;
    switch (diff) {
        case 'easy':
            difficulty = GameDifficulty.Easy;
            break;
        case 'medium':
            difficulty = GameDifficulty.Medium;
            break;
        case 'hard':
            difficulty = GameDifficulty.Hard;
            break;
        case 'nightmare':
            difficulty = GameDifficulty.Nightmare;
            break;
    }

    return difficulty;
}

export type GameState = {
    buffer: Buffer;
    window: Window;
    name: string;
    ending: {count: number};
    currentCount: number;
    lineRange: {
        start: number,
        end: number
    };
    lineLength: number;
    results: number[];
}


