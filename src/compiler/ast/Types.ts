/**
 * WARNING
 * 
 * These classes MUST be directly serializable from/to JSON.
 * 
 * As in, no methods, no symbols, nothing which won't survive,
 * a JSON.parse(JSON.stringify(...)) round trip.
 * 
 * Anything with polymorphism MUST make use of a `type` field,
 * since these classes must be compilable even as classless objects.
 */

export namespace AstNode {
    export class Forward {
        type = 'Forward' as const
        constructor(
            public node_body: AstNodeBody,
            public home_arrows: AstHomeArrow[],
            public east_arrows: AstFowardControlEastArrow[],
        ) { }
    }
    export class Reverse {
        type = 'Reverse' as const
        constructor(
            public node_body: AstNodeBody,
            public home_arrows: AstHomeArrow[],
        ) { }
    }
    export type Any =
        | Forward
        | Reverse
}
export type AstNode = AstNode.Any

export namespace AstHomeArrow {
    export class InputArrow {
        type = 'InputArrow' as const
        constructor(
            public local_socket: number,
        ) { }
    }

    export class ReferenceArrow {
        type = 'ReferenceArrow' as const
        constructor(
            public local_socket: number,
            public remote_target: number,
            public remote_socket: number,
        ) { }
    }


    export class ReverseArrow {
        type = 'ReverseArrow' as const
        constructor(
            public remote_target: number,
            public local_socket: number,
        ) { }
    }

    export type Any =
        | InputArrow
        | ReferenceArrow
        | ReverseArrow
}
export type AstHomeArrow = AstHomeArrow.Any

export class AstFowardControlEastArrow {
    constructor(
        public target: number,
    ) { }
}

export namespace AstNodeBody {
    export class Expression {
        type = 'Expression' as const
        constructor(
            public body: string
        ) { }
    }
    export class Literal {
        type = 'Literal' as const
        constructor(
            public body: string
        ) { }
    }
    export class InfixOperator {
        type = 'InfixOperator' as const
        constructor(
            public body: string
        ) { }
    }
    export class PostfixOperator {
        type = 'PostfixOperator' as const
        constructor(
            public body: string
        ) { }
    }
    export class PrefixOperator {
        type = 'PrefixOperator' as const
        constructor(
            public body: string
        ) { }
    }
    export class Callable {
        type = 'Callable' as const
        constructor(
            public body: string
        ) { }
    }
    export type Any =
        | Expression
        | Literal
        | InfixOperator
        | PrefixOperator
        | PostfixOperator
        | Callable
}

export type AstNodeBody = AstNodeBody.Any

export class AstDocument {
    constructor(
        public header: AstHeader,
        public nodes: AstNode[],
    ) { }
}

export class AstHeader {
    constructor(
        public source: string
    ) { }
}
