import { useState, useEffect, useRef } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import PeopleIcon from '@mui/icons-material/People'
import Avatar from '../../common/Avatar/Avatar'
import './FriendsPage.css'

const CONNECTION_MODE = 'friends'

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function computeTimeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function mapDiscoverUser(u) {
  const conn = u.connection || {}
  let status = 'none'
  if (conn.status === 'accepted') status = 'friends'
  else if (conn.status === 'pending' && conn.initiatedBy === 'me') status = 'pending_sent'
  return {
    id: u.id,
    name: u.name,
    handle: u.handle,
    avatarSrc: u.avatarUrl,
    online: u.isOnline,
    followers: u.followersCount,
    mutuals: 0,
    bio: '',
    status,
    requestId: conn.requestId || null,
  }
}

function mapRequest(r) {
  return {
    id: r.id,
    userId: r.requester.id,
    name: r.requester.name,
    handle: r.requester.handle,
    avatarSrc: r.requester.avatarUrl,
    online: r.requester.isOnline,
    mutuals: r.mutualCount,
    timeAgo: computeTimeAgo(r.createdAt),
  }
}

function mapSuggestion(s) {
  return {
    id: s.id,
    name: s.name,
    handle: s.handle,
    avatarSrc: s.avatarUrl,
    mutuals: s.mutualCount,
  }
}

function mapFriend(f) {
  return {
    id: f.id,
    name: f.name,
    handle: f.handle,
    avatarSrc: f.avatarUrl,
    online: f.isOnline,
    status: 'friends',
  }
}

export default function FriendsPage() {
  const [users, setUsers]               = useState([])
  const [requests, setRequests]         = useState([])
  const [suggestions, setSuggestions]   = useState([])
  const [friends, setFriends]           = useState([])
  const [tab, setTab]                   = useState('discover')
  const [search, setSearch]             = useState('')
  const [toast, setToast]               = useState(null)
  const toastTimer                      = useRef(null)

  useEffect(() => {
    fetch('/api/connections/discover', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { users: [] })
      .then(data => setUsers((data.users || []).map(mapDiscoverUser)))

    fetch('/api/connections/requests/incoming', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { requests: [] })
      .then(data => setRequests((data.requests || []).map(mapRequest)))

    fetch('/api/connections/suggestions', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { suggestions: [] })
      .then(data => setSuggestions((data.suggestions || []).map(mapSuggestion)))

    fetch('/api/connections/friends', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { friends: [] })
      .then(data => setFriends((data.friends || []).map(mapFriend)))
  }, [])

  function showToast(message) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }

  async function apiCall(url, options = {}) {
    const res = await fetch(url, { credentials: 'include', ...options })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { showToast(data.error || 'Something went wrong'); return null }
    return data
  }

  // ── friends mode handlers ─────────────────────────────────────
  async function handleAddFriend(userId) {
    const user = users.find(u => u.id === userId)
    const data = await apiCall('/api/connections/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_id: userId }),
    })
    if (data) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'pending_sent', requestId: data.id } : u))
      if (user) showToast(`Friend request sent to ${user.name}`)
    }
  }

  async function handleCancelRequest(userId) {
    const user = users.find(u => u.id === userId)
    if (!user?.requestId) return
    const data = await apiCall(`/api/connections/requests/${user.requestId}`, { method: 'DELETE' })
    if (data !== null) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'none', requestId: null } : u))
    }
  }

  async function handleUnfriend(userId) {
    const friend = friends.find(f => f.id === userId)
    const data = await apiCall(`/api/connections/friends/${userId}`, { method: 'DELETE' })
    if (data !== null) {
      setFriends(prev => prev.filter(f => f.id !== userId))
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'none', requestId: null } : u))
      if (friend) showToast(`Unfriended ${friend.name}`)
    }
  }

  async function handleAcceptRequest(requestId) {
    const req = requests.find(r => r.id === requestId)
    const data = await apiCall(`/api/connections/requests/${requestId}/accept`, { method: 'POST' })
    if (data !== null) {
      setRequests(prev => prev.filter(r => r.id !== requestId))
      if (req) {
        setFriends(prev => [...prev, { id: req.userId, name: req.name, handle: req.handle, avatarSrc: req.avatarSrc, online: req.online, status: 'friends' }])
        setUsers(prev => prev.map(u => u.id === req.userId ? { ...u, status: 'friends' } : u))
        showToast(`You are now friends with ${req.name}`)
      }
    }
  }

  async function handleDeclineRequest(requestId) {
    const req = requests.find(r => r.id === requestId)
    const data = await apiCall(`/api/connections/requests/${requestId}/decline`, { method: 'POST' })
    if (data !== null) {
      setRequests(prev => prev.filter(r => r.id !== requestId))
      if (req) showToast(`Request from ${req.name} declined`)
    }
  }

  // ── follow mode handlers ──────────────────────────────────────
  function handleFollow(id) {
    const user = users.find(u => u.id === id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'following' } : u))
    if (user) showToast(`Now following ${user.name}`)
  }

  function handleUnfollow(id) {
    const user = users.find(u => u.id === id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'none' } : u))
    if (user) showToast(`Unfollowed ${user.name}`)
  }

  function handleDismissSuggestion(id) {
    setSuggestions(prev => prev.filter(s => s.id !== id))
  }

  async function handleSuggestionAdd(s) {
    const data = await apiCall('/api/connections/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_id: s.id }),
    })
    if (data) showToast(`Friend request sent to ${s.name}`)
    handleDismissSuggestion(s.id)
  }

  // ── derived ───────────────────────────────────────────────────
  const filteredConnections = friends.filter(u =>
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
                        onClick={() => handleSuggestionAdd(s)}
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
              <div key={req.id} className="request-row">
                <Avatar src={req.avatarSrc} alt={req.name} size="md" />
                <div className="request-row__info">
                  <p className="request-row__name">{req.name}</p>
                  <p className="request-row__meta">{req.mutuals} mutual friends · {req.timeAgo}</p>
                </div>
                <div className="request-row__actions">
                  <button
                    className="friend-card__btn friend-card__btn--primary"
                    onClick={() => handleAcceptRequest(req.id)}
                  >
                    <CheckIcon style={{ fontSize: 16 }} /> Accept
                  </button>
                  <button
                    className="friend-card__btn friend-card__btn--ghost"
                    onClick={() => handleDeclineRequest(req.id)}
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
