import { Document } from '../Document';
import { JSHeader } from '../JSHeader';
import { Graff } from "../Graff";
import { ForwardNode } from "../nodes/ForwardNode";
import { ControlInput } from "../nodes/inputs/ControlInput";
import { ExpressionBody } from "../nodes/bodies/ExpressionBody";

export const timestwo_src = new Document(
    new JSHeader('"use-strict"'),
    new Graff([
        new ForwardNode(
            new ExpressionBody('$0 * 2'),
            [
                new ControlInput()
            ]
        ),
    ])
);
