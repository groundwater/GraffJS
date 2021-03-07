import assert from 'assert'

function CHECK(cond: boolean, statement: string) {
    if (!cond) {
        console.error(`WARN: ${statement}`)
    }
}

function* enumerate<T>(gen: Iterable<T>): Generator<[number, T]> {
    let i = 0
    for (let next of gen) {
        yield [i++, next]
    }
}

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
    Var(index: number, slot: number = -1) {
        if (slot > -1) {
            return `$n${index}_${slot}`
        } else {
            return `$n${index}`
        }
    }
    Fun(index: number, _slot_ignored?: number) {
        return `f$${index}`
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
export class InfixOperatorBody extends NodeBody {
    constructor(
        public infix: string
    ) { super() }
    *Write(compiler: Compiler, prefix: string) {
        yield compiler.WrapStatement(`${prefix} = (${prefix}_0 ${this.infix} ${prefix}_1)`)
    }
}
export class PrefixyOperatorBody extends NodeBody {
    constructor(
        public prefix: string
    ) { super() }
    *Write(compiler: Compiler, prefix: string) {
        yield compiler.WrapStatement(`${prefix} = (${this.prefix}${prefix}_0)`)
    }
}
export class PostfixOperatorBody extends NodeBody {
    constructor(
        public postfix: string
    ) { super() }
    *Write(compiler: Compiler, prefix: string) {
        yield compiler.WrapStatement(`${prefix} = (${prefix}_0${this.postfix})`)
    }
}
export class CallableBody extends NodeBody {
    constructor(
        public body: string,
        public argsN: number = 0,
    ) { super() }
    *Write(compiler: Compiler, prefix: string) {
        let args = []
        for (let i = 0; i < this.argsN; i++) {
            args.push(`${prefix}_${i}`)
        }
        yield compiler.WrapStatement(`${prefix} = (${this.body}(${args.join(', ')}))`)
    }
}
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
        for (let [index, node] of enumerate(this.nodes)) {
            yield* node.DeclareNode(compiler, index)
        }
        yield compiler.WrapStatement(`var $fc = ${this.start}`)
        yield compiler.WrapLine(`steps: while(true) {`)
        for (let whileCompiler of compiler.Indented()) {
            yield whileCompiler.WrapLine(`switch ($fc) {`)
            for (let switchCompiler of whileCompiler.Indented()) {
                for (let [index, node] of enumerate(this.nodes)) {
                    yield* node.WriteNode(switchCompiler, index)
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
    HeadNode() {
        return this.head_node_index
    }
    HeadSlot() {
        return this.head_slot_index
    }
    Dest(): [number, number] {
        return [this.head_node_index, this.head_slot_index]
    }
    Source(): [number, number] {
        return [this.tail_node_index, this.tail_slot_index]
    }
}
export class ReverseArrow {
    constructor(
        public tail_node_index: number,
        public head_node_index: number,
        public tail_slot_index: number = 0,
        public head_slot_index: number = -1,
    ) { }
    Source(): [number, number] {
        return [this.tail_node_index, this.tail_slot_index]
    }
    Dest(): [number, number] {
        return [this.head_node_index, this.head_slot_index]
    }
}
export abstract class Input {
    abstract WriteDeclare(compiler: Compiler, local: number, slot: number): Generator<string>
    abstract Write(compiler: Compiler, local: number, slot: number): Generator<string>
}
export abstract class NonControlInput extends Input {
    *WriteDeclare(compiler: Compiler, local: number, slot: number): Generator<string> {
        yield compiler.WrapStatement(`var ${compiler.Var(local, slot)}`)
    }
}
export class ReferenceNonControlInput extends NonControlInput {
    constructor(
        protected node_index: number,
        protected slot_index: number = -1,
    ) { super() }
    *Write(compiler: Compiler, local: number, slot: number) {
        CHECK(local !== this.node_index, 'No Self References')
        if (this.slot_index > -1) {
            yield compiler.WrapStatement(`${compiler.Var(local, slot)} = ${compiler.Var(this.node_index, this.slot_index)}`)
        } else {
            yield compiler.WrapStatement(`${compiler.Var(local, slot)} = ${compiler.Var(this.node_index)}`)
        }
    }
}
export class ReverseNonControlInput extends NonControlInput {
    constructor(
        protected node_index: number,
    ) { super() }
    *Write(compiler: Compiler, local: number, slot: number) {
        yield compiler.WrapStatement(`${compiler.Var(local, slot)} = ${compiler.Fun(this.node_index)}()`)
    }
}
export class ControlInput extends Input {
    constructor(
        protected slot: number = 0,
    ) { super() }
    Slot(): number {
        return this.slot
    }
    *WriteDeclare() { }
    *Write(compiler: Compiler, local: number, slot: number) {
        yield compiler.WrapStatement(`${compiler.Var(local, slot)} = ${compiler.Var(local)}_in`)
    }
}
export class Output {
    constructor(
        // protected fwd_arrow: ForwardArrow,
        protected dest_node: number,
        // protected dest_slot: number = fwd_arrow.Dest()[1],
    ) { }
    // GetArrow(): ForwardArrow {
    //     return this.fwd_arrow
    // }
    *WriteSetForwardControl(compiler: Compiler) {
        yield compiler.WrapStatement(`$fc = ${this.dest_node}`)
    }
    *WriteCopyValue(compiler: Compiler, source_var: string) {
        yield compiler.WrapStatement(`${compiler.Var(this.dest_node)}_in = ${source_var}`)
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
    abstract DeclareNode(compiler: Compiler, index: number): IterableIterator<string>
    abstract WriteNode(compiler: Compiler, index: number): IterableIterator<string>
}
export class ForwardNode extends Node {
    constructor(
        protected body: NodeBody,
        protected non_control_inputs: Input[],
        protected output?: Output,
    ) {
        super()
    }
    *WriteNode(compiler: Compiler, index: number): IterableIterator<string> {
        let name = compiler.Var(index)
        yield compiler.WrapLine(`case ${index}: {`)
        for (let caseCompiler of compiler.Indented()) {
            // References
            for (let [slot, ncis] of enumerate(this.non_control_inputs)) {
                yield* ncis.Write(caseCompiler, index, slot)
            }

            // Body
            yield* this.body.Write(caseCompiler, name)

            // Output
            if (this.output) {
                yield* this.output.WriteSetForwardControl(caseCompiler)
                yield* this.output.WriteCopyValue(caseCompiler, name)
            } else {
                yield caseCompiler.WrapStatement(`$fc = -1`)
                yield caseCompiler.WrapStatement(`$exit = ${name}`)
            }
            yield caseCompiler.WrapStatement(`continue steps`)
        }
        yield compiler.WrapStatement(`}`)
    }
    * DeclareNode(compiler: Compiler, index: number) {
        assert(index > -1)
        let name = compiler.Var(index)
        yield compiler.WrapStatement(`var ${name}`)
        yield compiler.WrapStatement(`var ${name}_in`)
        for (let [slot, nci] of enumerate(this.non_control_inputs)) {
            yield* nci.WriteDeclare(compiler, index, slot)
        }
    }
}
export class ReverseNode extends Node {
    constructor(
        protected body: NodeBody,
        protected inputs: Input[] = [],
    ) { super() }
    *WriteNode(): IterableIterator<string> { }
    *DeclareNode(compiler: Compiler, index: number): IterableIterator<string> {
        let name = compiler.Var(index)
        yield compiler.WrapLine(`function ${compiler.Fun(index)}() {`)
        for (let bodyCompiler of compiler.Indented()) {
            yield bodyCompiler.WrapStatement(`var ${name}`)
            for (let [slot, ncis] of enumerate(this.inputs)) {
                yield* ncis.WriteDeclare(bodyCompiler, index, slot)
                yield* ncis.Write(bodyCompiler, index, slot)
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
            new LiteralBody(1),
            [
                new ControlInput()
            ],
            new Output(1),
        ),
        new ForwardNode(
            new ExpressionBody(
                `$0 + $1`,
            ),
            [
                new ControlInput(),
                new ReverseNonControlInput(2)
            ],
            new Output(3)
        ),
        new ReverseNode(
            new ExpressionBody(`$0 + 1`),
            [
                new ReferenceNonControlInput(0)
            ]
        ),
        new ForwardNode(
            new InfixOperatorBody('*'),
            [
                new ReferenceNonControlInput(0),
                new ControlInput(1),
            ],
            new Output(4)
        ),
        new ForwardNode(
            new PrefixyOperatorBody('-'),
            [
                new ControlInput()
            ]
        )
    ])
)

let comp = new Compiler(new CompilerOptions())
console.log(Array.from(jsdoc.Write(comp)).join(''))
