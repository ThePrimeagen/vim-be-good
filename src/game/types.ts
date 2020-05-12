import { Buffer } from 'neovim';

export type GameGameOptions = {
    difficulty: 'easy' | 'medium' | 'hard' | 'nightmare';
};

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


