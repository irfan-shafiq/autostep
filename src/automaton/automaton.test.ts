import { describe, expect, it } from 'vitest'
import { epsilonClosure, formatSet } from './epsilonClosure'
import { lectureNfa } from './examples'
import { EPSILON, acceptStates, alphabet, kindOf, startState, type Automaton } from './model'

describe('model helpers', () => {
  it('finds the start and accepting states', () => {
    expect(startState(lectureNfa)).toBe('1')
    expect(acceptStates(lectureNfa)).toEqual(new Set(['5', '6']))
  })

  it('works out the alphabet without ε', () => {
    expect(alphabet(lectureNfa)).toEqual(['a', 'b'])
  })

  it('tells DFA, NFA and ε-NFA apart', () => {
    const dfa: Automaton = {
      states: [{ id: 'p', start: true }, { id: 'q', accept: true }],
      transitions: [{ from: 'p', symbol: 'a', to: 'q' }],
    }
    const nfa: Automaton = {
      ...dfa,
      transitions: [...dfa.transitions, { from: 'p', symbol: 'a', to: 'p' }],
    }
    expect(kindOf(dfa)).toBe('dfa')
    expect(kindOf(nfa)).toBe('nfa')
    expect(kindOf(lectureNfa)).toBe('enfa')
  })
})

describe('epsilonClosure', () => {
  // These match the worked subset construction example from the refresher.
  it('start state: ε-closure({1}) = {1,3}', () => {
    expect(formatSet(epsilonClosure(lectureNfa, ['1']))).toBe('{1,3}')
  })

  it('after a move: ε-closure({4}) = {4,6}  (the "forgot ε-closure" mistake gives {4})', () => {
    expect(formatSet(epsilonClosure(lectureNfa, ['4']))).toBe('{4,6}')
  })

  it('a state with no ε-moves is its own closure', () => {
    expect(formatSet(epsilonClosure(lectureNfa, ['5']))).toBe('{5}')
  })

  it('follows chains of ε-moves: 1 → 2 → 3', () => {
    const chain: Automaton = {
      states: [{ id: '1', start: true }, { id: '2' }, { id: '3', accept: true }],
      transitions: [
        { from: '1', symbol: EPSILON, to: '2' },
        { from: '2', symbol: EPSILON, to: '3' },
      ],
    }
    expect(formatSet(epsilonClosure(chain, ['1']))).toBe('{1,2,3}')
  })

  it('does not loop forever on ε-cycles', () => {
    const cycle: Automaton = {
      states: [{ id: '1', start: true }, { id: '2' }],
      transitions: [
        { from: '1', symbol: EPSILON, to: '2' },
        { from: '2', symbol: EPSILON, to: '1' },
      ],
    }
    expect(formatSet(epsilonClosure(cycle, ['1']))).toBe('{1,2}')
  })

  it('sorts numbers naturally: 10 comes after 9', () => {
    expect(formatSet(['10', '9', '2'])).toBe('{2,9,10}')
  })
})
