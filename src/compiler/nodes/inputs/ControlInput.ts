import { Compiler } from '../../Compiler';
import { Input } from './Input';

export class ControlInput extends Input {
    *WriteDeclare(compiler: Compiler, local: number, slot: number) {
        yield compiler.WrapStatement(`var ${compiler.Var(local, slot)}`);
    }
    *Write(compiler: Compiler, local: number, slot: number) {
        yield compiler.WrapStatement(`${compiler.Var(local, slot)} = ${compiler.VarIn(local)}`);
    }
}
