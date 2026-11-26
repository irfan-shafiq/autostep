import { useState } from 'react'
import {
  checkClosure,
  defaultQuestionState,
  parseSetAnswer,
  type ClosureFeedback,
} from '../automaton/closureExercise'
import type { Automaton } from '../automaton/model'

const HINT_TITLES = ['Hint 1 · Nudge', 'Hint 2 · What went wrong', 'Hint 3 · Answer']

const MISCONCEPTION_LABELS: Record<string, string> = {
  'forgot-itself': 'left out the starting state',
  'followed-symbol': 'followed a symbol, not an ε-move',
  'stopped-after-one-step': 'stopped after one ε-move',
  'missing-states': 'missing ε-reachable states',
  'extra-states': 'extra unreachable states',
}

/**
 * A first exercise: "What is ε-closure({state})?" on whatever automaton is in the editor.
 * Shows the feedback loop: check → diagnose → escalating hints.
 */
export function ClosureExercise({ automaton }: { automaton: Automaton }) {
  const [chosen, setChosen] = useState<string | undefined>(undefined)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<ClosureFeedback | null>(null)
  const [formatError, setFormatError] = useState('')
  const [hintLevel, setHintLevel] = useState(1)

  const stateIds = automaton.states.map((s) => s.id)
  const from = chosen && stateIds.includes(chosen) ? chosen : defaultQuestionState(automaton)

  if (!from) {
    return <p className="muted">Add some states in the editor to get an exercise.</p>
  }

  const check = () => {
    const parsed = parseSetAnswer(answer)
    if ('error' in parsed) {
      setFormatError(parsed.error)
      setFeedback(null)
      return
    }
    setFormatError('')
    setFeedback(checkClosure(automaton, from, parsed.states))
    setHintLevel(1)
  }

  const reset = () => {
    setFeedback(null)
    setFormatError('')
  }

  return (
    <div className="exercise">
      <div className="exercise-question">
        <label htmlFor="closure-from">What is the ε-closure of state</label>
        <select
          id="closure-from"
          value={from}
          onChange={(e) => {
            setChosen(e.target.value)
            setAnswer('')
            reset()
          }}
        >
          {stateIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <span>?</span>
      </div>

      <div className="exercise-answer">
        <input
          aria-label="Your answer"
          placeholder="e.g. {1,3}"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value)
            reset()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') check()
          }}
        />
        <button type="button" onClick={check}>
          Check
        </button>
      </div>

      {formatError && <p className="errors-text">{formatError}</p>}

      {feedback?.correct && <p className="ok">Correct! That's the full ε-closure of {from}.</p>}

      {feedback && !feedback.correct && (
        <div className="feedback" aria-live="polite">
          <p className="feedback-title">Not quite.</p>
          {feedback.hints.slice(0, hintLevel).map((hint, i) => (
            <div key={i} className="hint">
              <p className="hint-title">{HINT_TITLES[i]}</p>
              <p>{hint}</p>
              {i === 1 && feedback.misconception && (
                <span className="tag">Misconception: {MISCONCEPTION_LABELS[feedback.misconception]}</span>
              )}
            </div>
          ))}
          {hintLevel < 3 && (
            <button type="button" className="secondary" onClick={() => setHintLevel(hintLevel + 1)}>
              {hintLevel === 1 ? 'Show hint 2: what went wrong' : 'Show hint 3: the answer'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
