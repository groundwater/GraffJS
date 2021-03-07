import assert from 'assert'
import { realpath } from 'node:fs'

export class CompilerOptions {
    constructor(
        public indent_spaces = 2,
        public semicolons: boolean = true,
        public newlines: boolean = true,
    ) { }
}
export class Compiler {
    constructor(
        protected options: CompilerOptions,
        protected depth = 0,
    ) { }
    protected End() {
        return this.options.semicolons ? ';' : ''
    }
    protected EndLine() {
        return this.options.newlines ? '\n' : ''
    }
    Indent() {
        if (this.depth > 0) {
            let spaces = ' '.repeat(this.options.indent_spaces)
            let indent = spaces.repeat(this.depth)
            return indent
        } else {
            return ''
        }
    }
    WrapStatement(line: string): string {
        return this.Indent() + line + this.End() + this.EndLine()
    }
    WrapLine(text: string) {
        return this.Indent() + text + this.EndLine()
    }
    *Indented() {
        yield new Compiler(this.options, this.depth + 1)
    }
    IndentWrapStatement(statemetn: string): string {
        for (let compiler of this.Indented()) {
            return compiler.WrapStatement(statemetn)
        }
        throw new Error('Unexpected')
    }
}
export class Document {
    constructor(
        public header: JSHeader,
        public nodes: Nodes,
    ) { }
    *Write(compiler: Compiler): IterableIterator<string> {
        yield this.header.script + '\n'
        yield* this.nodes.Write(compiler)
        yield `console.log({$exit})`
    }
}
export class JSHeader {
    constructor(
        public script: string
    ) { }
}
export abstract class NodeBody {
    abstract Write(compiler: Compiler, prefix: string): Generator<string>
}
export class ExpressionBody extends NodeBody {
    constructor(
        public UNSAFE_body: string
    ) { super() }
    *Write(compiler: Compiler, prefix: string) {
        let o = this.UNSAFE_body.replaceAll(/\$(\d+)/g, `${prefix}_$1`)
        yield compiler.WrapStatement(`${prefix} = (${o})`)
    }
}
// export class InfixOperatorBody extends NodeBody {
//     *scriptify(prefix: string) {
//         throw new Error("Method not implemented.")
//     }
// }
// export class UnitaryOperatorBody extends NodeBody {
//     *scriptify(prefix: string) {
//         throw new Error("Method not implemented.")
//     }
// }
// export class MethodBody extends NodeBody {
//     *scriptify(prefix: string) {
//         throw new Error("Method not implemented.")
//     }
// }
// export class FunctionBody extends NodeBody {
//     *scriptify(prefix: string) {
//         throw new Error("Method not implemented.")
//     }
// }
export class LiteralBody extends NodeBody {
    constructor(
        public value: any
    ) { super() }
    *Write(compiler: Compiler, prefix: string) {
        yield compiler.WrapStatement(`${prefix} = (${this.value})`)
    }
}
export class Nodes {
    *Write(compiler: Compiler): IterableIterator<string> {
        yield compiler.WrapStatement(`var $start = module`)
        yield compiler.WrapStatement(`var $exit`)
        for (let node of this.nodes) {
            yield* node.DeclareNode(compiler)
        }
        yield compiler.WrapStatement(`var $fc = ${this.start}`)
        yield compiler.WrapLine(`steps: while(true) {`)
        for (let whileCompiler of compiler.Indented()) {
            yield whileCompiler.WrapLine(`switch ($fc) {`)
            for (let switchCompiler of whileCompiler.Indented()) {
                for (let node of this.nodes) {
                    yield* node.ImplementNode(switchCompiler, this)
                }
                yield switchCompiler.WrapLine(`default: {`)
                yield switchCompiler.IndentWrapStatement(`break steps`)
                yield switchCompiler.WrapLine(`}`)
            }
            yield whileCompiler.WrapLine(`}`)
        }
        yield compiler.WrapLine(`}`)
    }
    constructor(
        public nodes: Node[],
        public start: number = 0,
    ) { }
}
export class ForwardArrow {
    constructor(
        protected tail_node_index: number,
        protected head_node_index: number,
        protected head_slot_index: number = 0,
        protected tail_slot_index: number = -1,
    ) {
        assert(head_node_index > -1)
    }
    TailNode() {
        return `$n${this.tail_node_index}`
    }
    HeadSlot() {
        return `${this.HeadNode()}_${this.head_slot_index}`
    }
    HeadNode() {
        return `$n${this.head_node_index}`
    }
    TailSlot() {
        if (this.tail_slot_index > -1) {
            return `${this.TailNode}_${this.tail_slot_index}`
        } else {
            return this.TailNode()
        }
    }
    HeadIndex() {
        return this.head_node_index
    }
}
export class ReverseArrow {
    constructor(
        public tail_node_index: number,
        public head_node_index: number,
        public tail_slot_index: number = 0,
        public head_slot_index: number = -1,
    ) { }
    TailNode() {
        return `$n${this.tail_node_index}`
    }
    TailSlot() {
        return `${this.TailNode()}_${this.tail_slot_index}`
    }
    HeadNode() {
        return `$n${this.head_node_index}`
    }
    HeadSlot() {
        if (this.head_slot_index > -1) {
            return `${this.HeadNode}_${this.tail_slot_index}`
        } else {
            return this.HeadNode()
        }
    }
}
export class Input {
    constructor(
        protected rev_arrow: ReverseArrow,
    ) { }
}
export class ControlInput {
    constructor(
        protected fwd_arrow: ForwardArrow,
    ) { }
}
export abstract class NonControlInput {
    abstract Write(): string
    Declare() {
        return `var $n${this.rev_arrow.tail_node_index}_${this.rev_arrow.tail_slot_index}`
    }
    constructor(
        protected rev_arrow: ReverseArrow,
    ) { }
    Arrow() {
        return this.rev_arrow
    }
}
export class ReferenceNonControlInput extends NonControlInput {
    Write(): string {
        return `${this.rev_arrow.TailSlot()} = ${this.rev_arrow.HeadSlot()}`
    }
}
export class ReverseNonControlInput extends NonControlInput {
    Write(): string {
        return `${this.rev_arrow.TailSlot()} = f${this.rev_arrow.HeadNode()}()`
    }
}
export class InputReference extends Input {
}
export class InputReverseNode extends Input {
}
export class Output {
    constructor(
        protected fwd_arrow: ForwardArrow,
    ) { }
    GetArrow(): ForwardArrow {
        return this.fwd_arrow
    }
    WriteSetForwardControl() {
        return `$fc = ${this.fwd_arrow.HeadIndex()}`
    }
    WriteCopyValue(): string {
        return `${this.fwd_arrow.HeadSlot()} = ${this.fwd_arrow.TailSlot()}`
    }
}
export class ReverseOutput {
    constructor(
        protected rev_arrow: ReverseArrow,
    ) { }
    GetArrow(): ReverseArrow {
        return this.rev_arrow
    }
}
export abstract class Node {
    constructor(
        protected index: number,
    ) { }
    Name(): string {
        return `$n${this.index}`
    }
    abstract DeclareNode(compiler: Compiler): IterableIterator<string>
    abstract ImplementNode(compiler: Compiler, nodes: Nodes): IterableIterator<string>
}
export class ForwardNode extends Node {
    constructor(
        protected index: number,
        protected body: NodeBody,
        protected control_input: ControlInput,
        protected non_control_inputs: NonControlInput[],
        protected output?: Output,
    ) {
        super(index)
    }
    *ImplementNode(compiler: Compiler, nodes: Nodes): IterableIterator<string> {
        let name = this.Name()
        yield compiler.WrapLine(`case ${this.index}: {`)
        for (let caseCompiler of compiler.Indented()) {
            // References
            for (let ncis of this.non_control_inputs) {
                yield caseCompiler.WrapStatement(ncis.Write())
            }

            // Body
            yield* this.body.Write(caseCompiler, name)

            // Output
            if (this.output) {
                yield caseCompiler.WrapStatement(this.output.WriteSetForwardControl())
                yield caseCompiler.WrapStatement(this.output.WriteCopyValue())
            } else {
                yield caseCompiler.WrapStatement(`$fc = -1`)
                yield caseCompiler.WrapStatement(`$exit = ${name}`)
            }
            yield caseCompiler.WrapStatement(`continue steps`)
        }
        yield compiler.WrapStatement(`}`)
    }
    * DeclareNode(compiler: Compiler) {
        assert(this.index > -1)
        let name = this.Name()
        yield compiler.WrapStatement(`var ${name}`)
        for (let nci of this.non_control_inputs) {
            yield compiler.WrapStatement(nci.Declare())
        }
    }
}
export class ReverseNode extends Node {
    constructor(
        protected index: number,
        protected body: NodeBody,
        protected output: ReverseOutput,
        protected inputs: NonControlInput[] = [],
    ) { super(index) }
    *ImplementNode(): IterableIterator<string> { }
    *DeclareNode(compiler: Compiler): IterableIterator<string> {
        let name = this.Name()
        yield compiler.WrapLine(`function f${name}() {`)
        for (let bodyCompiler of compiler.Indented()) {
            yield bodyCompiler.WrapStatement(`var ${name}`)
            for (let ncis of this.inputs) {
                yield bodyCompiler.WrapStatement(ncis.Write())
            }
            yield* this.body.Write(bodyCompiler, name)
            yield bodyCompiler.WrapStatement(`return ${name}`)
        }
        yield compiler.WrapStatement(`}`)
    }
}
let jsdoc = new Document(
    new JSHeader('"use-strict"'),
    new Nodes([
        new ForwardNode(
            0,
            new LiteralBody(1),
            new ControlInput(new ForwardArrow(-1, 0)),
            [],
            new Output(new ForwardArrow(0, 1)),
        ),
        new ForwardNode(
            1,
            new ExpressionBody(
                `$0 + $1`,
            ),
            new ControlInput(new ForwardArrow(0, 1)),
            [
                new ReverseNonControlInput(new ReverseArrow(1, 2, 1))
            ],
        ),
        new ReverseNode(
            2,
            new ExpressionBody(`$0 + 1`),
            new ReverseOutput(new ReverseArrow(1, 2)),
            [
                new ReferenceNonControlInput(new ReverseArrow(2, 0))
            ]
        )
    ])
)

let comp = new Compiler(new CompilerOptions())
console.log(Array.from(jsdoc.Write(comp)).join(''))
