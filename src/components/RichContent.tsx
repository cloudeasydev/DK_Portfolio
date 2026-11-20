type RichContentProps = {
  html?: string
  className?: string
}

export function RichContent({ html, className }: RichContentProps) {
  if (!html?.trim()) {
    return <p className="rich-content-empty">No content yet.</p>
  }

  return (
    <div
      className={`rich-content${className ? ` ${className}` : ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
