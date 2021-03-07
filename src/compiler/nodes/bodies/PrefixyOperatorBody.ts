import { Compiler } from '../../Compiler';
import { NodeBody } from './NodeBody';

export class PrefixyOperatorBody extends NodeBody {
    constructor(
        public prefix: string
    ) { super(); }
    *Write(compiler: Compiler, index: number) {
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${this.prefix}${compiler.Var(index, 0)})`);
    }
}
