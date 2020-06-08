import { IGame, GameDifficulty } from "./types";
import { Round } from "./round";
import { getRandomWord } from "./base";
import { getEmptyLines } from "../game-buffer";

const instructions = [
    "Swap the enclosed matching groups.",
    "Example: ",
    "",
    "if (foo) {                       if (foo) [",
    "   ... contents for if...  =>       ... contents for array...",
    "}                                ]",
    "const a = [                      const a = {",
    "   ... contents for array ...        ... contents for if...",
    "]                                }",
    "Keys Used: jump inside if, da{, jump to array, va{p, jump to end of if, p",
];

type RandomItem = {
    lines: string[],
    matchGroup: string,
    header: string,
};

export class VadaRound extends Round {
    private first!: RandomItem;
    private second!: RandomItem;

    constructor() { super(); }

    public getInstructions(): string[] {
        return instructions;
    }

    private generateEnclosedItem() {
        const out: RandomItem = {
            lines: [],
            matchGroup: "",
            header: "",
        };

        if (Math.random() > 0.5) {
            out.header = "if (goAhead) ";
            out.matchGroup = `{
    if (${getRandomWord()}) { }
}            `;
        } else {
            out.header = "const a = ";
            out.matchGroup = `[
    ${getRandomWord()},
    ${getRandomWord()},
]            `;
        }

        out.lines = (out.header + out.matchGroup).split('\n');
        return out;
    }

    public getTimeoutTime(diff: GameDifficulty): number {
        let out = 3000;
        switch (diff) {
            case GameDifficulty.Easy:
                out = 15000;
            break;
            case GameDifficulty.Medium:
                out = 12500;
            break;
            case GameDifficulty.Hard:
                out = 9500;
            break;
            case GameDifficulty.Nightmare:
                out = 7600;
            break;
        }

        console.log("Vada#getTimeoutTime", out);
        return out;
    }

    public async render(game: IGame): Promise<string[]> {
        try {
            const high = Math.random() > 0.5;
            console.log("vada#render 1", high);
            this.first = this.generateEnclosedItem();
            console.log("vada#render 2", this.first);
            this.second = this.generateEnclosedItem();
            console.log("vada#render 3", this.second);
            const items = this.first.lines.concat(this.second.lines);
            console.log("vada#render 4", items);
            const line = game.gameBuffer.midPointRandomPoint(high, items.length);
            console.log("vada#render 5", line);

            // TODO: this sucks
            const lines = getEmptyLines(line).concat(items).concat(
                getEmptyLines(game.state.lineLength - (items.length + line)));

            const jumpPoint = game.gameBuffer.midPointRandomPoint(!high);
            console.log("vada#render 5", jumpPoint, line, lines);

            await game.nvim.command(`:${String(jumpPoint)}`);

            return lines;
        } catch (e) {
            console.error("Error#Vada#render", e.message);
            console.error("Error#Vada#render", e.stack);
        }
        return [];
    }

    private comparable(header: string, matchGroup: string): string {
        return header + matchGroup.split("\n").map(l => l.trim()).join('');
    }

    public async isRoundComplete(game: IGame): Promise<boolean> {
        const lines = await game.gameBuffer.getGameLines();
        const contents = lines.map(l => l.trim()).join("");

        const expected = [
            this.comparable(this.first.header, this.second.matchGroup),
            this.comparable(this.second.header, this.first.matchGroup),
        ].join("");

        console.log("VADA#isRoundComplete", expected);
        console.log("VADA#isRoundComplete", contents);
        console.log("VADA#isRoundComplete", expected === contents);

        return expected === contents;
    }
}

