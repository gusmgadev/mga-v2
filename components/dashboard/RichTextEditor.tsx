'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { Bold, Italic, Highlighter } from 'lucide-react'
import { theme } from '@/lib/theme'

interface Props {
  defaultValue?: string
  onChange: (html: string) => void
}

const btnBase: React.CSSProperties = {
  background: 'none',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '4px',
  cursor: 'pointer',
  padding: '5px 8px',
  display: 'flex',
  alignItems: 'center',
  lineHeight: 1,
}

export default function RichTextEditor({ defaultValue = '', onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Highlight.configure({ multicolor: false })],
    content: defaultValue,
    onUpdate: ({ editor }) => {
      const hasText = editor.getText().trim().length > 0
      onChange(hasText ? editor.getHTML() : '')
    },
  })

  if (!editor) return null

  const btn = (active: boolean): React.CSSProperties => ({
    ...btnBase,
    backgroundColor: active ? `${theme.colors.primary}18` : 'transparent',
    borderColor: active ? theme.colors.primary : theme.colors.border,
    color: active ? theme.colors.primary : theme.colors.textMuted,
  })

  return (
    <>
      <style>{`
        .mga-rte .ProseMirror {
          outline: none;
          min-height: 160px;
          padding: 10px 14px;
          font-size: 14px;
          font-family: inherit;
          color: ${theme.colors.text};
          line-height: 1.6;
        }
        .mga-rte .ProseMirror > * + * { margin-top: 0.5em; }
        .mga-rte .ProseMirror mark { background-color: #fef08a; border-radius: 2px; padding: 0 2px; }
        .mga-rte .ProseMirror strong { font-weight: 700; }
        .mga-rte .ProseMirror em { font-style: italic; }
        .mga-rte .ProseMirror p.is-editor-empty:first-child::before {
          content: 'Texto completo de la noticia...';
          float: left;
          color: #aaa;
          pointer-events: none;
          height: 0;
        }
      `}</style>
      <div
        className="mga-rte"
        style={{
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii.sm,
          overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '8px 10px',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: '#F8F9FB',
        }}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            style={btn(editor.isActive('bold'))}
            title="Negrita (Ctrl+B)"
          >
            <Bold size={13} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            style={btn(editor.isActive('italic'))}
            title="Itálica (Ctrl+I)"
          >
            <Italic size={13} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            style={btn(editor.isActive('highlight'))}
            title="Resaltar"
          >
            <Highlighter size={13} />
          </button>
        </div>
        <EditorContent editor={editor} />
      </div>
    </>
  )
}
