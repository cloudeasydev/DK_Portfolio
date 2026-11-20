'use client'

import { useMemo, useState } from 'react'

type PaginationProps = {
  page: number
  totalPages: number
  onChange: (page: number) => void
  label?: string
  compact?: boolean
}

export function usePagedList<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize) || 1)
  const safePage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, pageSize, safePage])

  return {
    page: safePage,
    setPage,
    totalPages,
    paged,
  }
}

function pageWindow(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1])
  if (page <= 3) {
    pages.add(2)
    pages.add(3)
    pages.add(4)
  }
  if (page >= totalPages - 2) {
    pages.add(totalPages - 1)
    pages.add(totalPages - 2)
    pages.add(totalPages - 3)
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  const out: (number | '…')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('…')
    out.push(sorted[i])
  }
  return out
}

export function Pagination({ page, totalPages, onChange, label, compact }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = pageWindow(page, totalPages)

  return (
    <nav className={`pagination${compact ? ' compact' : ''}`} aria-label={label || 'Pagination'}>
      <button
        type="button"
        className="pagination-btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        {compact ? '‹' : '← Prev'}
      </button>
      <div className="pagination-pages">
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e-${i}`} className="pagination-ellipsis" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pagination-page${p === page ? ' active' : ''}`}
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}
      </div>
      <button
        type="button"
        className="pagination-btn"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        {compact ? '›' : 'Next →'}
      </button>
    </nav>
  )
}
