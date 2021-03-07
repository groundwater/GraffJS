import { Compiler } from "../Compiler";

export abstract class IRNode {
    abstract WriteDeclareNode(compiler: Compiler, index: number): IterableIterator<string>;
    abstract WriteNode(compiler: Compiler, index: number): IterableIterator<string>;
}

