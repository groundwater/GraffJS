import { CHECK_INT, CHECK_POSITIVE } from "./util"

export function FuzzIntRangeInclusive(min: number = Number.MIN_SAFE_INTEGER, max: number = Number.MAX_SAFE_INTEGER) {
    CHECK_INT(min)
    CHECK_INT(max)
    return Math.floor(Math.random() * (max - min)) + min
}
