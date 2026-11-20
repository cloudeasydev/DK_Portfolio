import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichContent } from '@/components/RichContent'
import { connectDb } from '@/lib/db'
import { Blog } from '@/lib/models'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params
  await connectDb()
  const article = await Blog.findOne({ _id: id, visibility: 'public' }).lean()
  if (!article) notFound()

  return (
    <article className="section article-page">
      <div className="container narrow article-shell">
        <Link href="/#articles" className="article-back">
          ← Back to articles
        </Link>

        {article.imageUrl ? (
          <div
            className="article-cover"
            style={{ backgroundImage: `url(${article.imageUrl})` }}
            role="img"
            aria-label=""
          />
        ) : null}

        <header className="article-header">
          <div className="card-meta">
            {article.venue ? <span>{article.venue}</span> : <span>Article</span>}
            {article.date ? <time>{article.date}</time> : null}
          </div>
          <h1>{article.title}</h1>
          {article.summary ? <p className="article-lead">{article.summary}</p> : null}
          {(article.tags || []).length > 0 ? (
            <div className="tag-row">
              {(article.tags || []).map((tag: string) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <RichContent html={article.content || ''} />
      </div>
    </article>
  )
}
