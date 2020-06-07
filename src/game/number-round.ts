import { IGame } from "./types";
import { Round } from "./round";

const numberRoundInstructions = [
    'Use C-a and C-x to solve the math equation',
    "",
    ""
];

export class NumberRound extends Round {

    private firstNumber: number;
    private secondNumber: number;
    private answer: number;
    private fakeAnswer: number;
    private winLine: string;

    constructor() {
        super();
        this.firstNumber = 0;
        this.secondNumber = 0;
        this.answer = 0;
        this.fakeAnswer = 0;
        this.winLine = "";
    }

    public getInstructions(): string[] {
        return numberRoundInstructions;
    }

    public async render(game: IGame): Promise<string[]> {
        this.firstNumber = Math.floor(Math.random() * 10 + 1);
        this.secondNumber = Math.floor(Math.random() * 10 + 1);
        let addOrSubtract = "+";

        if(Math.random() > 0.5) {
            // Addition
            this.answer = this.firstNumber + this.secondNumber;
        }
        else {
            // Subtraction
            this.answer = this.firstNumber - this.secondNumber;
            addOrSubtract = "-";
        }
        this.winLine  = this.answer + " = " + this.firstNumber + " "
                + addOrSubtract + " " + this.secondNumber;

        do {
            this.fakeAnswer = Math.floor(Math.random() * 10 + 1);
        }
        while(this.answer == this.fakeAnswer);

        const lines = new Array(game.state.lineLength).fill("");
        lines[0] = this.fakeAnswer + " = " + this.firstNumber + " "
                + addOrSubtract + " " + this.secondNumber;

        console.log("number -- run#rendering", game.state.lineLength, lines);

        game.gameBuffer.clearBoard
        return lines;
    }

    public async isRoundComplete(game: IGame): Promise<boolean> {
        const lines = await game.gameBuffer.getGameLines();
        console.log("NumberRound#isRoundComplete", lines.indexOf(this.winLine) !== -1, lines);
        return lines.indexOf(this.winLine) !== -1;
    }
}


