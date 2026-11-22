import { EPSILON, type Automaton } from './model'

/**
 * The ε-closure of a set of states: the states themselves plus every state
 * reachable from them using only ε-moves (following chains, e.g. 1 → 2 → 3).
 *
 * This is the first solver. Subset construction will build on it.
 */
export function epsilonClosure(a: Automaton, states: Iterable<string>): Set<string> {
  const closure = new Set(states)
  const toVisit = [...closure]

  while (toVisit.length > 0) {
    const current = toVisit.pop()!
    for (const t of a.transitions) {
      if (t.from === current && t.symbol === EPSILON && !closure.has(t.to)) {
        closure.add(t.to)
        toVisit.push(t.to)
      }
    }
  }

  return closure
}

/** Writes a set the way students do: `{1,3}`, elements sorted. */
export function formatSet(states: Iterable<string>): string {
  const sorted = [...states].sort((x, y) => x.localeCompare(y, undefined, { numeric: true }))
  return `{${sorted.join(',')}}`
}
