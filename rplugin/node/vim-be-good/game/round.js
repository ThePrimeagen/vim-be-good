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
class Round {
    reset() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getTimeoutTime(diff) {
        let out = 1000;
        switch (diff) {
            case types_1.GameDifficulty.Easy:
                out = 5000;
                break;
            case types_1.GameDifficulty.Medium:
                out = 3500;
                break;
            case types_1.GameDifficulty.Hard:
                out = 2500;
                break;
            case types_1.GameDifficulty.Nightmare:
                out = 1600;
                break;
        }
        console.log("Round#getTimeoutTime", out);
        return out;
    }
    isTimedRound() {
        return true;
    }
}
exports.Round = Round;
