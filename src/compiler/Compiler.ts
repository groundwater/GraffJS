
export class CompilerOptions {
    constructor(
        public indent_spaces = 2,
        public semicolons: boolean = true,
        public newlines: boolean = true
    ) { }
}
export class Compiler {
    constructor(
        protected options: CompilerOptions,
        protected depth = 0
    ) { }
    protected End() {
        return this.options.semicolons ? ';' : '';
    }
    protected EndLine() {
        return this.options.newlines ? '\n' : '';
    }
    Indent() {
        if (this.depth > 0) {
            let spaces = ' '.repeat(this.options.indent_spaces);
            let indent = spaces.repeat(this.depth);
            return indent;
        } else {
            return '';
        }
    }
    WrapStatement(line: string): string {
        return this.Indent() + line + this.End() + this.EndLine();
    }
    WrapLine(text: string) {
        return this.Indent() + text + this.EndLine();
    }
    *Indented() {
        yield new Compiler(this.options, this.depth + 1);
    }
    IndentWrapStatement(statemetn: string): string {
        for (let compiler of this.Indented()) {
            return compiler.WrapStatement(statemetn);
        }
        throw new Error('Unexpected');
    }
    Var(index: number, slot: number = -1) {
        if (slot > -1) {
            return `$n${index}_${slot}`;
        } else {
            return `$n${index}`;
        }
    }
    VarIn(index: number) {
        return `${this.Var(index)}_in`;
    }
    Fun(index: number, _slot_ignored?: number) {
        return `f$${index}`;
    }
}
