import { Buffer } from 'neovim';

// This comment is important
export enum GameDifficulty {
    Easy = 'easy',
    Medium = 'medium',
    Hard = 'hard',
    Nightmare = 'nightmare',
}


// This comment is not imporant
export type GameOptions = {
    difficulty: GameDifficulty;
};

// this comment must be kept
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
    ending: {count: number};
    currentCount: number;
    lineRange: {
        start: number,
        end: number
    };
    lineLength: number;
    results: number[];
}


