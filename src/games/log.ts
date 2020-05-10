import { Neovim } from 'neovim';

export function join(...args: any[]): string {
    return args.
        map(x => typeof x === 'object' ? JSON.stringify(x) : x).
        join(' ');
}

// LOOK ITS PRINTLN!!
export async function log(nvim: Neovim, ...args: (string | number)[]) {
    await nvim.outWrite(join(...args).concat('\n'));
}

