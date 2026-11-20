'use client'

import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { FontFamily, TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { FontSize } from './FontSize'

type NotionEditorProps = {
  content: string
  onChange: (html: string) => void
  editable?: boolean
  onEditorReady?: (editor: Editor | null) => void
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px']

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Monospace', value: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  { label: 'Comic Sans', value: '"Comic Sans MS", "Segoe UI", cursive' },
]

async function uploadImageFile(file: File) {
  const res = await api.upload(file)
  return res.url
}

export function EditorFormatBar({ editor }: { editor: Editor | null }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!editor) return
    const refresh = () => setTick((n) => n + 1)
    editor.on('selectionUpdate', refresh)
    editor.on('transaction', refresh)
    return () => {
      editor.off('selectionUpdate', refresh)
      editor.off('transaction', refresh)
    }
  }, [editor])

  if (!editor) return null

  const currentSize = (editor.getAttributes('textStyle').fontSize as string) || ''
  const currentFamily = (editor.getAttributes('textStyle').fontFamily as string) || ''

  return (
    <div className="notion-format-bar topbar-format">
      <div className="notion-format-group">
        <span className="notion-format-label">Font</span>
        <select
          className="notion-format-select"
          value={currentFamily}
          title="Font type"
          onChange={(e) => {
            const value = e.target.value
            if (!value) editor.chain().focus().unsetFontFamily().run()
            else editor.chain().focus().setFontFamily(value).run()
          }}
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font.label} value={font.value} style={{ fontFamily: font.value || undefined }}>
              {font.label}
            </option>
          ))}
        </select>
        <select
          className="notion-format-select size"
          value={currentSize}
          title="Font size"
          onChange={(e) => {
            const value = e.target.value
            if (!value) editor.chain().focus().unsetFontSize().run()
            else editor.chain().focus().setFontSize(value).run()
          }}
        >
          <option value="">Size</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size.replace('px', '')}
            </option>
          ))}
        </select>
      </div>
      <div className="notion-format-group">
        <span className="notion-format-label">Lists</span>
        <button
          type="button"
          className={editor.isActive('bulletList') ? 'on' : ''}
          title="Bullet points"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Bullets
        </button>
        <button
          type="button"
          className={editor.isActive('orderedList') ? 'on' : ''}
          title="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. Numbers
        </button>
      </div>
      <div className="notion-format-group">
        <span className="notion-format-label">Align</span>
        <button
          type="button"
          className={editor.isActive({ textAlign: 'left' }) ? 'on' : ''}
          title="Left"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          Left
        </button>
        <button
          type="button"
          className={editor.isActive({ textAlign: 'center' }) ? 'on' : ''}
          title="Center"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          Center
        </button>
        <button
          type="button"
          className={editor.isActive({ textAlign: 'right' }) ? 'on' : ''}
          title="Right"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          Right
        </button>
        <button
          type="button"
          className={editor.isActive({ textAlign: 'justify' }) ? 'on' : ''}
          title="Justify"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          Justify
        </button>
      </div>
    </div>
  )
}

export function NotionEditor({ content, onChange, editable = true, onEditorReady }: NotionEditorProps) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [alignOpen, setAlignOpen] = useState(false)
  const [sizeOpen, setSizeOpen] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'listItem'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ allowBase64: true, inline: false }),
      Placeholder.configure({
        placeholder: "Press '+' or start writing… paste images anytime",
      }),
    ],
    content: content || '',
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class: 'notion-tiptap',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (!file) return true
            void uploadImageFile(file).then((url) => {
              const node = view.state.schema.nodes.image.create({ src: url })
              view.dispatch(view.state.tr.replaceSelectionWith(node))
            })
            return true
          }
        }
        return false
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files
        if (!files?.length) return false
        const file = files[0]
        if (!file.type.startsWith('image/')) return false
        event.preventDefault()
        void uploadImageFile(file).then((url) => {
          const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (!coords) return
          const node = view.state.schema.nodes.image.create({ src: url })
          view.dispatch(view.state.tr.insert(coords.pos, node))
        })
        return true
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (content !== current && content !== undefined) {
      editor.commands.setContent(content || '', { emitUpdate: false })
    }
  }, [content, editor])

  useEffect(() => {
    onEditorReady?.(editor)
    return () => onEditorReady?.(null)
  }, [editor, onEditorReady])

  if (!editor) return <div className="notion-editor-loading">Loading editor…</div>

  return (
    <div className="notion-rich">
      {/* Selection popup — like Notion format menu */}
      <BubbleMenu editor={editor} className="notion-popup bubble-popup">
        <button
          type="button"
          className={editor.isActive('bold') ? 'on' : ''}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className={editor.isActive('italic') ? 'on' : ''}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </button>
        <button
          type="button"
          className={editor.isActive('underline') ? 'on' : ''}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </button>
        <button
          type="button"
          className={editor.isActive('strike') ? 'on' : ''}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </button>
        <span className="tb-sep" />
        <button
          type="button"
          className={editor.isActive('bulletList') ? 'on' : ''}
          title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </button>
        <button
          type="button"
          className={editor.isActive('orderedList') ? 'on' : ''}
          title="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </button>
        <span className="tb-sep" />
        <button
          type="button"
          className={editor.isActive({ textAlign: 'left' }) ? 'on' : ''}
          title="Align left"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          ⬅
        </button>
        <button
          type="button"
          className={editor.isActive({ textAlign: 'center' }) ? 'on' : ''}
          title="Align center"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          ≡
        </button>
        <button
          type="button"
          className={editor.isActive({ textAlign: 'right' }) ? 'on' : ''}
          title="Align right"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          ➡
        </button>
        <button
          type="button"
          className={editor.isActive({ textAlign: 'justify' }) ? 'on' : ''}
          title="Justify"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          ≣
        </button>
        <span className="tb-sep" />
        <div className="popup-menu-wrap">
          <button type="button" onClick={() => { setSizeOpen((v) => !v); setAlignOpen(false) }}>
            Font ▾
          </button>
          {sizeOpen && (
            <div className="popup-submenu wide">
              {FONT_FAMILIES.filter((f) => f.value).map((font) => (
                <button
                  key={font.label}
                  type="button"
                  style={{ fontFamily: font.value }}
                  onClick={() => {
                    editor.chain().focus().setFontFamily(font.value).run()
                    setSizeOpen(false)
                  }}
                >
                  {font.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetFontFamily().run()
                  setSizeOpen(false)
                }}
              >
                Default
              </button>
              <span className="popup-submenu-label">Size</span>
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setFontSize(size).run()
                    setSizeOpen(false)
                  }}
                >
                  {size.replace('px', '')}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="popup-menu-wrap">
          <button type="button" onClick={() => { setAlignOpen((v) => !v); setSizeOpen(false) }}>
            Align ▾
          </button>
          {alignOpen && (
            <div className="popup-submenu">
              {(
                [
                  ['left', 'Left'],
                  ['center', 'Center'],
                  ['right', 'Right'],
                  ['justify', 'Justify'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={editor.isActive({ textAlign: value }) ? 'on' : ''}
                  onClick={() => {
                    editor.chain().focus().setTextAlign(value).run()
                    setAlignOpen(false)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setLinkUrl(editor.getAttributes('link').href || '')
            setLinkOpen(true)
            setAlignOpen(false)
            setSizeOpen(false)
          }}
        >
          🔗
        </button>
      </BubbleMenu>

      {/* Empty line "+" popup — like Notion block inserter */}
      <FloatingMenu editor={editor} className="notion-popup float-popup">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          className={editor.isActive('bulletList') ? 'on' : ''}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>
        <button
          type="button"
          className={editor.isActive('orderedList') ? 'on' : ''}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
        <span className="tb-sep" />
        <button
          type="button"
          title="Align left"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          ⬅
        </button>
        <button
          type="button"
          title="Align center"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          ≡
        </button>
        <button
          type="button"
          title="Align right"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          ➡
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          Code
        </button>
        <label className="tb-upload">
          Image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              void uploadImageFile(file).then((url) => {
                editor.chain().focus().setImage({ src: url }).run()
              })
              e.target.value = ''
            }}
          />
        </label>
      </FloatingMenu>

      <EditorContent editor={editor} />

      {linkOpen && (
        <div className="notion-modal-backdrop" onClick={() => setLinkOpen(false)}>
          <div className="notion-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add link</h3>
            <input
              autoFocus
              value={linkUrl}
              placeholder="https://"
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (linkUrl) editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
                  setLinkOpen(false)
                }
              }}
            />
            <div className="notion-modal-actions">
              <button type="button" className="ghost" onClick={() => setLinkOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  if (linkUrl) editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
                  else editor.chain().focus().unsetLink().run()
                  setLinkOpen(false)
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function downloadWordDoc(title: string, summary: string, html: string) {
  const safeTitle = (title || 'Untitled').replace(/[^\w\s-]/g, '').trim() || 'document'
  const doc = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:w="urn:schemas-microsoft-com:office:word"
 xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title || 'Untitled')}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 12pt; line-height: 1.5; color: #111; }
  img { max-width: 100%; }
</style>
</head>
<body>
  <h1>${escapeHtml(title || 'Untitled')}</h1>
  ${summary ? `<p><em>${escapeHtml(summary)}</em></p>` : ''}
  ${html || '<p></p>'}
</body>
</html>`

  const blob = new Blob(['\ufeff', doc], {
    type: 'application/msword;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${safeTitle}.doc`
  a.click()
  URL.revokeObjectURL(url)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
