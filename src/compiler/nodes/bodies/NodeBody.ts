import { Compiler } from '../../Compiler';

export abstract class NodeBody {
    abstract Write(compiler: Compiler, index: number): Generator<string>;
}

