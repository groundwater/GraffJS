import assert from 'assert'

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
    *scriptify(compiler: Compiler): IterableIterator<string> {
        yield this.header.script + '\n'
        yield* this.nodes.scriptify(compiler)
        yield `console.log({$exit})`
    }
}
export class JSHeader {
    constructor(
        public script: string
    ) { }
}
export abstract class NodeBody {
    abstract scriptify(compiler: Compiler, prefix: string, exits: number[]): Generator<string, number, void>
}
export class ExpressionBody extends NodeBody {
    constructor(
        public UNSAFE_body: string
    ) { super() }
    *scriptify(compiler: Compiler, prefix: string, exists: number[]) {
        let o = this.UNSAFE_body.replaceAll(/\$(\d+)/g, `${prefix}_$1`)
        yield compiler.WrapStatement(`${prefix} = (${o})`)
        return exists[0]
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
    *scriptify(compiler: Compiler, prefix: string, exits: number[]) {
        assert(exits.length === 1)
        yield compiler.WrapStatement(`${prefix} = (${this.value})`)
        return exits[0]
    }
}
export class Nodes {
    GetInputArrowReference(source_index: number, dest_index: number): string {
        assert(source_index < this.nodes.length)
        let source = this.nodes[source_index]
        assert(source)
        if (dest_index === -1) {
            return `$exit = ${source.Name()}`
        }
        let dest = this.nodes[dest_index]
        assert(dest_index < this.nodes.length)
        assert(dest)
        return dest.InputValue().CopyIndex(source.Name(), dest.Name())
    }
    *scriptify(compiler: Compiler): IterableIterator<string> {
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
export class Value {
    constructor(
        protected index: number,
    ) { }
    FormatIndex(): string {
        assert(this.index == Math.floor(this.index))
        return String(this.index)
    }
}
export class ReferenceValue extends Value {
    constructor(
        protected index: number,
        protected reference_node: string,
    ) { super(index) }
}
export class InputValue extends Value {
    constructor(
        protected index: number,
        protected copy: number = -1,
    ) { super(index) }
    CopyIndex(source: string, dest: string) {
        if (this.copy > -1) {
            return `${dest}_${this.index} = ${source}_${this.copy}`
        } else {
            return `${dest}_${this.index} = ${source}`
        }
    }
}
export class ReverseNodeValue extends Value {
    constructor(
        protected index: number,
        protected reverse_node: string,
    ) {
        super(index)
    }
}
export abstract class Node {
    constructor(
        protected index: number,
        protected body: NodeBody,
        protected values: Value[],
        protected exits: number[],
        protected input: number = 0,
    ) { }
    *Values() {
        yield* this.values
    }
    InputValue(): InputValue {
        return this.values[this.input] as InputValue
    }
    Name(): string {
        return `$n${this.index}`
    }
    abstract DeclareNode(compiler: Compiler): IterableIterator<string>
    abstract ImplementNode(compiler: Compiler, nodes: Nodes): IterableIterator<string>
}
export class ForwardNode extends Node {
    *ImplementNode(compiler: Compiler, nodes: Nodes): IterableIterator<string> {
        let name = this.Name()
        yield compiler.WrapLine(`case ${this.index}: {`)
        for (let caseCompiler of compiler.Indented()) {
            // references
            // body
            // next
            let next = yield* this.body.scriptify(caseCompiler, name, this.exits)
            assert(next !== this.index)
            assert(Number.isInteger(next))
            yield caseCompiler.WrapStatement(`$fc = ${next}`)
            yield caseCompiler.WrapStatement(nodes.GetInputArrowReference(this.index, next))
            yield caseCompiler.WrapStatement(`continue steps`)
        }
        yield compiler.WrapLine(`}`)
    }
    * DeclareNode(compiler: Compiler) {
        assert(this.index > -1)
        let name = this.Name()
        yield compiler.WrapStatement(`var ${name}`)
        for (let value of this.Values()) {
            yield compiler.WrapStatement(`var ${name}_${value.FormatIndex()}`)
        }
    }
}
export class ReverseNode extends Node {
    ImplementNode(): IterableIterator<string> {
        throw new Error('Method not implemented.')
    }
    DeclareNode(): IterableIterator<string> {
        throw new Error('Method not implemented.')
    }
}

let jsdoc = new Document(
    new JSHeader('"use-strict"'),
    new Nodes([
        new ForwardNode(
            0,
            new LiteralBody(1),
            [
                new InputValue(0),
            ],
            [1],
        ),
        new ForwardNode(
            1,
            new ExpressionBody(
                `$0 + 1`,
            ),
            [
                new InputValue(0),
            ],
            [-1]
        )
    ])
)

let comp = new Compiler(new CompilerOptions())
console.log(Array.from(jsdoc.scriptify(comp)).join(''))
