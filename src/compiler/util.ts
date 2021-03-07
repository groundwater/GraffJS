
export function CHECK(cond: boolean, statement: string) {
    if (!cond) {
        console.error(`WARN: ${statement}`);
    }
}

export function* enumerate<T>(gen: Iterable<T>): Generator<[number, T]> {
    let i = 0;
    for (let next of gen) {
        yield [i++, next];
    }
}
