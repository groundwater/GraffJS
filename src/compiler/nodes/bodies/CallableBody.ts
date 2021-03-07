import { Compiler } from '../../Compiler';
import { NodeBody } from './NodeBody';

export class CallableBody extends NodeBody {
    constructor(
        public body: string,
        public argsN: number = 0
    ) { super(); }
    *Write(compiler: Compiler, index: number) {
        let args = [];
        for (let i = 0; i < this.argsN; i++) {
            args.push(`${compiler.Var(index, i)}`);
        }
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${this.body}(${args.join(', ')}))`);
    }
}
