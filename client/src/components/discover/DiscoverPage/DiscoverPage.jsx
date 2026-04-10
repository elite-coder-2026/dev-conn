import { useState, useEffect } from 'react'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CheckIcon from '@mui/icons-material/Check'
import Avatar from '../../common/Avatar/Avatar'
import './DiscoverPage.css'

function mapUser(u) {
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
    followersCount: u.followersCount,
    status,
    requestId: conn.requestId || null,
  }
}

export default function DiscoverPage() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('/api/connections/discover', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { users: [] })
      .then(data => setUsers((data.users || []).map(mapUser)))
  }, [])

  async function handleAddFriend(userId) {
    const res = await fetch('/api/connections/requests', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_id: userId }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'pending_sent', requestId: data.id } : u))
    }
  }

  return (
    <div className="discover-page">
      <div className="discover-page__inner">

        <div className="discover-page__header">
          <h1 className="discover-page__title">Discover</h1>
        </div>

        <section className="discover-page__section">
          <h2 className="discover-page__section-heading">People You May Know</h2>

          <div className="friends-page__grid">
            {users.map(person => (
              <div key={person.id} className="friend-card">
                <div className="friend-card__avatar">
                  <Avatar src={person.avatarSrc} alt={person.name} size="lg" online={person.online} />
                </div>
                <p className="friend-card__name">{person.name}</p>
                <p className="friend-card__handle">{person.handle}</p>

                <div className="friend-card__actions">
                  {person.status === 'friends' ? (
                    <button className="friend-card__btn friend-card__btn--sent" disabled>
                      <CheckIcon style={{ fontSize: 16 }} /> Friends
                    </button>
                  ) : person.status === 'pending_sent' ? (
                    <button className="friend-card__btn friend-card__btn--sent" disabled>
                      <CheckIcon style={{ fontSize: 16 }} /> Requested
                    </button>
                  ) : (
                    <button
                      className="friend-card__btn friend-card__btn--primary"
                      onClick={() => handleAddFriend(person.id)}
                    >
                      <PersonAddIcon style={{ fontSize: 16 }} /> Add Friend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
