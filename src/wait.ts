export default function wait<T>(ms: number): Promise<T> {
    return new Promise(res => {
        setTimeout(res, ms);
    });
}
