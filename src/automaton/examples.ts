import { EPSILON, type Automaton } from './model'

/**
 * The ε-NFA used throughout the mockups ("ε-NFA from lecture 3").
 * Start state 1, accepting states 5 and 6.
 */
export const lectureNfa: Automaton = {
  states: [
    { id: '1', x: 0, y: 0, start: true },
    { id: '2', x: 1, y: 1 },
    { id: '3', x: 1, y: -1 },
    { id: '4', x: 2.5, y: 1 },
    { id: '5', x: 2.5, y: -1, accept: true },
    { id: '6', x: 3.5, y: 0, accept: true },
  ],
  transitions: [
    { from: '1', symbol: 'a', to: '2' },
    { from: '1', symbol: EPSILON, to: '3' },
    { from: '3', symbol: 'b', to: '4', shape: { kind: 'curve', side: 'left' } },
    { from: '4', symbol: 'b', to: '3', shape: { kind: 'curve', side: 'left' } },
    { from: '3', symbol: 'a', to: '5' },
    { from: '4', symbol: EPSILON, to: '6' },
    { from: '6', symbol: 'a', to: '6', shape: { kind: 'loop', side: 'right' } },
  ],
}

/** The same automaton written in AutoStep's language (the parser in step 2 will read this). */
export const lectureNfaSource = `# states: name, position, role
state 1  at 0,0     start
state 2  at 1,1
state 3  at 1,-1
state 4  at 2.5,1
state 5  at 2.5,-1  accept
state 6  at 3.5,0   accept

# transitions: from -symbol-> to, then shape
1 -a-> 2
1 -ε-> 3
3 -b-> 4   curve left
4 -b-> 3   curve left
3 -a-> 5
4 -ε-> 6
6 -a-> 6   loop right
`
