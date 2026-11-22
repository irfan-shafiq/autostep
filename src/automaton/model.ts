// The core data model for every automaton in AutoStep.
// Everything else (parser, solvers, step checker, diagram) reads or produces these types.

/** The symbol used for ε-moves (moves that read no input). */
export const EPSILON = 'ε'

/** One state, e.g. `state 5 at 2.5,-1 accept` in the code editor. */
export interface State {
  id: string
  /** Position on the diagram grid. Optional: missing positions are laid out automatically. */
  x?: number
  y?: number
  start?: boolean
  accept?: boolean
}

/** How an arrow is drawn. Straight unless the code says otherwise. */
export type ArrowShape =
  | { kind: 'straight' }
  | { kind: 'curve'; side: 'left' | 'right' }
  | { kind: 'loop'; side: 'up' | 'down' | 'left' | 'right' }

/** One transition, e.g. `3 -b-> 4 curve left`. */
export interface Transition {
  from: string
  /** A single input symbol, or EPSILON. */
  symbol: string
  to: string
  shape?: ArrowShape
}

/** A DFA, NFA or ε-NFA. Which one it is depends on its transitions (see `kindOf`). */
export interface Automaton {
  states: State[]
  transitions: Transition[]
}

/** The start state's id, or undefined if none is marked. */
export function startState(a: Automaton): string | undefined {
  return a.states.find((s) => s.start)?.id
}

/** The ids of all accepting states. */
export function acceptStates(a: Automaton): Set<string> {
  return new Set(a.states.filter((s) => s.accept).map((s) => s.id))
}

/** The input alphabet, worked out from the transitions (ε excluded), sorted. */
export function alphabet(a: Automaton): string[] {
  const symbols = new Set(a.transitions.map((t) => t.symbol).filter((s) => s !== EPSILON))
  return [...symbols].sort()
}

/**
 * 'dfa'  – no ε-moves and at most one transition per (state, symbol)
 * 'nfa'  – no ε-moves, but some (state, symbol) has several targets
 * 'enfa' – has at least one ε-move
 */
export function kindOf(a: Automaton): 'dfa' | 'nfa' | 'enfa' {
  if (a.transitions.some((t) => t.symbol === EPSILON)) return 'enfa'
  const seen = new Set<string>()
  for (const t of a.transitions) {
    const key = `${t.from}\u0000${t.symbol}`
    if (seen.has(key)) return 'nfa'
    seen.add(key)
  }
  return 'dfa'
}
