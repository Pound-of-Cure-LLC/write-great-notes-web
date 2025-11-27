'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { marked } from 'marked'
import TurndownService from 'turndown'
import { useEffect, forwardRef, useMemo } from 'react'
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logger } from "@/lib/logger";
import '@/styles/tiptap.css'

interface MarkdownTiptapEditorProps {
  value: string
  onChange: (markdown: string) => void
  placeholder?: string
  height?: number
  minHeight?: number
  className?: string
  readOnly?: boolean
  autoHeight?: boolean // If true, editor grows with content instead of fixed height with scroll
}

// Initialize Turndown for HTML → Markdown conversion (module-level constant)
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-'
})

// Helper function to escape HTML for safe fallback
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Convert markdown to HTML for initial editor content
// Moved outside component to avoid recreation on every render
function markdownToHtml(markdown: string): string {
  if (!markdown) return ''

  try {
    // Use per-call configuration instead of global setOptions
    return marked.parse(markdown, {
      gfm: true,
      breaks: true
    }) as string
  } catch (error) {
    // Log with context for debugging
    logger.error('[MarkdownTiptapEditor] Markdown parsing failed:', {
      error,
      markdownLength: markdown.length,
      preview: markdown.substring(0, 100)
    })

    // For parsing errors, escape HTML and wrap in <p> to prevent XSS
    return `<p>${escapeHtml(markdown)}</p>`
  }
}

// Convert HTML back to markdown when content changes
// Moved outside component to avoid recreation on every render
function htmlToMarkdown(html: string): string {
  if (!html) return ''

  try {
    return turndownService.turndown(html)
  } catch (error) {
    // Log with context for debugging
    logger.error('[MarkdownTiptapEditor] HTML to markdown conversion failed:', {
      error,
      htmlLength: html.length,
      preview: html.substring(0, 100)
    })

    // Safe fallback - return original HTML
    return html
  }
}

export const MarkdownTiptapEditor = forwardRef<HTMLDivElement, MarkdownTiptapEditorProps>(
  ({ value, onChange, placeholder = 'Enter text...', height = 400, minHeight, className = '', readOnly = false, autoHeight = false }, ref) => {

    // Memoize extensions array to prevent duplicate extension warnings
    // when multiple editor instances exist on the same page
    const extensions = useMemo(() => [
      StarterKit.configure({
        heading: {
          levels: [1, 3] // Only H1 and H3
        },
        strike: false // Disable strikethrough to avoid confusion
      }),
      Underline.configure({
        // Use unique configuration to avoid duplicate warnings
        HTMLAttributes: {
          class: 'underline'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ], [placeholder])

    const editor = useEditor({
      extensions,
      content: markdownToHtml(value),
      editable: !readOnly,
      immediatelyRender: false, // Prevent SSR hydration mismatches
      onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        const markdown = htmlToMarkdown(html)
        onChange(markdown)
      }
    })

    // Update editor content when value prop changes externally
    // Dependencies are now correct since conversion functions are outside component
    useEffect(() => {
      if (editor && value !== htmlToMarkdown(editor.getHTML())) {
        const html = markdownToHtml(value)
        editor.commands.setContent(html)
      }
    }, [value, editor])

    // Cleanup editor on unmount to prevent memory leaks
    useEffect(() => {
      return () => {
        editor?.destroy()
      }
    }, [editor])

    if (!editor) {
      return <div className="border rounded-md p-4 text-center text-muted-foreground">Loading editor...</div>
    }

    return (
      <div ref={ref} className={`border rounded-md ${className}`}>
        {/* Toolbar */}
        {!readOnly && (
          <div className="sticky top-0 z-10 border-b px-2 py-1 flex gap-0.5 flex-wrap bg-muted/30">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`h-6 w-6 p-0 ${editor.isActive('bold') ? 'bg-muted' : ''}`}
              title="Bold"
            >
              <Bold className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`h-6 w-6 p-0 ${editor.isActive('italic') ? 'bg-muted' : ''}`}
              title="Italic"
            >
              <Italic className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`h-6 w-6 p-0 ${editor.isActive('underline') ? 'bg-muted' : ''}`}
              title="Underline"
            >
              <UnderlineIcon className="h-3 w-3" />
            </Button>
            <div className="w-px h-5 bg-border mx-0.5" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`h-6 w-6 p-0 ${editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}`}
              title="Heading 1"
            >
              <span className="font-bold text-sm">H</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`h-6 w-6 p-0 ${editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}`}
              title="Heading 3"
            >
              <span className="font-bold text-xs">H</span>
            </Button>
            <div className="w-px h-5 bg-border mx-0.5" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`h-6 w-6 p-0 ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
              title="Bullet List"
            >
              <List className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`h-6 w-6 p-0 ${editor.isActive('orderedList') ? 'bg-muted' : ''}`}
              title="Numbered List"
            >
              <ListOrdered className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Editor Content */}
        <div
          className={`prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground p-2 ${autoHeight ? '' : 'overflow-y-auto'}`}
          style={{
            maxHeight: autoHeight ? undefined : height - 50,
            minHeight: minHeight ? minHeight : undefined
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    )
  }
)

MarkdownTiptapEditor.displayName = 'MarkdownTiptapEditor'
