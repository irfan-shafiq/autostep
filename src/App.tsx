import { useMemo, useState } from 'react'
import { epsilonClosure, formatSet } from './automaton/epsilonClosure'
import { lectureNfaSource } from './automaton/examples'
import { startState } from './automaton/model'
import { parse } from './automaton/parser'
import { CodeEditor } from './components/CodeEditor'
import { Diagram } from './components/Diagram'

export default function App() {
  const [source, setSource] = useState(lectureNfaSource)
  // Re-parse only when the text changes
  const result = useMemo(() => parse(source), [source])
  const automaton = result.automaton

  const start = startState(automaton)
  const startClosure = start ? formatSet(epsilonClosure(automaton, [start])) : null

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
          {result.errors.length === 0 ? (
            <p className="ok">No errors</p>
          ) : (
            <ul className="errors">
              {result.errors.map((e) => (
                <li key={e.line}>Line {e.line}: {e.message}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2>Diagram</h2>
          <Diagram automaton={automaton} />
          <p className="muted">
            ε-closure of the start state: <code>{startClosure ?? 'no start state'}</code>
          </p>
        </section>
      </main>
    </div>
  )
}
