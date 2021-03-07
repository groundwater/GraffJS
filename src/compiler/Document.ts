import { Compiler } from './Compiler';
import { Graff } from "./Graff";
import { JSHeader } from "./JSHeader";


export class Document {
    constructor(
        public header: JSHeader,
        public nodes: Graff
    ) { }
    *Write(compiler: Compiler): IterableIterator<string> {
        yield this.header.script + '\n';
        yield* this.nodes.Write(compiler);
    }
    ToJavaScript(compiler: Compiler) {
        return Array.from(this.Write(compiler)).join('')
    }
}
