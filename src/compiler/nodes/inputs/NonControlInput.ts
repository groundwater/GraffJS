import { Compiler } from '../../Compiler';
import { Input } from './Input';

export abstract class NonControlInput extends Input {
    *WriteDeclare(compiler: Compiler, local: number, slot: number): Generator<string> {
        yield compiler.WrapStatement(`var ${compiler.Var(local, slot)}`);
    }
}
