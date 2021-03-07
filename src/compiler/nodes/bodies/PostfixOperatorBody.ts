import { Compiler } from '../../Compiler';
import { NodeBody } from './NodeBody';

export class PostfixOperatorBody extends NodeBody {
    constructor(
        public postfix: string
    ) { super(); }
    *Write(compiler: Compiler, index: number) {
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${compiler.Var(index, 0)}${this.postfix})`);
    }
}
