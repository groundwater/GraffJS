import { IRDocument } from '../ir/IRDocument';
import { IRHeader } from '../ir/IRHeader';
import { IRNodes } from "../ir/IRNodes";
import { IRForwardNode } from "../ir/IRForwardNode";
import { IRControlInput } from "../ir/inputs/IRControlInput";
import { IRExpressionBody } from "../ir/bodies/IRExpressionBody";

export const timestwo_src = new IRDocument(
    new IRHeader('"use-strict"'),
    new IRNodes([
        new IRForwardNode(
            new IRExpressionBody('$0 * 2'),
            [
                new IRControlInput()
            ]
        ),
    ])
);
