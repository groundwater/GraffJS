/**
                 ┌──┐
             (3) │10│◄───┐
                 └──┘    │
                         │
                ┌──┐   ┌─┴─┐(1)
             (2)│5 │◄──┤ * │◄─┐
                └──┘   └───┘  │
                              │
            ┌─────────────────┘
     (0)    │      (4)     (5)
     ┌──────┴──┐   ┌──┐  ┌───────────┐
────►│  1 + $0 ├──►│++├─►│console.log│
     └─────────┘   └──┘  └───────────┘
 */

var $start

// All node values and arguments are forward-declared
// Nodes are labeled according to the left-hand rule.
var $n0_0
var $n0_1
var $n0
// Reverse nodes are function calls, and have no persistent state.
// They cannot be referenced.
function $n1() {
    return ($n2() * $n3())
}
function $n2() {
    return (5)
}
function $n3() {
    return (10)
}
var $n4_0
var $n4
var $n5_0
var $n5

// forward control
var $fc = 0

// Setup node 0 for start
$n0_1 = $start

step: while (true) {
    switch ($fc) {
        case 0: {
            $n0_0 = $n1()
            $n0 = (1 + $n0_0)
            $fc = 4
            $n4_0 = $n0
            continue step
        }
        case 4: {
            $n4 = ($n4_0 + 1)
            $fc = 5
            $n5_0 = $n4
            continue step
        }
        case 5: {
            $n5 = (console.log($n5_0))
            $fc = -1
            continue step
        }
        default: {
            break step
        }
    }
}
