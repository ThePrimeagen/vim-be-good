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
const round_1 = require("./round");
const instructions = [
    "Remove the x with using only h,j,k,l, and x.  Remember, this is for you to be better.",
    "Using the arrow keys only makes you dumber.  Trust me.  I am a scientist",
    "",
    "",
];
class HjklRound extends round_1.Round {
    constructor() {
        super();
    }
    getInstructions() {
        return instructions;
    }
    getRando(count = 4) {
        return (Math.random() * count) | 0;
    }
    // The goal is to make a required 4 keypresses to get to the x
    render(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const out = [
                '    '.split(''),
                '    '.split(''),
                '    '.split(''),
            ];
            let xX;
            let xY;
            let cX;
            let cY;
            do {
                xX = this.getRando();
                xY = this.getRando(3);
                cX = this.getRando();
                cY = this.getRando(3);
            } while (xX === cX || xY === cY);
            out[xY][xX] = 'x';
            console.log("hjkl Render", [xX, xY], [cX, cY]);
            yield game.nvim.command(`:${cY + game.gameBuffer.getOffset()}`);
            console.log("hjkl Render: Setting Position", cY + game.gameBuffer.getOffset());
            yield game.nvim.command(`:norm!_`);
            console.log("hjkl Render: norm!_");
            yield game.nvim.command(`:norm!${cX}h`);
            console.log(`hjkl Render: :norm!${cX}h`);
            return out.map(l => l.join(''));
        });
    }
    isRoundComplete(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield game.gameBuffer.getGameLines();
            const contents = lines.map((l) => l.trim()).join("");
            return contents.length === 0;
        });
    }
}
exports.HjklRound = HjklRound;
