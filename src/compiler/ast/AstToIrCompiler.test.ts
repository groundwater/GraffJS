import { AstDocument, AstFowardControlEastArrow, AstHeader, AstHomeArrow, AstNode, AstNodeBody } from "./Types";
import { test } from 'tap'
import { DocumentToJSFunction } from "../../virtualmachine/ScriptVM";
import { AstToIrCompiler } from "./AstToIrCompiler";
import { FuzzIntRangeInclusive } from "../../Fuzz";

test('AstToIRCompiler', async ({ test }) => {
    test('Accept', async ({ equal, strictEqual }) => {
        let t = FuzzIntRangeInclusive()
        let j = FuzzIntRangeInclusive()
        let ast = new AstDocument(
            new AstHeader(`"use-strict";`),
            [
                new AstNode.Forward(
                    new AstNodeBody.Literal(String(t)),
                    [],
                    [
                        new AstFowardControlEastArrow(1)
                    ],
                ),
                new AstNode.Forward(
                    new AstNodeBody.Expression(`$1 + $0`),
                    [
                        new AstHomeArrow.InputArrow(0),
                        new AstHomeArrow.ReverseArrow(2, 1)
                    ],
                    [],
                ),
                new AstNode.Reverse(
                    new AstNodeBody.Literal(`${j}`),
                    [],
                )
            ]
        )
        let ast2ir = new AstToIrCompiler()
        let doc = ast2ir.Compile(ast)
        let fun = DocumentToJSFunction(doc)
        strictEqual(fun(), t + j)
    })
})
