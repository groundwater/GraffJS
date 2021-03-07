import { Compiler } from '../Compiler';

export class IROutput {
    constructor(
        protected dest_node: number
    ) { }
    *WriteSetForwardControl(compiler: Compiler) {
        yield compiler.WrapStatement(`$fc = ${this.dest_node}`);
    }
    *WriteCopyValue(compiler: Compiler, source_var: string) {
        yield compiler.WrapStatement(`${compiler.VarIn(this.dest_node)} = ${source_var}`);
    }
}
