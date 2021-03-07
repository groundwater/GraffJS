import { Compiler } from '../Compiler';

export abstract class Node {
    abstract WriteDeclareNode(compiler: Compiler, index: number): IterableIterator<string>;
    abstract WriteNode(compiler: Compiler, index: number): IterableIterator<string>;
}

