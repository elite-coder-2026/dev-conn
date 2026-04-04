import { useState, useEffect } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsIcon from '@mui/icons-material/Notifications'
import Avatar from '../../common/Avatar/Avatar'
import IconButton from '../../common/IconButton/IconButton'
import NotificationsDropdown from '../../common/NotificationsDropdown/NotificationsDropdown'
import './AppHeader.css'

const NAV_LINKS = [
  { label: 'Feed',      id: 'feed'     },
  { label: 'Messages',  id: 'messages' },
  { label: 'Friends',   id: 'friends'  },
  { label: 'Discover',  id: 'discover' },
  { label: 'Activity',  id: 'activity' },
  { label: 'Videos',    id: 'videos'   },
  { label: 'Editor',    id: 'editor'   },
]

export default function AppHeader({ activeNav, setActiveNav, onSearch, currentUser = {} }) {
  const [search, setSearch]               = useState('')
  const [notifOpen, setNotifOpen]         = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    fetch('/api/notifications', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setNotifications(data))
      .catch(() => {})
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  function handleToggleNotif() {
    setNotifOpen(prev => !prev)
  }

  function handleMarkAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    fetch('/api/notifications/read-all', { method: 'PATCH', credentials: 'include' })
      .catch(() => {})
  }

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">devconn</div>

        <nav className="app-header__nav" aria-label="Main navigation">
          {NAV_LINKS.map(link => (
            <button
              key={link.id}
              className={`nav-link${activeNav === link.id ? ' nav-link--active' : ''}`}
              onClick={() => setActiveNav(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="app-header__search">
          <div className="search-bar">
            <button className="search-bar__icon-btn" onClick={() => search.trim() && onSearch(search.trim())} aria-label="Submit search">
              <SearchIcon />
            </button>
            <input
              type="text"
              placeholder="Search devconn"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && search.trim()) onSearch(search.trim()) }}
              aria-label="Search"
            />
          </div>
        </div>

        <div className="app-header__actions">
          <div className="app-header__notif-wrap">
            <IconButton
              icon={<NotificationsIcon />}
              label="Notifications"
              badge={unreadCount}
              onClick={handleToggleNotif}
              active={notifOpen}
            />
            {notifOpen && (
              <NotificationsDropdown
                notifications={notifications}
                onClose={() => setNotifOpen(false)}
                onMarkAllRead={handleMarkAllRead}
              />
            )}
          </div>
          <button className="app-header__avatar-btn" aria-label="Profile" onClick={() => setActiveNav('profile')}>
            <Avatar src={currentUser.avatar_url} alt={currentUser.name || ''} size="sm" />
          </button>
        </div>
      </div>
    </header>
  )
}
