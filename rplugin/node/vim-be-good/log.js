"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function join(...args) {
    return args.
        map(x => typeof x === 'object' ? JSON.stringify(x) : x).
        join(' ');
}
exports.join = join;
