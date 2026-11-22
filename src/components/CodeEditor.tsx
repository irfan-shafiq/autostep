import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'

interface Props {
  initialValue: string
  onChange: (value: string) => void
}

/**
 * A CodeMirror editor. CodeMirror manages its own text, so we create it once
 * and report every change back to React through `onChange`.
 *
 * TODO (step 3): syntax colouring for AutoStep's language and red underlines for parse errors.
 */
export function CodeEditor({ initialValue, onChange }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!host.current) return
    const view = new EditorView({
      doc: initialValue,
      parent: host.current,
      extensions: [
        basicSetup,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString())
        }),
      ],
    })
    return () => view.destroy()
    // Create the editor once; later text changes come from the user typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={host} className="code-editor" />
}
