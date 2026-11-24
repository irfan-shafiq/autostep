import { describe, expect, it } from 'vitest'
import { parse } from './parser'
import { lectureNfa, lectureNfaSource } from './examples'

describe('parse: state lines', () => {
  it('reads a state with a position and start', () => {
    const result = parse('state 1 at 0,0 start')
    expect(result.errors).toEqual([])
    expect(result.automaton.states).toEqual([
      { id: '1', x: 0, y: 0, start: true },
    ])
  })

  it('state with no position and no role', () => {
    const result = parse('state 2')
    expect(result.errors).toEqual([])
    expect(result.automaton.states).toEqual([
      { id: '2' },
    ])
  })

  it('reads a state with decimal and negative position and accept', () => {
    const result = parse('state 5 at 2.5, -1 accept')
    expect(result.errors).toEqual([])
    expect(result.automaton.states).toEqual([
      { id: '5', x: 2.5, y: -1, accept: true }
    ])
  })

  it('reads several lines, blank lines and comments', () => {
    const result = parse('state 1\n\n# comment\n state 2')
    expect(result.errors).toEqual([])
    expect(result.automaton.states).toEqual([
      { id: '1'}, { id: '2'},
    ])
  })

  it('reads an error for an unknown line', () => {
    const result = parse('staet 1')
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].line).toBe(1)
    expect(result.automaton.states).toEqual([])
  })
})

describe('parse: state line errors', () => {
  it('reports a missing position after "at" instead of crashing', () => {
    const result = parse('state 1 at')
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].line).toBe(1)
    expect(result.automaton.states).toEqual([])
  })

  it('reports bad position number', () => {
    const result = parse('state 1 at 2,abc')
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].line).toBe(1)
    expect(result.automaton.states).toEqual([])
  })

  it('reports typo in a role', () => {
    const result = parse('state 1 acept')
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].line).toBe(1)
    expect(result.automaton.states).toEqual([])
  })

  it('reports two start states', () => {
    const result = parse('state 1 start\nstate 2 start')
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].line).toBe(2)
    expect(result.automaton.states).toEqual([
      { id: '1', start: true },
    ])
  })
})

describe('parse: transition lines', () => {
  it('reads a simple transition', () => {
    const result = parse('state 1\nstate 2\n1 -a-> 2')
    expect(result.errors).toEqual([])
    expect(result.automaton.transitions).toEqual([
      { from: '1', symbol: 'a', to: '2' },
    ])
  })

  it('reads epsilon in two different spellings', () => {
    const result = parse('state 1\nstate 3\n1 -ε-> 3\n1 -eps-> 3')
    expect(result.errors).toEqual([])
    expect(result.automaton.transitions).toEqual([
      { from: '1', symbol: 'ε', to: '3'}, { from: '1', symbol: 'ε', to: '3'},
    ])
  })

  it('reads a curve arrow', () => {
    const result = parse('state 3\nstate 4\n3 -b-> 4 curve left')
    expect(result.errors).toEqual([])
    expect(result.automaton.transitions).toEqual([
      { from: '3', symbol: 'b', to:'4', shape: { kind: 'curve', side: 'left' } },
    ])
  })

  it('reads a loop arrow', () => {
    const result = parse('state 6\n6 -a-> 6 loop right')
    expect(result.errors).toEqual([])
    expect(result.automaton.transitions).toEqual([
      { from: '6', symbol: 'a', to: '6', shape: { kind: 'loop', side: 'right' } },
    ])
  })

  it('reads transition with undeclared state', () => {
    const result = parse('state {1,3} start\n{1,3} -b-> {4}')
    expect(result.errors).toEqual([])
    expect(result.automaton.states).toEqual([
      { id: '{1,3}', start: true }, { id: '{4}' },
    ])
  })

  it('reports symbol too long', () => {
    const result = parse('1 -ab-> 2')
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].line).toBe(1)
    expect(result.automaton.transitions).toEqual([])
  })

  it('reports unknown arrow shape', () => {
    const result = parse('1 -a-> 2 wiggle')
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].line).toBe(1)
    expect(result.automaton.transitions).toEqual([])
  })
})

describe('parse: whole example', () => {
  it('parses the lecture ε-NFA source into the same automaton as the data version', () => {
    const result = parse(lectureNfaSource)
    expect(result.errors).toEqual([])
    expect(result.automaton).toEqual(lectureNfa)
  })
})