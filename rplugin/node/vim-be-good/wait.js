"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function wait(ms) {
    return new Promise(res => {
        setTimeout(res, ms);
    });
}
exports.wait = wait;
