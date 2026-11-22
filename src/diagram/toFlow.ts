import { MarkerType, type Edge, type Node } from '@xyflow/react'
import type { Automaton } from '../automaton/model'

/** How many screen pixels one grid unit in the code (`at 1,1`) is worth. */
const GRID = 140

export interface StateNodeData extends Record<string, unknown> {
  label: string
  start: boolean
  accept: boolean
}

/**
 * Turns an Automaton into React Flow nodes and edges.
 * Transitions between the same two states are merged into one arrow with a label like "a, b".
 *
 * TODO (step 3): custom state node (double ring for accepting), custom edges for
 * curves and self-loops, and auto-layout for states without a position.
 */
export function toFlow(a: Automaton): { nodes: Node<StateNodeData>[]; edges: Edge[] } {
  const nodes: Node<StateNodeData>[] = a.states.map((s, i) => ({
    id: s.id,
    // y is flipped so that "up" in the code is up on screen.
    position: { x: (s.x ?? i) * GRID, y: -(s.y ?? 0) * GRID },
    data: { label: s.id, start: !!s.start, accept: !!s.accept },
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      border: s.accept ? '4px double #334155' : '2px solid #334155',
      background: s.start ? '#eef2ff' : '#ffffff',
    },
  }))

  const merged = new Map<string, { from: string; to: string; symbols: string[] }>()
  for (const t of a.transitions) {
    const key = `${t.from}\u0000${t.to}`
    const entry = merged.get(key) ?? { from: t.from, to: t.to, symbols: [] }
    entry.symbols.push(t.symbol)
    merged.set(key, entry)
  }

  const edges: Edge[] = [...merged.values()].map(({ from, to, symbols }) => ({
    id: `${from}->${to}`,
    source: from,
    target: to,
    label: symbols.join(', '),
    markerEnd: { type: MarkerType.ArrowClosed },
  }))

  return { nodes, edges }
}
