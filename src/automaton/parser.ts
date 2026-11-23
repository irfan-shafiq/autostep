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

      // Look at every word after the id
      for (let i = 2; i < words.length; i++) {
        const word = words[i]

        if (word === 'at') {
          // the NEXT word is "x,y", e.g. "2.5,-1"
          const [xText, yText] = words[i + 1].split(',')
          state.x = Number(xText)
          state.y = Number(yText) 
          i++                    // skip the "x,y" word, we've used it
        } else if (word === 'start') {
          state.start = true
        } else if (word === 'accept') {
          state.accept = true
        }
      }

      // Save it
      states.push(state)  
      return
    }

    errors.push({ line: lineNumber, message: `Unknown line: "${line}"` })
  })

  return { automaton: { states, transitions: [] }, errors }
}