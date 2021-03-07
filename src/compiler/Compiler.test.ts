import { IRReverseNode } from "./ir/IRReverseNode"
import { IROutput } from "./ir/IROutput"
import { IRReverseNonControlInput } from "./ir/inputs/IRReverseNonControlInput"
import { IRReferenceNonControlInput } from "./ir/inputs/IRReferenceNonControlInput"
import { IRLiteralBody } from "./ir/bodies/IRLiteralBody"
import { IRPrefixyOperatorBody } from "./ir/bodies/IRPrefixyOperatorBody"
import { IRInfixOperatorBody } from "./ir/bodies/IRInfixOperatorBody"

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
