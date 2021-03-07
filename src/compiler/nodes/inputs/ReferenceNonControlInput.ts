import { Compiler } from '../../Compiler';
import { CHECK } from '../../util';
import { NonControlInput } from './NonControlInput';

export class ReferenceNonControlInput extends NonControlInput {
    constructor(
        protected node_index: number,
        protected slot_index: number = -1
    ) { super(); }
    *Write(compiler: Compiler, local: number, slot: number) {
        CHECK(local !== this.node_index, 'No Self References');
        if (this.slot_index > -1) {
            yield compiler.WrapStatement(`${compiler.Var(local, slot)} = ${compiler.Var(this.node_index, this.slot_index)}`);
        } else {
            yield compiler.WrapStatement(`${compiler.Var(local, slot)} = ${compiler.Var(this.node_index)}`);
        }
    }
}
