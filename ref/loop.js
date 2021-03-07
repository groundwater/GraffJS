/**
        ┌─────────────────────┐
        │ ┌───────────────────┼──────────────────────┐
        │ │      ┌─────────┐  │                      │
        │ │      │         │  │                      │
        │ └─────►│ $1 + 1  ├──┘            (3)       │
        │        │         │(4)       ┌────────────┐ │
        │        └─┬───────┘      ┌──►┤console.log 0─┘
        │      ┌───┘              │   └────────────┘
  (0)   └┐     ▼      ┌─────────┐ │
   ┌───┐ │   ┌───┐    │         0─┘       (5)
──►│ 0 ├─┴──►│$0 ├───►│ $0 < 10 │       ┌──────┐
   └───┘     └───┘    │         ├──────►│"Done"│
             (1)      └─────────┘       └──────┘
                          (2)
 */


// start value is TBD, but passed to first node 
var $start

// All node values and arguments are forward-declared
// Nodes are labeled according to the left-hand rule.
var $n0_0
var $n0
var $n1_0
var $n1
var $n2_0
var $n2
var $n3_0
var $n3
var $n4_0
var $n4_1
var $n4
var $n5_0
var $n5

// forward control
var $fc = 0

// referse control, if it exists
var $rc = -1

// Setup node 0 for start
$n0_0 = $start

step: while (true) {
    // Each node is a switch case
    switch ($fc) {
        case 0: {
            // setup references
            // evaluate body
            $n0 = (0)
            // pass forward control
            $fc = 1
            // setup passed value for next node
            $n1_0 = $n0
            // relinquish control
            continue step
        }
        case 1: {
            $n1 = ($n1_0) // evalute body
            $fc = 2
            $n2_0 = $n1
            continue step
        }
        case 2: {
            // evalute body
            $n2 = ($n2_0 < 10)
            // branch on body
            // This appraoch extends beyond two branches
            if ($n2 === false) {
                $fc = 5
                $n_5_0 = $n2
            }

            // Norther branch is always default case
            else {
                $fc = 3
                $n3_0 = $n2_0
            }
            continue step
        }
        case 3: {
            $n3 = (console.log($n3_0))
            $fc = 4
            $n4_0 = $n3_0
            continue step
        }
        case 4: {
            // nodes fetch their own references
            $n4_1 = $n1
            // body
            $n4 = (1 + $n4_1)
            $fc = 1
            $n1_0 = $n4
            continue step
        }
        case 5: {
            $n5 = ("Done")
            // Nodes with no exit nullify forward control
            $fc = -1
            continue step
        }
        default: {
            break step
        }
    }
}