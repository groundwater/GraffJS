import { Compiler } from '../Compiler';
import { enumerate } from '../util';
import { NodeBody } from './bodies/NodeBody';
import { Input } from './inputs/Input';
import { Node } from './Node';

export class ReverseNode extends Node {
    constructor(
        protected body: NodeBody,
        protected inputs: Input[] = []
    ) { super(); }
    *WriteNode(): IterableIterator<string> { }
    *WriteDeclareNode(compiler: Compiler, index: number): IterableIterator<string> {
        let name = compiler.Var(index);
        yield compiler.WrapLine(`function ${compiler.Fun(index)}() {`);
        for (let bodyCompiler of compiler.Indented()) {
            yield bodyCompiler.WrapStatement(`var ${name}`);
            for (let [slot, ncis] of enumerate(this.inputs)) {
                yield* ncis.WriteDeclare(bodyCompiler, index, slot);
                yield* ncis.Write(bodyCompiler, index, slot);
            }
            yield* this.body.Write(bodyCompiler, index);
            yield bodyCompiler.WrapStatement(`return ${name}`);
        }
        yield compiler.WrapStatement(`}`);
    }
}
