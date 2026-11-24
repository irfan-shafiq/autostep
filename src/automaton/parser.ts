import type { Automaton, State } from './model'

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

    errors.push({ line: lineNumber, message: `Unknown line: "${line}"` })
  })

  return { automaton: { states, transitions: [] }, errors }
}