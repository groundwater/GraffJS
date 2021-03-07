import { GraffDocument } from '../GraffDocument';
import { JSHeader } from '../JSHeader';
import { GraffNodes } from "../GraffNodes";
import { ForwardNode } from "../nodes/ForwardNode";
import { ControlInput } from "../nodes/inputs/ControlInput";
import { ExpressionBody } from "../nodes/bodies/ExpressionBody";

export const timestwo_src = new GraffDocument(
    new JSHeader('"use-strict"'),
    new GraffNodes([
        new ForwardNode(
            new ExpressionBody('$0 * 2'),
            [
                new ControlInput()
            ]
        ),
    ])
);
