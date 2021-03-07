import { Compiler } from '../../Compiler';
import { IRNodeBody } from './IRNodeBody';

export class IRPrefixyOperatorBody extends IRNodeBody {
    constructor(
        public prefix: string
    ) { super(); }
    *Write(compiler: Compiler, index: number) {
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${this.prefix}${compiler.Var(index, 0)})`);
    }
}
