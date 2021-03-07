import { IRDocument } from '../ir/IRDocument';
import { IRHeader } from '../ir/IRHeader';
import { IRNodes } from "../ir/IRNodes";
import { IRForwardNode } from "../ir/IRForwardNode";
import { IRControlInput } from "../ir/inputs/IRControlInput";
import { IRExpressionBody } from "../ir/bodies/IRExpressionBody";
import { IRReverseNonControlInput } from '../ir/inputs/IRReverseNonControlInput';
import { IRReverseNode } from '../ir/IRReverseNode';
import { IRLiteralBody } from '../ir/bodies/IRLiteralBody';

export const reverse_src = new IRDocument(
    new IRHeader('"use-strict"'),
    new IRNodes([
        new IRForwardNode(
            new IRExpressionBody('$0 * $1'),
            [
                new IRControlInput(),
                new IRReverseNonControlInput(1)
            ]
        ),
        new IRReverseNode(
            new IRLiteralBody(-1)
        )
    ])
);
