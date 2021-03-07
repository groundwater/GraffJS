import { Compiler } from '../../Compiler';
import { NodeBody } from './NodeBody';

export class InfixOperatorBody extends NodeBody {
    constructor(
        public infix: string
    ) { super(); }
    *Write(compiler: Compiler, index: number) {
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${compiler.Var(index, 0)} ${this.infix}${compiler.Var(index, 1)})`);
    }
}
