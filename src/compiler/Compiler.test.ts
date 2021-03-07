import { ReverseNode } from "./nodes/ReverseNode"
import { Output } from "./nodes/Output"
import { ReverseNonControlInput } from "./nodes/inputs/ReverseNonControlInput"
import { ReferenceNonControlInput } from "./nodes/inputs/ReferenceNonControlInput"
import { LiteralBody } from "./nodes/bodies/LiteralBody"
import { PrefixyOperatorBody } from "./nodes/bodies/PrefixyOperatorBody"
import { InfixOperatorBody } from "./nodes/bodies/InfixOperatorBody"

import { test } from 'tap'

import * as vm from 'vm'
import { Compiler, CompilerOptions } from "./Compiler"
import { plusone_src } from "./examples/plusone"
import { Document } from "./Document"
import { timestwo_src } from "./examples/timestwo"
import { reverse_src } from "./examples/reverse"

export class VMRunner {
    constructor(
        public source: string
    ) { }
    eval(): ($start: any) => any {
        const context = vm.createContext({
            console
        })
        let wrap = `(function ($start){
            
            ${this.source}

            return $exit;
        });`
        let out = vm.runInContext(wrap, context, {
            timeout: 1000
        })
        return out
    }
}

function VMMakeFromSource(document: Document) {
    let opt = new CompilerOptions()
    let comp = new Compiler(opt)
    let src = document.ToJavaScript(comp)
    let run = new VMRunner(src)
    return run.eval()
}

test('Compiler', async ({ test }) => {
    test('Acceptance', async ({ test }) => {
        test('pluson', async ({ ok, equal }) => {
            let plusone = VMMakeFromSource(plusone_src)
            equal(plusone(1), 2)
            equal(plusone(0), 1)
        })
        test('timestwo', async ({ ok, equal }) => {
            let timestwo = VMMakeFromSource(timestwo_src)
            equal(timestwo(1), 2)
            equal(timestwo(0), 0)
            equal(timestwo(2), 4)
        })
        test('reverse', async ({ ok, equal }) => {
            let reverse = VMMakeFromSource(reverse_src)
            equal(reverse(1), -1)
            equal(reverse(0), 0)
            equal(reverse(2), -2)
        })
    })
})
