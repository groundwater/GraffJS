import assert from 'assert';
import { Compiler } from '../../Compiler';
import { NodeBody } from './NodeBody';

export class ExpressionBody extends NodeBody {
    constructor(
        public body: string
    ) { super(); }
    *Write(compiler: Compiler, index: number) {
        let out = [];
        let line = this.body;
        while (true) {
            let next = line.match(/\$\d+?/);
            if (!next)
                break;
            let { index: match_index, 0: match } = next;
            assert(match_index !== undefined);
            out.push(line.substr(0, match_index));
            let sub = line.substring(match_index + 1, match_index + 1 + match.length);
            let slot = parseInt(sub);
            assert(isFinite(slot));
            out.push(compiler.Var(index, slot));
            line = line.substr(match_index + match.length);
        }
        out.push(line);
        yield compiler.WrapStatement(`${compiler.Var(index)} = (${out.join('')})`);
    }
}
