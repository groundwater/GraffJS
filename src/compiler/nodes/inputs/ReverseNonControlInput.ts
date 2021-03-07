import { Compiler } from '../../Compiler';
import { NonControlInput } from './NonControlInput';

export class ReverseNonControlInput extends NonControlInput {
    constructor(
        protected node_index: number
    ) { super(); }
    *Write(compiler: Compiler, local: number, slot: number) {
        yield compiler.WrapStatement(`${compiler.Var(local, slot)} = ${compiler.Fun(this.node_index)}()`);
    }
}
