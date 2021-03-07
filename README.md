# Intro

Graff is a plain-text ASCII art programming language interoperable with JavaScript.

![Example Graff Program](examples/example.gif)

All programs proceed **West to East**.

To follow any graff, trace the arrow of any node exiting the _East_ side to the next step in the program.

# Overview

**This is an experiment** in designing a 2D programming language that is still plain-text.

So far, there is only an incomplete specification.

1. If you want to bikeshed the speicification, open an issue!
1. If you want to ask a question, also feel free to in an issue.
1. If you want to tackle writing a parser, please do! 
    I will likely give you write access.

I use [asciiflow.com](https://asciiflow.com/) for all my diagrams.

# Credits

Anyone who helps contribute will be listed here.

# Examples

## Fizz Buzz

```js
          ┌───────────────────────┐
          │                       │
          │         ┌─────────────┼───────────────────────────────────────────────┐
          │         │             │                                               │
          │         │    ┌──────┐ │                                               │
          │         └───►│ $1+1 ├─┘                              ┌─────────────┐  │
          │              └──┬───┘         ┌───────────────┬─────►│ console.log ├──┘
          │                 │             │               │      └─────────────┘
          │     ┌───────────┘             │               │
          │     ▼                         │               │
          └──►┌───┐   ┌──────────────┐    │               │
    ┌───┐     │$0 ├──►│              ├────┘               │
───►│ 1 ├────►└───┘   │     $0       │                    │
    └───┘             ├──────────────┤                    │
                      │              │       ┌───┐        │
                      │  $0>100      ├──────►│   │        │
                      │              │       └───┘        │
                      ├──────────────┤                    │
                      │              │       ┌──────────┐ │
                      │   $0%15==0   ├──────►│"FizzBuzz"├─┤
                      │              │       └──────────┘ │
                      ├──────────────┤                    │
                      │              │       ┌──────┐     │
                      │   $0%5==0    ├──────►│"Fizz"├─────┤
                      │              │       └──────┘     │
                      ├──────────────┤                    │
                      │              │       ┌──────┐     │
                      │   $0%3==0    ├──────►│"Buzz"├─────┘
                      │              │       └──────┘
                      └──────────────┘
```

## Fibonacci Number

```js
                            ┌────────────────────────────────────────────────────────────────────┐
                            │                                                                    │
                            │                                    ┌─────┐                         │
                            │                                    │     │                         │
                            │      ┌──────┐      ┌──────────────►│  1  ├────────────────────────►│
                            ├─────►│      ├──────┘               └─────┘                         │
                            │      │  =1  │         ┌──────┐              ┌─────┐                │
                            │      │      ├─────────┤      ├─────────────►│     ├───────────────►│    ┌───────────────┐
                            │      └──────┘         │ =0   │              │ 0   │                │    │               │
                            │                       │      ├───────┐      └─────┘                ├───►│  console.log  │
                            │                       └──────┘       │                             │    │               │
                            │                                      │      ┌─────┐                │    │               │
    ┌────────────────┐      │                                      └─────►│ +   ├───────────────►│    └───────────────┘
    │                │      │                                             └┬───┬┘                │
───►│ process.argv[0]├─────►│               ┌────────┐    ┌───────┐        │   │                 │
    │                │      │               │        │    │       │        │   │                 │
    └────────────────┘      │◄──────────────┤  -1    │◄───┤ Self  │◄───────┘   │                 │
                            │               │        │    │       │            │                 │
                            │               └────────┘    └───────┘            │                 │
                            │                                                  │                 │
                            │                                                  │                 │
                            │                                                  │                 │
                            │               ┌────────┐    ┌───────┐            │                 │
                            │               │        │    │       │            │                 │
                            │◄──────────────┤  -2    │◄───┤ Self  │◄───────────┘                 │
                            │               │        │    │       │                              │
                            │               └────────┘    └───────┘                              │
                            │                                                                    │
                            │                                                                    │
                            │                                                                    │
                            │                                                                    │
                            └────────────────────────────────────────────────────────────────────┘
```

# Milestones

- [x] Intermediate Compiler (IR to JS; see [src/compiler](src/compiler))
- [-] Virtual Machines
    - [x] JS Script VM
    - [ ] JS Module VM
        - [x] `import` support (partial)
- [ ] AST (AST to IR)
- [ ] Parser (Source to AST)
- [ ] Static Analysis

# Concepts

Graffs are intended to be easy to reason about.
Starting at any node, it should be easy to trace the program execution forward as well as backwards.

Graff mixes imperative programming nodes with functional programming nodes.
Separating side-effect and (hopefully) non-side-effect nodes helps reason about a graff.
You can tell which type of node based on the arrows.

1. Arrows pointing out from the East are imperative. We call thse _Forward Nodes_.
    
    ```
       ┌──────┐
    ──►│ foo  ├──►
       └──────┘
    ```
    Think _do this, then that_, like imperative control flow.

1. Arrows pointing in from the East are functional. We call these _Reverse Nodes_.
    ```
       ┌──────┐
    ◄──┤ foo  │◄──
       └──────┘
    ```
    Think _that needs this_, like function arguments.

Everything else is syntactic sugar to minimize syntax for common operations and use cases.

# By Example

_Translations are approximate. The exact compiler specification does not exist_.

## Hello

```
      ┌───────────────────────┐
─────►│  console.log("Hello") ├
      └───────────────────────┘
```

Is equivalent to `console.log("Hello")`, which has the same result as the following:

```
      ┌──────────┐        ┌──────────────┐
─────►│  "Hello" ├───────►│ console.log  │
      └──────────┘        └──────────────┘
```

which is equivalent to:

```js
var $0 = "Hello"

console.log($0)
```

## Adding

```
   ┌───┐
──►│ 1 ├─┐  ┌───┐
   └───┘ └─►│ + ├────►
            └─┬─┘
   ┌───┐      │
   │ 2 │◄─────┘
   └───┘
```

Is equivalent to:

```js
var $0 = 1
var $1 = 2
var $3 = $0 + $1
```

## Branching

```
      ┌────────┐       ┌───────────────────────────────────────┐
      │        0──────►│console.log($0, "Is Greater than Zero")│
─────►│   >0   │       └───────────────────────────────────────┘
      │        0───┐
      └────────┘   │   ┌───────────────────────────────────────────┐
                   └──►│console.log($0, "Is not greater than zero")│
                       └───────────────────────────────────────────┘
```

For an arbitrary input `$0`, is approximately equivalent to:

```js
var $0 = /* something */

if ($0 > 0) {
    console.log($0, "Is Greater than Zero")
} else {
    console.log($0, "Is not greater than zero")
}
```

Although in practice, it may be implemented differently. See [Implementation](#Implementation) for details.

## Multiple Arrows

```
   ┌────┐  ┌───────┐
   │    │  │       │    ┌───────────┐
──►│ [] ├─►│ .push 0───►│console.log│
   │    │  │       │    └───────────┘
   └────┘  └──┬────┘
              │
  ┌───────┐   │
  │foo.get│◄──┘
  └───────┘
```

Is approximately:

```js
var $0 = []

$0.push(foo.get())

console.log($0)
```

Hopefully you're starting to get the idea.
There are precice rules for what arguments go where based on the arrow positions and directions.

# Contributing

1. Get the source:

    ```
    git clone https://github.com/groundwater/GraffJS
    cd GraffJS
    npm install
    ```
2. Run the test:

    ```
    npm test
    ```
3. Run a single file:

    ```
    npm start $PATH_TO_FILE
    ```

# Specification

Please see [SPEC.md](SPEC.md).
