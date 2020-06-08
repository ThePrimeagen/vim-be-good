"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const round_1 = require("./round");
const base_1 = require("./base");
const game_buffer_1 = require("../game-buffer");
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
class VadaRound extends round_1.Round {
    constructor() { super(); }
    getInstructions() {
        return instructions;
    }
    generateEnclosedItem() {
        const out = {
            lines: [],
            matchGroup: "",
            header: "",
        };
        if (Math.random() > 0.5) {
            out.header = "if (goAhead) ";
            out.matchGroup = `{
    if (${base_1.getRandomWord()}) { }
}            `;
        }
        else {
            out.header = "const a = ";
            out.matchGroup = `[
    ${base_1.getRandomWord()},
    ${base_1.getRandomWord()},
]            `;
        }
        out.lines = (out.header + out.matchGroup).split('\n');
        return out;
    }
    getTimeoutTime(diff) {
        let out = 3000;
        switch (diff) {
            case types_1.GameDifficulty.Easy:
                out = 15000;
                break;
            case types_1.GameDifficulty.Medium:
                out = 12500;
                break;
            case types_1.GameDifficulty.Hard:
                out = 9500;
                break;
            case types_1.GameDifficulty.Nightmare:
                out = 7600;
                break;
        }
        console.log("Vada#getTimeoutTime", out);
        return out;
    }
    render(game) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const lines = game_buffer_1.getEmptyLines(line).concat(items).concat(game_buffer_1.getEmptyLines(game.state.lineLength - (items.length + line)));
                const jumpPoint = game.gameBuffer.midPointRandomPoint(!high);
                console.log("vada#render 5", jumpPoint, line, lines);
                yield game.nvim.command(`:${String(jumpPoint)}`);
                return lines;
            }
            catch (e) {
                console.error("Error#Vada#render", e.message);
                console.error("Error#Vada#render", e.stack);
            }
            return [];
        });
    }
    comparable(header, matchGroup) {
        return header + matchGroup.split("\n").map(l => l.trim()).join('');
    }
    isRoundComplete(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield game.gameBuffer.getGameLines();
            const contents = lines.map(l => l.trim()).join("");
            const expected = [
                this.comparable(this.first.header, this.second.matchGroup),
                this.comparable(this.second.header, this.first.matchGroup),
            ].join("");
            console.log("VADA#isRoundComplete", expected);
            console.log("VADA#isRoundComplete", contents);
            console.log("VADA#isRoundComplete", expected === contents);
            return expected === contents;
        });
    }
}
exports.VadaRound = VadaRound;
