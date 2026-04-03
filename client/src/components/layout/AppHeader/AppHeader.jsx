import { useState, useEffect } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsIcon from '@mui/icons-material/Notifications'
import Avatar from '../../common/Avatar/Avatar'
import IconButton from '../../common/IconButton/IconButton'
import NotificationsDropdown from '../../common/NotificationsDropdown/NotificationsDropdown'
import mockUser from '../../../data/mockUser'
import './AppHeader.css'

const NAV_LINKS = [
  { label: 'Feed',     id: 'feed'     },
  { label: 'Messages', id: 'messages' },
  { label: 'Friends',  id: 'friends'  },
  { label: 'Discover', id: 'discover' },
  { label: 'Activity', id: 'activity' },
  { label: 'Videos',   id: 'videos'   },
]

export default function AppHeader({ activeNav, setActiveNav }) {
  const [search, setSearch]               = useState('')
  const [notifOpen, setNotifOpen]         = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    fetch(`http://localhost:3001/api/notifications?userId=${mockUser.id}`)
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
    fetch(`http://localhost:3001/api/notifications/read-all?userId=${mockUser.id}`, { method: 'PATCH' })
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
            <SearchIcon />
            <input
              type="text"
              placeholder="Search devconn"
              value={search}
              onChange={e => setSearch(e.target.value)}
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
            <Avatar src={mockUser.avatarSrc} alt={mockUser.name} size="sm" />
          </button>
        </div>
      </div>
    </header>
  )
}
