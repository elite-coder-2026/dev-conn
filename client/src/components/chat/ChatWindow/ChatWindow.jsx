import { useEffect, useRef, useState } from 'react'
import RemoveIcon from '@mui/icons-material/Remove'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import Avatar from '../../common/Avatar/Avatar'
import './ChatWindow.css'

const PALETTE = [
  '#5B4FE9', '#E94F4F', '#4F9DE9', '#4FE97B',
  '#E9A84F', '#9B4FE9', '#4FE9D9', '#E94FA8',
]

function getAccentColor(name = '') {
  const sum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return PALETTE[sum % PALETTE.length]
}

const MOCK_REPLIES = [
  "Hey! What's up? 👋",
  "That sounds great!",
  "Interesting... tell me more",
  "lol 😂 seriously?",
  "Sure, let's do it!",
  "I'm a bit busy rn, talk later?",
  "omg yes exactly!",
  "haha nice one 😄",
]

export default function ChatWindow({
  contact,
  chat,
  onMinimize,
  onClose,
  onAnimationEnd,
  onSendMessage,
}) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const accentColor = getAccentColor(contact.name)

  useEffect(() => {
    if (!chat.minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chat.messages, chat.isTyping, chat.minimized])

  function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    onSendMessage(contact.id, text)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e)
    }
  }

  const windowClass = [
    'chat-window',
    chat.minimized ? 'chat-window--minimized' : '',
    chat.closing   ? 'chat-window--closing'   : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={windowClass} onAnimationEnd={chat.closing ? onAnimationEnd : undefined}>
      {/* Header */}
      <div className="chat-window__header" style={{ background: accentColor }}>
        <div className="chat-window__header-left">
          <div className="chat-window__avatar-wrap">
            <Avatar src={contact.avatarSrc} alt={contact.name} size="sm" online={contact.online} />
            {chat.minimized && chat.unreadCount > 0 && (
              <span className="chat-window__unread-badge">
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </span>
            )}
          </div>
          <div className="chat-window__header-info">
            <span className="chat-window__name">{contact.name}</span>
            <span className="chat-window__status">{contact.online ? 'Active now' : 'Offline'}</span>
          </div>
        </div>
        <div className="chat-window__header-actions">
          <button className="chat-window__ctrl-btn" aria-label="Minimize" onClick={onMinimize}>
            <RemoveIcon fontSize="small" />
          </button>
          <button className="chat-window__ctrl-btn" aria-label="Close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!chat.minimized && (
        <>
          <div className="chat-window__messages">
            {chat.messages.length === 0 && (
              <p className="chat-window__empty">Say hello to {contact.name.split(' ')[0]}!</p>
            )}
            {chat.messages.map(msg => (
              <div
                key={msg.id}
                className={`chat-window__bubble ${msg.fromMe ? 'chat-window__bubble--me' : 'chat-window__bubble--them'}`}
              >
                {msg.text}
              </div>
            ))}
            {chat.isTyping && (
              <div className="chat-window__typing">
                <span className="chat-window__dot" />
                <span className="chat-window__dot" />
                <span className="chat-window__dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-window__input-row" onSubmit={handleSend}>
            <input
              className="chat-window__input"
              type="text"
              placeholder="Aa"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              className="chat-window__send-btn"
              type="submit"
              aria-label="Send"
              disabled={!input.trim()}
              style={{ color: accentColor }}
            >
              <SendIcon fontSize="small" />
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export { MOCK_REPLIES }
