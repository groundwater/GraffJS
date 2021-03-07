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
    VarIn(index: number) {
        return `${this.Var(index)}_in`
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
    abstract Write(compiler: Compiler, index: number): Generator<string>
}
export class ExpressionBody extends NodeBody {
    constructor(
        public UNSAFE_body: string
    ) { super() }
    *Write(compiler: Compiler, index: number) {
        let out = []
        let line = this.UNSAFE_body
        while (true) {
            let next = line.match(/\$\d+?/)
            if (!next) break
            let { index: match_index, 0: match } = next
            assert(match_index !== undefined)
            out.push(line.substr(0, match_index))
            let sub = line.substring(match_index + 1, match_index + 1 + match.length)
            let slot = parseInt(sub)
            assert(isFinite(slot))
            out.push(compiler.Var(index, slot))
            line = line.substr(match_index + match.length)
        }
        out.push(line)
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${out.join('')})`)
    }
}
export class InfixOperatorBody extends NodeBody {
    constructor(
        public infix: string
    ) { super() }
    *Write(compiler: Compiler, index: number) {
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${compiler.Var(index, 0)} ${this.infix}${compiler.Var(index, 1)})`)
    }
}
export class PrefixyOperatorBody extends NodeBody {
    constructor(
        public prefix: string
    ) { super() }
    *Write(compiler: Compiler, index: number) {
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${this.prefix}${compiler.Var(index, 0)})`)
    }
}
export class PostfixOperatorBody extends NodeBody {
    constructor(
        public postfix: string
    ) { super() }
    *Write(compiler: Compiler, index: number) {
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${compiler.Var(index, 0)}${this.postfix})`)
    }
}
export class CallableBody extends NodeBody {
    constructor(
        public body: string,
        public argsN: number = 0,
    ) { super() }
    *Write(compiler: Compiler, index: number) {
        let args = []
        for (let i = 0; i < this.argsN; i++) {
            args.push(`${compiler.Var(index, i)}`)
        }
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${this.body}(${args.join(', ')}))`)
    }
}
export class LiteralBody extends NodeBody {
    constructor(
        public value: any
    ) { super() }
    *Write(compiler: Compiler, index: number) {
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${this.value})`)
    }
}
export class Nodes {
    *Write(compiler: Compiler): IterableIterator<string> {
        yield compiler.WrapStatement(`var $start = module`)
        yield compiler.WrapStatement(`var $exit`)
        for (let [index, node] of enumerate(this.nodes)) {
            yield* node.WriteDeclareNode(compiler, index)
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
    *WriteDeclare(compiler: Compiler, local: number, slot: number) {
        yield compiler.WrapStatement(`var ${compiler.Var(local, slot)}`)
    }
    *Write(compiler: Compiler, local: number, slot: number) {
        yield compiler.WrapStatement(`${compiler.Var(local, slot)} = ${compiler.VarIn(local)}`)
    }
}
export class Output {
    constructor(
        protected dest_node: number,
    ) { }
    *WriteSetForwardControl(compiler: Compiler) {
        yield compiler.WrapStatement(`$fc = ${this.dest_node}`)
    }
    *WriteCopyValue(compiler: Compiler, source_var: string) {
        yield compiler.WrapStatement(`${compiler.VarIn(this.dest_node)} = ${source_var}`)
    }
}
export abstract class Node {
    abstract WriteDeclareNode(compiler: Compiler, index: number): IterableIterator<string>
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
            yield* this.body.Write(caseCompiler, index)

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
    * WriteDeclareNode(compiler: Compiler, index: number) {
        assert(index > -1)
        let name = compiler.Var(index)
        yield compiler.WrapStatement(`var ${compiler.Var(index)}`)
        yield compiler.WrapStatement(`var ${compiler.VarIn(index)}`)
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
    *WriteDeclareNode(compiler: Compiler, index: number): IterableIterator<string> {
        let name = compiler.Var(index)
        yield compiler.WrapLine(`function ${compiler.Fun(index)}() {`)
        for (let bodyCompiler of compiler.Indented()) {
            yield bodyCompiler.WrapStatement(`var ${name}`)
            for (let [slot, ncis] of enumerate(this.inputs)) {
                yield* ncis.WriteDeclare(bodyCompiler, index, slot)
                yield* ncis.Write(bodyCompiler, index, slot)
            }
            yield* this.body.Write(bodyCompiler, index)
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
                new ControlInput(),
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
