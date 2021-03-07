import { Compiler } from '../../Compiler';
import { IRNodeBody } from './IRNodeBody';

export class IRLiteralBody extends IRNodeBody {
    constructor(
        public value: any
    ) { super(); }
    *Write(compiler: Compiler, index: number) {
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${this.value})`);
    }
}
