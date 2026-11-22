# AutoStep

Practising finite automata with step-by-step feedback. Final year project, University of Birmingham.

## Run it

```bash
npm install        # once, downloads the libraries into node_modules/
npm run dev        # starts the app at http://localhost:5173, reloads on every save
npm test           # runs all tests once
npm run test:watch # reruns tests every time you save
npm run build      # type-checks and builds the app for deployment (into dist/)
```

## Project structure

```
src/
  automaton/            ← the core logic: plain TypeScript, no UI, fully tested
    model.ts            ← types: State, Transition, Automaton (+ small helpers)
    epsilonClosure.ts   ← first solver: ε-closure
    examples.ts         ← the "lecture 3" ε-NFA, as data and as source code
    automaton.test.ts   ← tests (Vitest)
  diagram/
    toFlow.ts           ← converts an Automaton into React Flow nodes and edges
  components/
    CodeEditor.tsx      ← CodeMirror editor
    Diagram.tsx         ← React Flow diagram (infinite canvas, zoom, pan)
  App.tsx               ← the page that puts it together
```

## Build plan

| Step | What | Status |
|---|---|---|
| 0 | Project setup (Vite, React, TypeScript, Vitest, CodeMirror, React Flow) | done |
| 1 | Automaton model | started (types + ε-closure) |
| 2 | Parser for AutoStep's language, with line-numbered errors | next |
| 3 | Editor ↔ diagram live; custom state nodes, curved arrows, self-loops | |
| 4 | Solvers: subset construction, minimisation, trace | |
| 5 | Step checker | |
| 6 | Bug library + hint templates | |
| 7 | Exercise screens + generator | |
| 8 | Backend + logging, evaluation | |
