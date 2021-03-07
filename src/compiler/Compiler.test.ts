import { ReverseNode } from "./nodes/ReverseNode"
import { Output } from "./nodes/Output"
import { ReverseNonControlInput } from "./nodes/inputs/ReverseNonControlInput"
import { ReferenceNonControlInput } from "./nodes/inputs/ReferenceNonControlInput"
import { LiteralBody } from "./nodes/bodies/LiteralBody"
import { PrefixyOperatorBody } from "./nodes/bodies/PrefixyOperatorBody"
import { InfixOperatorBody } from "./nodes/bodies/InfixOperatorBody"

import { test } from 'tap'

import { plusone_src } from "./examples/plusone"
import { timestwo_src } from "./examples/timestwo"
import { reverse_src } from "./examples/reverse"
import { DocumentToJSFunction } from "../virtualmachine/ScriptVM"

test('Compiler', async ({ test }) => {
    test('Acceptance', async ({ test }) => {
        test('pluson', async ({ ok, equal }) => {
            let plusone = DocumentToJSFunction(plusone_src)
            equal(plusone(1), 2)
            equal(plusone(0), 1)
        })
        test('timestwo', async ({ ok, equal }) => {
            let timestwo = DocumentToJSFunction(timestwo_src)
            equal(timestwo(1), 2)
            equal(timestwo(0), 0)
            equal(timestwo(2), 4)
        })
        test('reverse', async ({ ok, equal }) => {
            let reverse = DocumentToJSFunction(reverse_src)
            equal(reverse(1), -1)
            equal(reverse(0), 0)
            equal(reverse(2), -2)
        })
    })
})
