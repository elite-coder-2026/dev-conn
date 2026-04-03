import { useState, useRef } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import PeopleIcon from '@mui/icons-material/People'
import Avatar from '../../common/Avatar/Avatar'
import './FriendsPage.css'

// ── Toggle between 'friends' (mutual) and 'follow' (one-way) ──────
const CONNECTION_MODE = 'friends'

const INITIAL_USERS = [
  { id: 'u1', name: 'Jordan Kim',    handle: '@jordankim',    avatarSrc: 'https://i.pravatar.cc/150?u=c1',  online: true,  bio: 'Frontend engineer obsessed with design systems.',    followers: 2100, mutuals: 6,  status: 'none' },
  { id: 'u2', name: 'Priya Nair',    handle: '@priyanair',    avatarSrc: 'https://i.pravatar.cc/150?u=c2',  online: true,  bio: 'Building accessible UIs at scale.',                  followers: 4300, mutuals: 9,  status: 'none' },
  { id: 'u3', name: 'Marcus Webb',   handle: '@marcuswebb',   avatarSrc: 'https://i.pravatar.cc/150?u=c3',  online: true,  bio: 'Open source contributor. Coffee first, code second.', followers: 891,  mutuals: 3,  status: 'none' },
  { id: 'u4', name: 'Lena Hoffmann', handle: '@lenahoffmann', avatarSrc: 'https://i.pravatar.cc/150?u=c4',  online: true,  bio: 'CSS is my love language.',                           followers: 3700, mutuals: 11, status: 'none' },
  { id: 'u5', name: 'Ryan Patel',    handle: '@ryanpatel',    avatarSrc: 'https://i.pravatar.cc/150?u=c5',  online: true,  bio: 'Performance engineer. Making the web fast.',         followers: 1200, mutuals: 5,  status: 'none' },
  { id: 'u6', name: 'Sasha Okonkwo', handle: '@sashaokonkwo', avatarSrc: 'https://i.pravatar.cc/150?u=c6',  online: false, bio: 'Design + code. Sometimes both at once.',             followers: 6800, mutuals: 7,  status: 'none' },
  { id: 'u7', name: 'Yuki Tanaka',   handle: '@yukitanaka',   avatarSrc: 'https://i.pravatar.cc/150?u=c8',  online: false, bio: 'TypeScript evangelist. Ship it.',                    followers: 2900, mutuals: 4,  status: 'none' },
  { id: 'u8', name: 'Claire Dubois', handle: '@clairedubois', avatarSrc: 'https://i.pravatar.cc/150?u=c9',  online: false, bio: 'Full-stack dev. Terrible at naming things.',         followers: 1500, mutuals: 8,  status: 'none' },
]

const INITIAL_REQUESTS = [
  { id: 'r1', name: 'Dmitri Volkov',  handle: '@dmitrivolkov',  avatarSrc: 'https://i.pravatar.cc/150?u=r1', online: false, bio: 'Systems programmer and coffee snob.',       mutuals: 4, timeAgo: '2d ago' },
  { id: 'r2', name: 'Fatima Al-Amin', handle: '@fatimaalamin',  avatarSrc: 'https://i.pravatar.cc/150?u=r2', online: true,  bio: 'UX researcher turned frontend developer.',  mutuals: 7, timeAgo: '5d ago' },
  { id: 'r3', name: 'Lucas Mendes',   handle: '@lucasmendes',   avatarSrc: 'https://i.pravatar.cc/150?u=r3', online: false, bio: 'Making data beautiful, one chart at a time.', mutuals: 2, timeAgo: '1w ago' },
]

const INITIAL_SUGGESTIONS = [
  { id: 's1', name: 'Aria Patel',     handle: '@ariapatel',     avatarSrc: 'https://i.pravatar.cc/150?u=s1', mutuals: 6 },
  { id: 's2', name: 'Noah Schmidt',   handle: '@noahschmidt',   avatarSrc: 'https://i.pravatar.cc/150?u=s2', mutuals: 3 },
  { id: 's3', name: 'Mei Lin',        handle: '@meilin',        avatarSrc: 'https://i.pravatar.cc/150?u=s3', mutuals: 8 },
  { id: 's4', name: 'Kwame Asante',   handle: '@kwameasante',   avatarSrc: 'https://i.pravatar.cc/150?u=s4', mutuals: 2 },
]

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function FriendsPage() {
  const [users, setUsers]           = useState(INITIAL_USERS)
  const [requests, setRequests]     = useState(INITIAL_REQUESTS)
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS)
  const [tab, setTab]               = useState('discover')
  const [search, setSearch]         = useState('')
  const [toast, setToast]           = useState(null)
  const toastTimer                  = useRef(null)

  function showToast(message) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }

  function setUserStatus(id, status) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
  }

  // ── friends mode handlers ─────────────────────────────────────
  function handleAddFriend(id) {
    const user = users.find(u => u.id === id)
    setUserStatus(id, 'pending_sent')
    showToast(`Friend request sent to ${user.name}`)
  }

  function handleCancelRequest(id) {
    setUserStatus(id, 'none')
  }

  function handleUnfriend(id) {
    const user = users.find(u => u.id === id) || requests.find(r => r.id === id)
    setUserStatus(id, 'none')
    setUsers(prev => prev.filter(u => u.id !== id || INITIAL_USERS.find(iu => iu.id === id)))
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'none' } : u))
    if (user) showToast(`Unfriended ${user.name}`)
  }

  function handleAcceptRequest(id) {
    const req = requests.find(r => r.id === id)
    if (!req) return
    // Add to users grid if not already there
    setUsers(prev => {
      const exists = prev.find(u => u.id === id)
      if (exists) return prev.map(u => u.id === id ? { ...u, status: 'friends' } : u)
      return [...prev, { ...req, followers: 0, mutuals: reconnection_queries.mutuals, status: 'friends' }]
    })
    setRequests(prev => prev.filter(r => r.id !== id))
    showToast(`You are now friends with ${reconnection_queries.name}`)
  }

  function handleDeclineRequest(id) {
    const req = requests.find(r => r.id === id)
    setRequests(prev => prev.filter(r => r.id !== id))
    if (req) showToast(`Request from ${reconnection_queries.name} declined`)
  }

  // ── follow mode handlers ──────────────────────────────────────
  function handleFollow(id) {
    const user = users.find(u => u.id === id)
    setUserStatus(id, 'following')
    if (user) showToast(`Now following ${user.name}`)
  }

  function handleUnfollow(id) {
    const user = users.find(u => u.id === id)
    setUserStatus(id, 'none')
    if (user) showToast(`Unfollowed ${user.name}`)
  }

  function handleDismissSuggestion(id) {
    setSuggestions(prev => prev.filter(s => s.id !== id))
  }

  // ── derived ───────────────────────────────────────────────────
  const connectedUsers = users.filter(u =>
    u.status === 'friends' || u.status === 'following'
  )

  const filteredConnections = connectedUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.handle.toLowerCase().includes(search.toLowerCase())
  )

  const tabs = CONNECTION_MODE === 'friends'
    ? ['discover', 'connections', 'requests']
    : ['discover', 'connections']

  const tabLabels = {
    discover:    'Discover',
    connections: CONNECTION_MODE === 'friends' ? 'Friends' : 'Following',
    requests:    'Requests',
  }

  // ── connection button renderer ────────────────────────────────
  function ConnectionButton({ user }) {
    if (CONNECTION_MODE === 'follow') {
      if (user.status === 'following') {
        return (
          <button className="friend-card__btn btn-connection btn-connection--following" onClick={() => handleUnfollow(user.id)}>
            <span className="btn-connection__default"><CheckIcon style={{ fontSize: 14 }} /> Following</span>
            <span className="btn-connection__hover">Unfollow</span>
          </button>
        )
      }
      return (
        <button className="friend-card__btn btn-connection btn-connection--follow" onClick={() => handleFollow(user.id)}>
          Follow
        </button>
      )
    }

    // friends mode
    if (user.status === 'friends') {
      return (
        <button className="friend-card__btn btn-connection btn-connection--friends" onClick={() => handleUnfriend(user.id)}>
          <span className="btn-connection__default"><CheckIcon style={{ fontSize: 14 }} /> Friends</span>
          <span className="btn-connection__hover">Unfriend</span>
        </button>
      )
    }
    if (user.status === 'pending_sent') {
      return (
        <button className="friend-card__btn btn-connection btn-connection--pending" onClick={() => handleCancelRequest(user.id)}>
          <span className="btn-connection__default">Pending</span>
          <span className="btn-connection__hover">Cancel</span>
        </button>
      )
    }
    return (
      <button className="friend-card__btn btn-connection btn-connection--add" onClick={() => handleAddFriend(user.id)}>
        <PersonAddIcon style={{ fontSize: 14 }} /> Add Friend
      </button>
    )
  }

  return (
    <div className="friends-page">
      <div className="friends-page__inner">

        {/* Header */}
        <div className="friends-page__header">
          <h1 className="friends-page__title">
            {CONNECTION_MODE === 'friends' ? 'Friends' : 'People'}
          </h1>
          <div className="friends-page__tabs">
            {tabs.map(t => (
              <button
                key={t}
                className={`friends-page__tab${tab === t ? ' friends-page__tab--active' : ''}`}
                onClick={() => setTab(t)}
              >
                {tabLabels[t]}
                {t === 'requests' && requests.length > 0 && (
                  <span className="friends-page__tab-badge">{requests.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Discover tab ── */}
        {tab === 'discover' && (
          <>
            <div className="friends-page__grid">
              {users.map(user => (
                <div key={user.id} className="friend-card">
                  <div className="friend-card__avatar">
                    <Avatar src={user.avatarSrc} alt={user.name} size="lg" online={user.online} />
                  </div>
                  <p className="friend-card__name">{user.name}</p>
                  <p className="friend-card__handle">{user.handle}</p>
                  <p className="friend-card__bio">{user.bio}</p>
                  <p className="friend-card__mutual">
                    {CONNECTION_MODE === 'friends'
                      ? `${user.mutuals} mutual friends`
                      : `${formatCount(user.followers)} followers`}
                  </p>
                  <div className="friend-card__actions">
                    <ConnectionButton user={user} />
                  </div>
                </div>
              ))}
            </div>

            {suggestions.length > 0 && (
              <div className="suggestions-section">
                <h2 className="suggestions-section__heading">People You May Know</h2>
                <div className="suggestions-row">
                  {suggestions.map(s => (
                    <div key={s.id} className="suggestion-card">
                      <button
                        className="suggestion-card__dismiss"
                        aria-label="Dismiss"
                        onClick={() => handleDismissSuggestion(s.id)}
                      >
                        <CloseIcon style={{ fontSize: 14 }} />
                      </button>
                      <Avatar src={s.avatarSrc} alt={s.name} size="md" />
                      <p className="friend-card__name">{s.name}</p>
                      <p className="friend-card__handle">{s.handle}</p>
                      <p className="friend-card__mutual">{s.mutuals} mutual</p>
                      <button
                        className="friend-card__btn friend-card__btn--primary suggestion-card__btn"
                        onClick={() => {
                          if (CONNECTION_MODE === 'friends') {
                            showToast(`Friend request sent to ${s.name}`)
                          } else {
                            showToast(`Now following ${s.name}`)
                          }
                          handleDismissSuggestion(s.id)
                        }}
                      >
                        {CONNECTION_MODE === 'friends'
                          ? <><PersonAddIcon style={{ fontSize: 14 }} /> Add</>
                          : 'Follow'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Connections tab ── */}
        {tab === 'connections' && (
          <>
            <div className="friends-page__search">
              <SearchIcon style={{ fontSize: 18 }} />
              <input
                type="text"
                placeholder={`Search ${tabLabels.connections.toLowerCase()}`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="friends-page__section">
              {filteredConnections.length === 0 && (
                <p className="friends-page__empty">
                  {search ? 'No results found.' : `No ${tabLabels.connections.toLowerCase()} yet.`}
                </p>
              )}
              {filteredConnections.map(user => (
                <div key={user.id} className="request-row">
                  <Avatar src={user.avatarSrc} alt={user.name} size="md" online={user.online} />
                  <div className="request-row__info">
                    <p className="request-row__name">{user.name}</p>
                    <p className="request-row__meta">{user.handle}</p>
                  </div>
                  <div className="request-row__actions">
                    <button className="friend-card__btn friend-card__btn--secondary">
                      <PeopleIcon style={{ fontSize: 16 }} /> Message
                    </button>
                    <button
                      className="friend-card__btn friend-card__btn--ghost btn-destructive"
                      onClick={() => CONNECTION_MODE === 'friends' ? handleUnfriend(user.id) : handleUnfollow(user.id)}
                    >
                      {CONNECTION_MODE === 'friends' ? 'Unfriend' : 'Unfollow'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Requests tab (friends mode only) ── */}
        {tab === 'requests' && CONNECTION_MODE === 'friends' && (
          <div className="friends-page__section">
            {requests.length === 0 && (
              <p className="friends-page__empty">No pending requests.</p>
            )}
            {requests.map(req => (
              <div key={reconnection_queries.id} className="request-row">
                <Avatar src={reconnection_queries.avatarSrc} alt={reconnection_queries.name} size="md" />
                <div className="request-row__info">
                  <p className="request-row__name">{reconnection_queries.name}</p>
                  <p className="request-row__meta">{reconnection_queries.mutuals} mutual friends · {reconnection_queries.timeAgo}</p>
                </div>
                <div className="request-row__actions">
                  <button
                    className="friend-card__btn friend-card__btn--primary"
                    onClick={() => handleAcceptRequest(reconnection_queries.id)}
                  >
                    <CheckIcon style={{ fontSize: 16 }} /> Accept
                  </button>
                  <button
                    className="friend-card__btn friend-card__btn--ghost"
                    onClick={() => handleDeclineRequest(reconnection_queries.id)}
                  >
                    <CloseIcon style={{ fontSize: 16 }} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <CheckIcon style={{ fontSize: 16 }} />
          {toast}
        </div>
      )}
    </div>
  )
}
