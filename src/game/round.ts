import { Neovim } from "neovim";
import { GameBuffer } from "../game-buffer";
import { IGame, GameState, GameDifficulty } from "./types";

export interface Round {
    render(game: IGame): Promise<string[]>;
    isRoundCompleted(game: IGame): Promise<boolean>;
    isTimedRound(): boolean;
    getInstructions(): string[];
    getTimeoutTime(diff: GameDifficulty): number;
}

