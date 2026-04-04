import Avatar from '../../common/Avatar/Avatar'
import mockContacts from '../../../data/mockContacts'
import './SearchResultsPage.css'

const MOCK_POSTS = [
  {
    id: 'sp1',
    author: 'Jordan Kim',
    handle: '@jordankim',
    avatarSrc: 'https://i.pravatar.cc/150?u=c1',
    content: 'Just shipped a new feature using React Server Components — the DX is unreal. Highly recommend giving it a shot.',
    timeAgo: '3h ago',
    likes: 24,
    comments: 6,
  },
  {
    id: 'sp2',
    author: 'Priya Nair',
    handle: '@priyanair',
    avatarSrc: 'https://i.pravatar.cc/150?u=c2',
    content: 'Anyone else finding TypeScript generics click way better once you start writing your own utility types?',
    timeAgo: '1d ago',
    likes: 41,
    comments: 12,
  },
  {
    id: 'sp3',
    author: 'Marcus Webb',
    handle: '@marcuswebb',
    avatarSrc: 'https://i.pravatar.cc/150?u=c3',
    content: 'Open source tip: write the README before the code. Forces you to think about the API from the outside in.',
    timeAgo: '2d ago',
    likes: 88,
    comments: 19,
  },
]

export default function SearchResultsPage({ query }) {
  const people = mockContacts.slice(0, 4)

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
            {people.map(person => (
              <div key={person.id} className="search-people-card">
                <Avatar src={person.avatarSrc} alt={person.name} size="md" online={person.online} />
                <div className="search-people-card__info">
                  <p className="search-people-card__name">{person.name}</p>
                  <p className="search-people-card__handle">{person.handle}</p>
                </div>
                <button className="search-people-card__btn">Add Friend</button>
              </div>
            ))}
          </div>
        </section>

        <section className="search-results-page__section">
          <h2 className="search-results-page__section-heading">Posts</h2>
          <div className="search-results__posts">
            {MOCK_POSTS.map(post => (
              <div key={post.id} className="search-post-card">
                <div className="search-post-card__author">
                  <Avatar src={post.avatarSrc} alt={post.author} size="sm" />
                  <div>
                    <p className="search-post-card__name">{post.author}</p>
                    <p className="search-post-card__meta">{post.handle} · {post.timeAgo}</p>
                  </div>
                </div>
                <p className="search-post-card__content">{post.content}</p>
                <p className="search-post-card__stats">{post.likes} likes · {post.comments} comments</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
