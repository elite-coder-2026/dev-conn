import { useState } from 'react'
import ProfileCard from '../ProfileCard/ProfileCard'
import ActivityGraph from '../ActivityGraph/ActivityGraph'
import ComponentList from '../ComponentList/ComponentList'
import VideoList from '../VideoList/VideoList'
import FriendsList from '../FriendsList/FriendsList'
import ChatTray from '../../chat/ChatTray/ChatTray'
import mockUser from '../../../data/mockUser'
import mockComponents from '../../../data/mockComponents'
import mockVideos from '../../../data/mockVideos'
import mockContacts from '../../../data/mockContacts'
import './ProfilePage.css'

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

let msgIdCounter = 1

export default function ProfilePage() {
  const [chats, setChats] = useState([])

  function handleOpenChat(contactId) {
    setChats(prev => {
      const existing = prev.find(c => c.contactId === contactId)
      if (existing) {
        return prev.map(c =>
          c.contactId === contactId
            ? { ...c, minimized: false, unreadCount: 0 }
            : c
        )
      }
      const newChat = {
        contactId,
        minimized: false,
        messages: [],
        isTyping: false,
        unreadCount: 0,
        closing: false,
      }
      const updated = [...prev, newChat]
      if (updated.length > 3) updated.shift()
      return updated
    })
  }

  function handleMinimize(contactId) {
    setChats(prev =>
      prev.map(c =>
        c.contactId === contactId
          ? { ...c, minimized: !c.minimized, unreadCount: c.minimized ? 0 : c.unreadCount }
          : c
      )
    )
  }

  function handleClose(contactId) {
    setChats(prev =>
      prev.map(c => c.contactId === contactId ? { ...c, closing: true } : c)
    )
  }

  function handleRemove(contactId) {
    setChats(prev => prev.filter(c => c.contactId !== contactId))
  }

  function handleSendMessage(contactId, text) {
    const userMsgId = msgIdCounter++
    setChats(prev =>
      prev.map(c =>
        c.contactId === contactId
          ? { ...c, messages: [...c.messages, { id: userMsgId, text, fromMe: true }] }
          : c
      )
    )

    const delay1 = 1000 + Math.random() * 1000
    const delay2 = 600 + Math.random() * 400

    setTimeout(() => {
      setChats(prev =>
        prev.map(c => c.contactId === contactId ? { ...c, isTyping: true } : c)
      )

      setTimeout(() => {
        const replyText = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)]
        const replyId = msgIdCounter++
        setChats(prev =>
          prev.map(c => {
            if (c.contactId !== contactId) return c
            return {
              ...c,
              isTyping: false,
              messages: [...c.messages, { id: replyId, text: replyText, fromMe: false }],
              unreadCount: c.minimized ? c.unreadCount + 1 : 0,
            }
          })
        )
      }, delay2)
    }, delay1)
  }

  return (
    <main className="profile-page">
      <div className="profile-page__inner">
        <div className="profile-page__main">
          <ProfileCard user={mockUser} />
          <div className="profile-page__activity">
            <ActivityGraph />
          </div>
          <ComponentList components={mockComponents} />
          <VideoList videos={mockVideos} />
        </div>
        <aside className="profile-page__sidebar">
          <FriendsList contacts={mockContacts} onMessage={handleOpenChat} />
        </aside>
      </div>

      <ChatTray
        chats={chats}
        contacts={mockContacts}
        onMinimize={handleMinimize}
        onClose={handleClose}
        onRemove={handleRemove}
        onSendMessage={handleSendMessage}
      />
    </main>
  )
}
