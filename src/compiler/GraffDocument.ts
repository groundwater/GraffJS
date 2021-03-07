import { Compiler } from './Compiler';
import { GraffNodes } from "./GraffNodes";
import { JSHeader } from "./JSHeader";


export class GraffDocument {
    constructor(
        public header: JSHeader,
        public nodes: GraffNodes
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
