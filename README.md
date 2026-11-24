# AutoStep

**Practising finite automata with step-by-step feedback.**
Final year project, BSc Artificial Intelligence and Computer Science, University of Birmingham.

Students write automata (and, later, their exercise answers) in a small code language and see them drawn live.
The goal: when a step of an exercise such as subset construction is wrong, AutoStep explains **why**
(e.g. "you forgot the ε-closure") and gives escalating hints, instead of only saying it is wrong.

**Live demo:** https://YOUR-USERNAME.github.io/autostep/

## What works now

- Code editor (CodeMirror) with a live diagram (React Flow: zoom, pan, infinite grid)
- Parser for AutoStep's language: states, positions, start/accept, transitions, ε, arrow shapes
- Clear parse errors with line numbers; bad lines are skipped, the rest is still drawn
- ε-closure of the start state, shown live
- Unit tests (Vitest), run automatically on every push; the site deploys only if they pass

## The language

```
# states: name, position (optional), role (optional)
state 1  at 0,0     start
state 2  at 1,1
state 5  at 2.5,-1  accept

# transitions: from -symbol-> to, then an optional shape
1 -a-> 2
1 -ε-> 3            # ε can also be typed as eps:  1 -eps-> 3
3 -b-> 4   curve left
6 -a-> 6   loop right
```

- One item per line; blank lines and `#` comments are ignored.
- States reject by default; mark them `start` (only one) or `accept`.
- A state used in a transition but never declared is created automatically.
- Each arrow reads exactly one symbol (or ε).
- Shapes: `curve left`, `curve right`, `loop up`, `loop down`, `loop left`, `loop right`.

## Run it locally

```bash
npm install        # once, downloads the libraries into node_modules/
npm run dev        # starts the app at http://localhost:5173, reloads on every save
npm test           # runs all tests once
npm run test:watch # reruns tests every time you save
npm run build      # type-checks and builds the app for deployment (into dist/)
```

## Tech stack

| Part | Choice |
|---|---|
| UI | React + TypeScript |
| Editor | CodeMirror |
| Diagram | React Flow |
| Build / dev server | Vite |
| Tests | Vitest |
| CI/CD | GitHub Actions → GitHub Pages |
| Backend (planned) | Spring Boot + PostgreSQL, for evaluation logs and sharing |

All algorithms run in the browser. The backend will only store anonymised study data and share links.

## Repositories and deployment

- **GitLab** (university): main repository; project marking is based on these commits.
- **GitHub**: mirror of the same commits; one `git push` updates both.
- **GitHub Actions** (`.github/workflows/deploy.yml`): install → test → build → deploy to GitHub Pages on every push to `main`.

## Project structure

```
src/
  automaton/            ← core logic: plain TypeScript, no UI, fully tested
    model.ts            ← types: State, Transition, Automaton (+ helpers)
    parser.ts           ← AutoStep language → Automaton, with line-numbered errors
    epsilonClosure.ts   ← ε-closure
    examples.ts         ← the "lecture 3" ε-NFA, as data and as source code
    automaton.test.ts   ← tests for the model and ε-closure
    parser.test.ts      ← tests for the parser
  diagram/
    toFlow.ts           ← Automaton → React Flow nodes and edges
  components/
    CodeEditor.tsx      ← CodeMirror editor
    Diagram.tsx         ← React Flow diagram
  App.tsx               ← the page: editor, errors, diagram
.github/workflows/
  deploy.yml            ← test and deploy to GitHub Pages
```

## Build plan

| Step | What | Status |
|---|---|---|
| 0 | Project setup, GitLab + GitHub, GitHub Actions → Pages | Done |
| 1 | Automaton model | Done (types, helpers, ε-closure) |
| 2 | Parser with line-numbered errors | Done |
| 3 | Editor ↔ diagram: live update done; still to do: curved arrows, self-loops, double-ring accept states, start arrow | In progress |
| 4 | Solvers: subset construction, minimisation, trace | |
| 5 | Step checker | |
| 6 | Bug library (misconception diagnosis) + hint templates | |
| 7 | Exercise screens + exercise generator | |
| 8 | Backend + logging, then the user evaluation | |
