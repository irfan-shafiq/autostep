import { EPSILON, type ArrowShape, type Automaton, type State, type Transition } from './model'

export interface ParseError {
  line: number      // 1 = first line
  message: string
}

export interface ParseResult {
  automaton: Automaton
  errors: ParseError[]
}

export function parse(source: string): ParseResult {
  const states: State[] = []
  const transitions: Transition[] = []
  const errors: ParseError[] = []

  const lines = source.split('\n')

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1
    const line = rawLine.trim()

    // Skip empty lines and comments
    if (line === '' || line.startsWith('#')) return

    if (line.startsWith('state ')) {
      // Remove spaces around commas, so "2.5, -1" becomes "2.5,-1"
      const tidy = line.replace(/\s*,\s*/g, ',')
      // Split into words: ['state', '5', 'at', '2.5,-1', 'accept']
      const words = tidy.split(/\s+/)
      // The id is the word after "state"
      const state: State = { id: words[1] }
      let problem = '' // empty if line is fine
      // Look at every word after the id
      for (let i = 2; i < words.length; i++) {
        const word = words[i]

        if (word === 'at') {
          const position = words[i + 1]
          if (position === undefined) {
            problem = 'Expected a position after "at", e.g. "at 1,2"'
            break
          }
          const [xText, yText] = position.split(',')
          state.x = Number(xText)
          state.y = Number(yText)
          if (Number.isNaN(state.x) || Number.isNaN(state.y)) {
            problem = `"${position}" is not a valid position, e.g. "at 1,2"`
            break
          }
          i++
        } else if (word === 'start') {
          if (states.some(s => s.start)) {
            problem = 'There is already a start state'
            break
          }
          state.start = true
        } else if (word === 'accept') {
          state.accept = true
        } else {
          problem = 'Unknown word "${word}". Did you mean "start" or "accept"?'
          break
        }
      }

      if (problem !== '') {
        errors.push({ line: lineNumber, message: problem })
      } else {
        states.push(state)
      }
      return
    }

    // A transition looks like:  from -symbol-> to  [shape words]
    const match = line.replace(/\s*,\s*/g, ',').match(/^(\S+)\s*-(.+?)->\s*(\S+)\s*(.*)$/)
    if (match) {
      const [, from, rawSymbol, to, rest] = match
      // ε can be typed as "eps"
      const symbol = rawSymbol === 'eps' ? EPSILON : rawSymbol

      if (symbol.length > 1) {
        errors.push({ line: lineNumber, message: `"${rawSymbol}" is not one symbol. Each arrow reads exactly one symbol (or ε / eps).` })
        return
      }

      const transition: Transition = { from, symbol, to }

      if (rest !== '') {
        const [kind, side] = rest.split(/\s+/)
        if (kind === 'curve' && (side === 'left' || side === 'right')) {
          transition.shape = { kind: 'curve', side }
        } else if (kind === 'loop' && (side === 'up' || side === 'down' || side === 'left' || side === 'right')) {
          transition.shape = { kind: 'loop', side } as ArrowShape
        } else {
          errors.push({ line: lineNumber, message: `Unknown arrow shape "${rest}". Use "curve left/right" or "loop up/down/left/right".` })
          return
        }
      }

      transitions.push(transition)
      return
    }

    errors.push({ line: lineNumber, message: `Unknown line: "${line}"` })
  })

  for (const t of transitions) {
    for (const id of [t.from, t.to]) {
      if (!states.some(s => s.id === id)) {                                                 // BLANK 4
        states.push({ id })
      }
    }
  }

  return { automaton: { states, transitions }, errors }
}