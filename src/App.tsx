import { useState } from 'react'
import { epsilonClosure, formatSet } from './automaton/epsilonClosure'
import { lectureNfa, lectureNfaSource } from './automaton/examples'
import { CodeEditor } from './components/CodeEditor'
import { Diagram } from './components/Diagram'

export default function App() {
  const [source, setSource] = useState(lectureNfaSource)

  // Until the parser exists (step 2), the diagram shows the hard-coded example
  // and the editor text is not used yet.
  const automaton = lectureNfa
  const startClosure = formatSet(epsilonClosure(automaton, ['1']))

  return (
    <div className="app">
      <header className="top-bar">
        <strong>AutoStep</strong>
        <span className="muted">Starter project: model, ε-closure, editor and diagram</span>
      </header>

      <main className="workspace">
        <section className="panel">
          <h2>Code</h2>
          <CodeEditor initialValue={lectureNfaSource} onChange={setSource} />
          <p className="muted">
            {source.split('\n').length} lines. The parser (step 2) will turn this text into the diagram.
          </p>
        </section>

        <section className="panel">
          <h2>Diagram</h2>
          <Diagram automaton={automaton} />
          <p className="muted">
            ε-closure of the start state: <code>{startClosure}</code>
          </p>
        </section>
      </main>
    </div>
  )
}
