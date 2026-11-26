import { describe, expect, it } from 'vitest'
import { checkClosure, defaultQuestionState, parseSetAnswer } from './closureExercise'
import { lectureNfa } from './examples'
import { EPSILON, type Automaton } from './model'

const set = (...ids: string[]) => new Set(ids)

// 1 -ε-> 2 -ε-> 3, and 1 -a-> 4
const chain: Automaton = {
  states: [{ id: '1', start: true }, { id: '2' }, { id: '3' }, { id: '4', accept: true }],
  transitions: [
    { from: '1', symbol: EPSILON, to: '2' },
    { from: '2', symbol: EPSILON, to: '3' },
    { from: '1', symbol: 'a', to: '4' },
  ],
}

describe('parseSetAnswer', () => {
  it('reads sets with or without spaces, in any order', () => {
    expect(parseSetAnswer('{4,6}')).toEqual({ states: set('4', '6') })
    expect(parseSetAnswer(' { 6 , 4 } ')).toEqual({ states: set('4', '6') })
  })

  it('reads the empty set', () => {
    expect(parseSetAnswer('{}')).toEqual({ states: set() })
  })

  it('rejects answers without braces', () => {
    expect(parseSetAnswer('4,6')).toHaveProperty('error')
  })
})

describe('checkClosure', () => {
  it('accepts the correct answer in any order', () => {
    expect(checkClosure(lectureNfa, '4', set('6', '4')).correct).toBe(true)
  })

  it('diagnoses forgetting the state itself: {6} instead of {4,6}', () => {
    const fb = checkClosure(lectureNfa, '4', set('6'))
    expect(fb.correct).toBe(false)
    expect(fb.misconception).toBe('forgot-itself')
    expect(fb.hints).toHaveLength(3)
    expect(fb.hints[2]).toBe('ε-closure(4) = {4,6}')
  })

  it('diagnoses following a symbol: {3,4,6} (4 -b-> 3 is not an ε-move)', () => {
    const fb = checkClosure(lectureNfa, '4', set('3', '4', '6'))
    expect(fb.misconception).toBe('followed-symbol')
    expect(fb.hints[1]).toContain('4 -b-> 3')
  })

  it('diagnoses stopping after one ε-move: {1,2} instead of {1,2,3}', () => {
    const fb = checkClosure(chain, '1', set('1', '2'))
    expect(fb.misconception).toBe('stopped-after-one-step')
    expect(fb.hints[1]).toContain('from 2 you can take another ε-move to 3')
  })

  it('diagnoses other missing states', () => {
    const fb = checkClosure(chain, '1', set('1', '3'))
    expect(fb.misconception).toBe('missing-states')
  })

  it('diagnoses other extra states', () => {
    const lonely: Automaton = { ...chain, states: [...chain.states, { id: '9' }] }
    const fb = checkClosure(lonely, '1', set('1', '2', '3', '9'))
    expect(fb.misconception).toBe('extra-states')
  })
})

describe('defaultQuestionState', () => {
  it('picks the first state with an ε-move', () => {
    expect(defaultQuestionState(lectureNfa)).toBe('1')
  })
})
