import { Compiler } from '../../Compiler';
import { IRNonControlInput } from './IRNonControlInput';

export class IRReverseNonControlInput extends IRNonControlInput {
    constructor(
        protected node_index: number
    ) { super(); }
    *Write(compiler: Compiler, local: number, slot: number) {
        yield compiler.WrapStatement(`${compiler.Var(local, slot)} = ${compiler.Fun(this.node_index)}()`);
    }
}
