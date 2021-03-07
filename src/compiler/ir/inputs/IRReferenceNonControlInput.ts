import { Compiler } from '../../Compiler';
import { WARN } from '../../../util';
import { IRNonControlInput } from './IRNonControlInput';

export class IRReferenceNonControlInput extends IRNonControlInput {
    constructor(
        protected node_index: number,
        protected slot_index: number = -1
    ) { super(); }
    *Write(compiler: Compiler, local: number, slot: number) {
        WARN(local !== this.node_index, 'No Self References');
        if (this.slot_index > -1) {
            yield compiler.WrapStatement(`${compiler.Var(local, slot)} = ${compiler.Var(this.node_index, this.slot_index)}`);
        } else {
            yield compiler.WrapStatement(`${compiler.Var(local, slot)} = ${compiler.Var(this.node_index)}`);
        }
    }
}
