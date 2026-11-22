import { Background, BackgroundVariant, Controls, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo } from 'react'
import type { Automaton } from '../automaton/model'
import { toFlow } from '../diagram/toFlow'

/** The live diagram: an infinite, zoomable, pannable canvas (React Flow). */
export function Diagram({ automaton }: { automaton: Automaton }) {
  const { nodes, edges } = useMemo(() => toFlow(automaton), [automaton])

  return (
    <div className="diagram">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background variant={BackgroundVariant.Dots} gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
