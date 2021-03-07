import { Compiler } from '../Compiler';
import { IRNodes } from "./IRNodes";
import { IRHeader } from "./IRHeader";

export class IRDocument {
    constructor(
        public header: IRHeader,
        public nodes: IRNodes
    ) { }
    *Write(compiler: Compiler): IterableIterator<string> {
        yield this.header.script + '\n';
        yield* this.nodes.Write(compiler);
    }
    ToJavaScript(compiler: Compiler) {
        return Array.from(this.Write(compiler)).join('')
    }
    ToJavaScriptHeaderAndBody(compiler: Compiler) {
        let body = Array.from(this.nodes.Write(compiler)).join('')
        let header = this.header.script

        return { header, body }
    }
}
