import { Buffer } from 'neovim';

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


