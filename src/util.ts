import { assert, todo } from "tap";

export function WARN(cond: boolean, statement: string) {
    if (!cond) {
        console.error(`WARN: ${statement}`);
    }
}

export function CHECK_POSITIVE(t: any, statement?: string) {
    assert(isFinite(t), statement)
    assert(t > 0, statement)
}

export function CHECK_INT(t: any, statement?: string) {
    assert(Math.floor(t) === t, statement)
}

export function CHECK_NOT_NEGATIVE(t: any, statement?: string) {
    assert(isFinite(t), statement)
    assert(t >= 0, statement)
}

export function* enumerate<T>(gen: Iterable<T>): Generator<[number, T]> {
    let i = 0;
    for (let next of gen) {
        yield [i++, next];
    }
}

export function NEVER(): never {
    throw new Error("This should not happen");
}
export function TODO(message: string): never {
    throw new Error(`TODO: ${message}`);

}