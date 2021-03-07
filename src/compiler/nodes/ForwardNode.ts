import assert from 'assert';
import { Compiler } from '../Compiler';
import { enumerate } from '../util';
import { NodeBody } from './bodies/NodeBody';
import { Input } from './inputs/Input';
import { Output } from './Output';
import { Node } from './Node';

export class ForwardNode extends Node {
    constructor(
        protected body: NodeBody,
        protected non_control_inputs: Input[],
        protected output?: Output
    ) {
        super();
    }
    *WriteNode(compiler: Compiler, index: number): IterableIterator<string> {
        let name = compiler.Var(index);
        yield compiler.WrapLine(`case ${index}: {`);
        for (let caseCompiler of compiler.Indented()) {
            // References
            for (let [slot, ncis] of enumerate(this.non_control_inputs)) {
                yield* ncis.Write(caseCompiler, index, slot);
            }

            // Body
            yield* this.body.Write(caseCompiler, index);

            // Output
            if (this.output) {
                yield* this.output.WriteSetForwardControl(caseCompiler);
                yield* this.output.WriteCopyValue(caseCompiler, name);
            } else {
                yield caseCompiler.WrapStatement(`$fc = -1`);
                yield caseCompiler.WrapStatement(`$exit = ${name}`);
            }
            yield caseCompiler.WrapStatement(`continue steps`);
        }
        yield compiler.WrapStatement(`}`);
    }
    *WriteDeclareNode(compiler: Compiler, index: number) {
        assert(index > -1);
        let name = compiler.Var(index);
        yield compiler.WrapStatement(`var ${compiler.Var(index)}`);
        yield compiler.WrapStatement(`var ${compiler.VarIn(index)}`);
        for (let [slot, nci] of enumerate(this.non_control_inputs)) {
            yield* nci.WriteDeclare(compiler, index, slot);
        }
    }
}
