import { useEffect, useRef } from 'react'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import ShareIcon from '@mui/icons-material/Share'
import Avatar from '../Avatar/Avatar'
import './NotificationsDropdown.css'

const TYPE_META = {
  like:           { Icon: ThumbUpIcon,          color: '#5B4FE9' },
  comment:        { Icon: ChatBubbleIcon,        color: '#4F9DE9' },
  friend_request: { Icon: PersonAddIcon,         color: '#4FE97B' },
  mention:        { Icon: AlternateEmailIcon,    color: '#E9A84F' },
  share:          { Icon: ShareIcon,             color: '#E94FA8' },
}

export default function NotificationsDropdown({ notifications, onClose, onMarkAllRead }) {
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="notif-dropdown" ref={ref}>
      <div className="notif-dropdown__header">
        <span className="notif-dropdown__title">Notifications</span>
        {unreadCount > 0 && (
          <button className="notif-dropdown__mark-all" onClick={onMarkAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notif-dropdown__list">
        {notifications.length === 0 && (
          <p className="notif-dropdown__empty">You're all caught up!</p>
        )}
        {notifications.map(notif => {
          const meta = TYPE_META[notif.type] || TYPE_META.like
          const { Icon } = meta
          return (
            <div
              key={notif.id}
              className={`notif-row${notif.read ? '' : ' notif-row--unread'}`}
            >
              <div className="notif-row__avatar-wrap">
                <Avatar src={notif.avatarSrc} alt={notif.name} size="md" />
                <span className="notif-row__type-icon" style={{ background: meta.color }}>
                  <Icon style={{ fontSize: 10, color: '#fff' }} />
                </span>
              </div>
              <div className="notif-row__body">
                <p className="notif-row__text">
                  <strong>{notif.name}</strong> {notif.message}
                </p>
                <p className="notif-row__time">{notif.timeAgo}</p>
              </div>
              {!notif.read && <span className="notif-row__dot" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
