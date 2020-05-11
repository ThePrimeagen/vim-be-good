export function join(...args: any[]): string {
    return args.
        map(x => typeof x === 'object' ? JSON.stringify(x) : x).
        join(' ');
}


