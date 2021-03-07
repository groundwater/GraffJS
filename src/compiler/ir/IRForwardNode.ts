import assert from 'assert';
import { Compiler } from '../Compiler';
import { enumerate } from '../../util';
import { IRNodeBody } from './bodies/IRNodeBody';
import { IRInput } from './inputs/IRInput';
import { IROutput } from './IROutput';
import { IRNode } from './IRNode';

export class IRForwardNode extends IRNode {
    constructor(
        protected body: IRNodeBody,
        protected non_control_inputs: IRInput[],
        protected output?: IROutput
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
