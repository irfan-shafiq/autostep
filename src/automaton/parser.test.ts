import { describe, expect, it } from 'vitest'
import { parse } from './parser'

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