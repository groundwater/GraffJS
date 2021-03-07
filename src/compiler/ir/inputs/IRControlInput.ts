import { Compiler } from '../../Compiler';
import { IRInput } from './IRInput';

export class IRControlInput extends IRInput {
    *WriteDeclare(compiler: Compiler, local: number, slot: number) {
        yield compiler.WrapStatement(`var ${compiler.Var(local, slot)}`);
    }
    *Write(compiler: Compiler, local: number, slot: number) {
        yield compiler.WrapStatement(`${compiler.Var(local, slot)} = ${compiler.VarIn(local)}`);
    }
}
