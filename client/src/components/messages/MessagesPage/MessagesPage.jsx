import { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import SendIcon from '@mui/icons-material/Send'
import Avatar from '../../common/Avatar/Avatar'
import mockContacts from '../../../data/mockContacts'
import mockUser from '../../../data/mockUser'
import './MessagesPage.css'

const MOCK_CONVERSATIONS = [
  {
    contactId: 'c1',
    unread: 2,
    messages: [
      { id: 1, text: 'Hey! Did you see the new React release?',       fromMe: false, timeAgo: '2d ago' },
      { id: 2, text: 'Yeah, the compiler stuff looks wild.',           fromMe: true,  timeAgo: '2d ago' },
      { id: 3, text: 'Right?? I\'ve been playing with it all weekend.', fromMe: false, timeAgo: '1d ago' },
      { id: 4, text: 'Same. The auto-memoization is a game changer.',  fromMe: true,  timeAgo: '1d ago' },
      { id: 5, text: 'We should pair on migrating our app over.',      fromMe: false, timeAgo: '10m ago' },
      { id: 6, text: 'Let\'s do it! Free Thursday?',                   fromMe: false, timeAgo: '5m ago' },
    ],
  },
  {
    contactId: 'c2',
    unread: 0,
    messages: [
      { id: 1, text: 'Loved your post about state management!',  fromMe: false, timeAgo: '3d ago' },
      { id: 2, text: 'Thanks! Took forever to write lol.',        fromMe: true,  timeAgo: '3d ago' },
      { id: 3, text: 'Do you use Zustand or Redux these days?',  fromMe: false, timeAgo: '3d ago' },
      { id: 4, text: 'Zustand all the way. So much less boilerplate.', fromMe: true, timeAgo: '3d ago' },
    ],
  },
  {
    contactId: 'c3',
    unread: 1,
    messages: [
      { id: 1, text: 'Can you review my PR when you get a chance?', fromMe: false, timeAgo: '6h ago' },
      { id: 2, text: 'On it 👀',                                     fromMe: true,  timeAgo: '5h ago' },
      { id: 3, text: 'Left some comments, mostly small stuff.',      fromMe: true,  timeAgo: '4h ago' },
      { id: 4, text: 'Thanks! Fixing now.',                          fromMe: false, timeAgo: '1h ago' },
    ],
  },
  {
    contactId: 'c4',
    unread: 0,
    messages: [
      { id: 1, text: 'Are you going to the meetup next week?', fromMe: false, timeAgo: '1d ago' },
      { id: 2, text: 'Wouldn\'t miss it!',                     fromMe: true,  timeAgo: '1d ago' },
    ],
  },
  {
    contactId: 'c5',
    unread: 0,
    messages: [
      { id: 1, text: 'Just pushed the new design system.',     fromMe: false, timeAgo: '2d ago' },
      { id: 2, text: 'Looks great, super clean.',              fromMe: true,  timeAgo: '2d ago' },
      { id: 3, text: 'Appreciate it! Took 3 sprints 😅',       fromMe: false, timeAgo: '2d ago' },
    ],
  },
]

let msgIdCounter = 1000

export default function MessagesPage() {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS)
  const [activeId, setActiveId] = useState(MOCK_CONVERSATIONS[0].contactId)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')

  const activeConvo = conversations.find(c => c.contactId === activeId)
  const activeContact = mockContacts.find(c => c.id === activeId)

  function handleSelect(contactId) {
    setActiveId(contactId)
    setConversations(prev =>
      prev.map(c => c.contactId === contactId ? { ...c, unread: 0 } : c)
    )
  }

  function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    setConversations(prev =>
      prev.map(c =>
        c.contactId === activeId
          ? { ...c, messages: [...c.messages, { id: msgIdCounter++, text, fromMe: true, timeAgo: 'Just now' }] }
          : c
      )
    )
  }

  const filtered = conversations.filter(c => {
    if (!search) return true
    const contact = mockContacts.find(m => m.id === c.contactId)
    return contact?.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="messages-page">
      {/* Left panel */}
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
          {filtered.map(convo => {
            const contact = mockContacts.find(c => c.id === convo.contactId)
            const last = convo.messages[convo.messages.length - 1]
            return (
              <button
                key={convo.contactId}
                className={`messages-page__convo-row${activeId === convo.contactId ? ' messages-page__convo-row--active' : ''}`}
                onClick={() => handleSelect(convo.contactId)}
              >
                <div className="messages-page__convo-avatar">
                  <Avatar src={contact.avatarSrc} alt={contact.name} size="md" online={contact.online} />
                </div>
                <div className="messages-page__convo-info">
                  <div className="messages-page__convo-top">
                    <span className="messages-page__convo-name">{contact.name}</span>
                    <span className="messages-page__convo-time">{last.timeAgo}</span>
                  </div>
                  <div className="messages-page__convo-bottom">
                    <span className="messages-page__convo-preview">
                      {last.fromMe ? 'You: ' : ''}{last.text}
                    </span>
                    {convo.unread > 0 && (
                      <span className="messages-page__convo-badge">{convo.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Right panel */}
      <main className="messages-page__thread">
        {/* Thread header */}
        <div className="messages-page__thread-header">
          <Avatar src={activeContact.avatarSrc} alt={activeContact.name} size="sm" online={activeContact.online} />
          <div>
            <p className="messages-page__thread-name">{activeContact.name}</p>
            <p className="messages-page__thread-status">{activeContact.online ? 'Active now' : 'Offline'}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-page__messages">
          {activeConvo.messages.map(msg => (
            <div
              key={msg.id}
              className={`messages-page__bubble-wrap ${msg.fromMe ? 'messages-page__bubble-wrap--me' : ''}`}
            >
              {!msg.fromMe && (
                <Avatar src={activeContact.avatarSrc} alt={activeContact.name} size="sm" />
              )}
              <div className={`messages-page__bubble ${msg.fromMe ? 'messages-page__bubble--me' : 'messages-page__bubble--them'}`}>
                {msg.text}
              </div>
              {msg.fromMe && (
                <Avatar src={mockUser.avatarSrc} alt={mockUser.name} size="sm" />
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <form className="messages-page__input-row" onSubmit={handleSend}>
          <input
            className="messages-page__input"
            type="text"
            placeholder={`Message ${activeContact.name.split(' ')[0]}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            className="messages-page__send-btn"
            type="submit"
            aria-label="Send"
            disabled={!input.trim()}
          >
            <SendIcon fontSize="small" />
          </button>
        </form>
      </main>
    </div>
  )
}
