import { Compiler } from '../../Compiler';
import { IRNodeBody } from './IRNodeBody';

export class IRPostfixOperatorBody extends IRNodeBody {
    constructor(
        public postfix: string
    ) { super(); }
    *Write(compiler: Compiler, index: number) {
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${compiler.Var(index, 0)}${this.postfix})`);
    }
}
