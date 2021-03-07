import { Compiler } from '../../Compiler';
import { IRNodeBody } from './IRNodeBody';

export class IRInfixOperatorBody extends IRNodeBody {
    constructor(
        public infix: string
    ) { super(); }
    *Write(compiler: Compiler, index: number) {
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${compiler.Var(index, 0)} ${this.infix}${compiler.Var(index, 1)})`);
    }
}
