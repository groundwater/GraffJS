import { Document } from '../Document';
import { JSHeader } from '../JSHeader';
import { Graff } from "../Graff";
import { ForwardNode } from "../nodes/ForwardNode";
import { ControlInput } from "../nodes/inputs/ControlInput";
import { ExpressionBody } from "../nodes/bodies/ExpressionBody";
import { ReverseNonControlInput } from '../nodes/inputs/ReverseNonControlInput';
import { ReverseNode } from '../nodes/ReverseNode';
import { LiteralBody } from '../nodes/bodies/LiteralBody';

export const reverse_src = new Document(
    new JSHeader('"use-strict"'),
    new Graff([
        new ForwardNode(
            new ExpressionBody('$0 * $1'),
            [
                new ControlInput(),
                new ReverseNonControlInput(1)
            ]
        ),
        new ReverseNode(
            new LiteralBody(-1)
        )
    ])
);
