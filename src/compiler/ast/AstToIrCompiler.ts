import { CHECK_NOT_NEGATIVE, NEVER, TODO } from "../../util";
import { IRCallableBody } from "../ir/bodies/IRCallableBody";
import { IRExpressionBody } from "../ir/bodies/IRExpressionBody";
import { IRInfixOperatorBody } from "../ir/bodies/IRInfixOperatorBody";
import { IRLiteralBody } from "../ir/bodies/IRLiteralBody";
import { IRNodeBody } from "../ir/bodies/IRNodeBody";
import { IRPostfixOperatorBody } from "../ir/bodies/IRPostfixOperatorBody";
import { IRPrefixyOperatorBody } from "../ir/bodies/IRPrefixyOperatorBody";
import { IRControlInput } from "../ir/inputs/IRControlInput";
import { IRInput } from "../ir/inputs/IRInput";
import { IRReferenceNonControlInput } from "../ir/inputs/IRReferenceNonControlInput";
import { IRReverseNonControlInput } from "../ir/inputs/IRReverseNonControlInput";
import { IRDocument } from "../ir/IRDocument";
import { IRForwardNode } from "../ir/IRForwardNode";
import { IRHeader } from "../ir/IRHeader";
import { IRNode } from "../ir/IRNode";
import { IRNodes } from "../ir/IRNodes";
import { IROutput } from "../ir/IROutput";
import { IRReverseNode } from "../ir/IRReverseNode";
import { AstDocument, AstFowardControlEastArrow, AstHomeArrow, AstNode, AstNodeBody } from "./Types";


export function SortHomeArrows(lhs: AstHomeArrow, rhs: AstHomeArrow) {
    CHECK_NOT_NEGATIVE(lhs.local_socket);
    CHECK_NOT_NEGATIVE(rhs.local_socket);
    return lhs.local_socket - rhs.local_socket;
}

export class AstToIrCompiler {
    Compile(ast_document: AstDocument): IRDocument {
        let { header, nodes } = ast_document;
        let ir_nodes = nodes.map(this.compile_node);
        return new IRDocument(new IRHeader(header.source), new IRNodes(ir_nodes));
    }
    compile_node = (node: AstNode): IRNode => {
        switch (node.type) {
            case "Forward": {
                let { east_arrows, home_arrows, node_body } = node;
                TODO: {
                    if (east_arrows.length > 1) {
                        TODO(`Branching Not Yet Implemented`);
                    }
                }
                return new IRForwardNode(
                    this.compile_body(node_body),
                    home_arrows.sort(SortHomeArrows).map(this.compile_home_arrow),
                    east_arrows.map(this.compile_east_arrows)[0]
                );
            }
            case "Reverse": {
                let { node_body, home_arrows } = node;
                return new IRReverseNode(
                    this.compile_body(node_body),
                    home_arrows.map(this.compile_home_arrow)
                );
            }
            default:
                NEVER();
        }
    };
    compile_east_arrows = (east_arrow: AstFowardControlEastArrow): IROutput => {
        return new IROutput(east_arrow.target);
    };
    compile_body = (node_body: AstNodeBody): IRNodeBody => {
        let { body } = node_body;
        switch (node_body.type) {
            case "Callable": {
                return new IRCallableBody(body);
            }
            case "Expression": {
                return new IRExpressionBody(body);
            }
            case "InfixOperator": {
                return new IRInfixOperatorBody(body);
            }
            case "Literal": {
                return new IRLiteralBody(body);
            }
            case "PostfixOperator": {
                return new IRPostfixOperatorBody(body);
            }
            case "PrefixOperator": {
                return new IRPrefixyOperatorBody(body);
            }
            default: NEVER();
        }
    };
    compile_home_arrow = (arrow: AstHomeArrow): IRInput => {
        switch (arrow.type) {
            case 'InputArrow': {
                return new IRControlInput();
            }
            case "ReferenceArrow": {
                let { remote_socket, remote_target } = arrow;
                return new IRReferenceNonControlInput(remote_target, remote_socket);
            }
            case "ReverseArrow": {
                let { remote_target } = arrow;
                return new IRReverseNonControlInput(remote_target);
            }
            default: NEVER();
        }
    };
}
