export default function wait(ms: number) {
    return new Promise(res => {
        setTimeout(res, ms);
    });
}

