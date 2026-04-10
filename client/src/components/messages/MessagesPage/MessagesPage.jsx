import { useState, useEffect } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import SendIcon from '@mui/icons-material/Send'
import Avatar from '../../common/Avatar/Avatar'
import './MessagesPage.css'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function MessagesPage({ currentUser }) {
  const [inbox, setInbox]           = useState([])
  const [activeId, setActiveId]     = useState(null)
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [search, setSearch]         = useState('')

  useEffect(() => {
    fetch('/api/dm/inbox', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setInbox(data)
        if (data.length) setActiveId(data[0].conversation_id)
      })
  }, [])

  useEffect(() => {
    if (!activeId) return
    fetch(`/api/dm/conversations/${activeId}/messages`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : { messages: [] })
      .then(data => setMessages((data.messages || []).slice().reverse()))
  }, [activeId])

  const activeThread = inbox.find(c => c.conversation_id === activeId)

  function handleSelect(conversationId) {
    setActiveId(conversationId)
    setInbox(prev => prev.map(c => c.conversation_id === conversationId ? { ...c, unread_count: 0 } : c))
  }

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || !activeId) return
    setInput('')
    const res = await fetch(`/api/dm/conversations/${activeId}/messages`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text }),
    })
    if (res.ok) {
      const msg = await res.json()
      setMessages(prev => [...prev, msg])
    }
  }

  const filtered = inbox.filter(c =>
    !search || c.other_user_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="messages-page">
      <aside className="messages-page__sidebar">
        <div className="messages-page__sidebar-header">
          <h2 className="messages-page__title">Messages</h2>
          <div className="messages-page__search">
            <SearchIcon style={{ fontSize: 16 }} />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="messages-page__convo-list">
          {filtered.length === 0 && (
            <p style={{ padding: '16px', color: 'var(--color-text-muted)', fontSize: 14 }}>No conversations yet.</p>
          )}
          {filtered.map(convo => (
            <button
              key={convo.conversation_id}
              className={`messages-page__convo-row${activeId === convo.conversation_id ? ' messages-page__convo-row--active' : ''}`}
              onClick={() => handleSelect(convo.conversation_id)}
            >
              <div className="messages-page__convo-avatar">
                <Avatar src={convo.other_user_avatar_url} alt={convo.other_user_name} size="md" online={convo.other_user_is_online} />
              </div>
              <div className="messages-page__convo-info">
                <div className="messages-page__convo-top">
                  <span className="messages-page__convo-name">{convo.other_user_name}</span>
                  <span className="messages-page__convo-time">{timeAgo(convo.last_message_at)}</span>
                </div>
                <div className="messages-page__convo-bottom">
                  <span className="messages-page__convo-preview">
                    {convo.last_message_sender_id === currentUser?.id ? 'You: ' : ''}{convo.last_message_body || ''}
                  </span>
                  {convo.unread_count > 0 && (
                    <span className="messages-page__convo-badge">{convo.unread_count}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="messages-page__thread">
        {activeThread ? (
          <>
            <div className="messages-page__thread-header">
              <Avatar src={activeThread.other_user_avatar_url} alt={activeThread.other_user_name} size="sm" online={activeThread.other_user_is_online} />
              <div>
                <p className="messages-page__thread-name">{activeThread.other_user_name}</p>
                <p className="messages-page__thread-status">{activeThread.other_user_is_online ? 'Active now' : 'Offline'}</p>
              </div>
            </div>

            <div className="messages-page__messages">
              {messages.map(msg => {
                const fromMe = msg.sender_id === currentUser?.id
                return (
                  <div key={msg.id} className={`messages-page__bubble-wrap ${fromMe ? 'messages-page__bubble-wrap--me' : ''}`}>
                    {!fromMe && <Avatar src={activeThread.other_user_avatar_url} alt={activeThread.other_user_name} size="sm" />}
                    <div className={`messages-page__bubble ${fromMe ? 'messages-page__bubble--me' : 'messages-page__bubble--them'}`}>
                      {msg.body}
                    </div>
                    {fromMe && <Avatar src={currentUser?.avatarSrc} alt={currentUser?.name} size="sm" />}
                  </div>
                )
              })}
            </div>

            <form className="messages-page__input-row" onSubmit={handleSend}>
              <input
                className="messages-page__input"
                type="text"
                placeholder={`Message ${activeThread.other_user_name.split(' ')[0]}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button className="messages-page__send-btn" type="submit" aria-label="Send" disabled={!input.trim()}>
                <SendIcon fontSize="small" />
              </button>
            </form>
          </>
        ) : (
          <p style={{ margin: 'auto', color: 'var(--color-text-muted)', fontSize: 14 }}>Select a conversation.</p>
        )}
      </main>
    </div>
  )
}
