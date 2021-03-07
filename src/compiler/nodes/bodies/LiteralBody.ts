import { Compiler } from '../../Compiler';
import { NodeBody } from './NodeBody';

export class LiteralBody extends NodeBody {
    constructor(
        public value: any
    ) { super(); }
    *Write(compiler: Compiler, index: number) {
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${this.value})`);
    }
}
