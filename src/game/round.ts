import { IGame, GameDifficulty } from "./types";

export abstract class Round {
    abstract render(game: IGame): Promise<string[]>;
    abstract isRoundComplete(game: IGame): Promise<boolean>;
    abstract getInstructions(): string[];

    async postRender(game: IGame): Promise<void> {
        return;
    }

    public getTimeoutTime(diff: GameDifficulty): number {
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

        console.log("WhackAMoleRound#getTimeoutTime", out);
        return out;
    }

    public isTimedRound(): boolean {
        return true;
    }
}
