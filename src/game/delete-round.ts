import { IGame, GameDifficulty } from "./types";
import { Round } from "./round";

const deleteRoundInstructions = [
    'When you see a "DELETE ME", relative jump to it',
    "as fast as possible and delete it.",
    "",
    ""
];

export class DeleteRound implements Round {

    constructor() { }

    public getInstructions() {
        return deleteRoundInstructions;
    }

    public async render(game: IGame): Promise<string[]> {
        const high = Math.random() > 0.5;
        const line = game.gameBuffer.midPointRandomPoint(high);

        const lines = new Array(game.state.lineLength).fill("");
        lines[line] = "                              DELETE ME";

        const middlePoint = game.gameBuffer.midPointRandomPoint(!high);
        console.log("relative -- run#rendering",
                    high, middlePoint, game.state.lineLength, lines);

        await game.nvim.command(`:${String(middlePoint)}`);

        return lines;
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

        return out;
    }

    public isTimedRound(): boolean {
        return true;
    }

    public async isRoundCompleted(game: IGame): Promise<boolean> {
        const lines = await game.gameBuffer.getGameLines();
        const length = lines.map(l => l.trim()).join("").length;
        return length === 0;
    }
}


