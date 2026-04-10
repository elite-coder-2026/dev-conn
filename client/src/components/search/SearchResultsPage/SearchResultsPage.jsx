import { useState, useEffect } from 'react'
import Avatar from '../../common/Avatar/Avatar'
import './SearchResultsPage.css'

export default function SearchResultsPage({ query }) {
  const [people, setPeople] = useState([])
  const [posts, setPosts]   = useState([])

  useEffect(() => {
    if (!query) return
    fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=10`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : { users: [] })
      .then(data => setPeople(data.users || []))

    fetch(`/api/feed/search?q=${encodeURIComponent(query)}&limit=10`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : { posts: [] })
      .then(data => setPosts(data.posts || []))
  }, [query])

  return (
    <div className="search-results-page">
      <div className="search-results-page__inner">

        <div className="search-results-page__header">
          <h1 className="search-results-page__title">
            Results for <span className="search-results-page__query">"{query}"</span>
          </h1>
        </div>

        <section className="search-results-page__section">
          <h2 className="search-results-page__section-heading">People</h2>
          <div className="search-results__people">
            {people.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No people found.</p>}
            {people.map(person => (
              <div key={person.id} className="search-people-card">
                <Avatar src={person.avatar_url} alt={person.name} size="md" online={person.is_online} />
                <div className="search-people-card__info">
                  <p className="search-people-card__name">{person.name}</p>
                  <p className="search-people-card__handle">{person.handle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="search-results-page__section">
          <h2 className="search-results-page__section-heading">Posts</h2>
          <div className="search-results__posts">
            {posts.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No posts found.</p>}
            {posts.map(post => (
              <div key={post.id} className="search-post-card">
                <div className="search-post-card__author">
                  <Avatar src={post.author_avatar_url} alt={post.author_name} size="sm" />
                  <div>
                    <p className="search-post-card__name">{post.author_name}</p>
                    <p className="search-post-card__meta">{post.author_handle}</p>
                  </div>
                </div>
                <p className="search-post-card__content">{post.content}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
