import { Compiler } from '../../Compiler';

export abstract class IRNodeBody {
    abstract Write(compiler: Compiler, index: number): Generator<string>;
}

