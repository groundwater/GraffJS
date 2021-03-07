import { Compiler } from './Compiler';
import { enumerate } from './util';
import { Node } from './nodes/Node';

export class Graff {
    *Write(compiler: Compiler): IterableIterator<string> {
        yield compiler.WrapStatement(`var $exit`);
        for (let [index, node] of enumerate(this.nodes)) {
            yield* node.WriteDeclareNode(compiler, index);
        }
        yield compiler.WrapStatement(`var $fc = ${this.start}`);
        yield compiler.WrapStatement(`var ${compiler.VarIn(0)} = $start`)
        yield compiler.WrapLine(`steps: while(true) {`);
        for (let whileCompiler of compiler.Indented()) {
            yield whileCompiler.WrapLine(`switch ($fc) {`);
            for (let switchCompiler of whileCompiler.Indented()) {
                for (let [index, node] of enumerate(this.nodes)) {
                    yield* node.WriteNode(switchCompiler, index);
                }
                yield switchCompiler.WrapLine(`default: {`);
                yield switchCompiler.IndentWrapStatement(`break steps`);
                yield switchCompiler.WrapLine(`}`);
            }
            yield whileCompiler.WrapLine(`}`);
        }
        yield compiler.WrapLine(`}`);
    }
    constructor(
        public nodes: Node[],
        public start: number = 0
    ) { }
}
