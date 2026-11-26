import { epsilonClosure, formatSet } from './epsilonClosure'
import { EPSILON, type Automaton } from './model'

/**
 * The ε-closure exercise: "What is ε-closure({from})?"
 * This is a small first version of the feedback engine:
 *   check the answer → diagnose the misconception → give 3 levels of hints.
 */

export type Misconception =
  | 'forgot-itself' // left out the state you start from
  | 'followed-symbol' // included a state reached by reading a symbol, not an ε-move
  | 'stopped-after-one-step' // followed one ε-move but not the chain after it
  | 'missing-states' // other missing states
  | 'extra-states' // other states that shouldn't be there

export interface ClosureFeedback {
  correct: boolean
  misconception?: Misconception
  /** Hint 1 (nudge), hint 2 (what went wrong), hint 3 (the answer). Empty when correct. */
  hints: string[]
}

/** Reads a student's answer like "{4, 6}" into a set of state ids. */
export function parseSetAnswer(text: string): { states: Set<string> } | { error: string } {
  const trimmed = text.trim()
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return { error: 'Write the answer as a set, e.g. {1,3}' }
  }
  const inside = trimmed.slice(1, -1)
  const ids = inside
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '')
  return { states: new Set(ids) }
}

export function checkClosure(a: Automaton, from: string, answer: Set<string>): ClosureFeedback {
  const closure = epsilonClosure(a, [from])
  const missing = [...closure].filter((s) => !answer.has(s))
  const extra = [...answer].filter((s) => !closure.has(s))

  if (missing.length === 0 && extra.length === 0) return { correct: true, hints: [] }

  const answerHint = `ε-closure(${from}) = ${formatSet(closure)}`
  const epsilonMoves = a.transitions.filter((t) => t.symbol === EPSILON)

  // Bug 1: forgot the state itself
  if (missing.includes(from)) {
    return {
      correct: false,
      misconception: 'forgot-itself',
      hints: [
        `Every state can reach one state without making any move at all. Which one?`,
        `The ε-closure always contains the state you start from, so ${from} belongs in it.`,
        answerHint,
      ],
    }
  }

  // Bug 2: included a state that is only reached by reading a symbol
  for (const x of extra) {
    const viaSymbol = a.transitions.find(
      (t) => t.to === x && t.symbol !== EPSILON && closure.has(t.from),
    )
    if (viaSymbol) {
      return {
        correct: false,
        misconception: 'followed-symbol',
        hints: [
          `Look at ${x}. Can you reach it from ${from} without reading any input symbol?`,
          `${x} is only reached by reading "${viaSymbol.symbol}" (${viaSymbol.from} -${viaSymbol.symbol}-> ${x}). The ε-closure follows ε-moves only.`,
          answerHint,
        ],
      }
    }
  }

  // Bug 3: followed the ε-moves out of `from`, but not the chain after them
  const oneStep = new Set([from, ...epsilonMoves.filter((t) => t.from === from).map((t) => t.to)])
  const sameAsOneStep = answer.size === oneStep.size && [...oneStep].every((s) => answer.has(s))
  if (sameAsOneStep && missing.length > 0) {
    const link = epsilonMoves.find((t) => answer.has(t.from) && missing.includes(t.to))
    return {
      correct: false,
      misconception: 'stopped-after-one-step',
      hints: [
        `You followed the ε-moves out of ${from}. What about ε-moves out of the states you reached?`,
        link
          ? `ε-moves chain: from ${link.from} you can take another ε-move to ${link.to}. Keep going until no new states appear.`
          : `ε-moves chain: keep following ε-moves from every new state until no new states appear.`,
        answerHint,
      ],
    }
  }

  // Bug 4: other missing states
  if (missing.length > 0) {
    const y = missing[0]
    const link = epsilonMoves.find((t) => t.to === y && closure.has(t.from))
    return {
      correct: false,
      misconception: 'missing-states',
      hints: [
        `Some states you can reach using only ε-moves are missing. Trace every ε-arrow from ${from}.`,
        link
          ? `You missed ${formatSet(missing)}: ${y} is reached by the ε-move ${link.from} -ε-> ${y}.`
          : `You missed ${formatSet(missing)}.`,
        answerHint,
      ],
    }
  }

  // Bug 5: other extra states
  return {
    correct: false,
    misconception: 'extra-states',
    hints: [
      `Check ${extra[0]} again: is there a chain of ε-moves from ${from} to it?`,
      `${formatSet(extra)} can't be reached from ${from} using only ε-moves.`,
      answerHint,
    ],
  }
}

/** A good default question: the first state that has an ε-move out of it. */
export function defaultQuestionState(a: Automaton): string | undefined {
  const withEpsilon = a.transitions.find((t) => t.symbol === EPSILON)?.from
  return withEpsilon ?? a.states[0]?.id
}
