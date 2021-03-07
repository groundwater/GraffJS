import { Compiler } from '../../Compiler';
import { IRInput } from './IRInput';

export abstract class IRNonControlInput extends IRInput {
    *WriteDeclare(compiler: Compiler, local: number, slot: number): Generator<string> {
        yield compiler.WrapStatement(`var ${compiler.Var(local, slot)}`);
    }
}
