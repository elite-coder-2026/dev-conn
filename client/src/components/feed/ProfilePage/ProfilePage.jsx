import { useState, useEffect } from 'react'
import ProfileCard from '../ProfileCard/ProfileCard'
import ActivityGraph from '../ActivityGraph/ActivityGraph'
import ComponentList from '../ComponentList/ComponentList'
import VideoList from '../VideoList/VideoList'
import FriendsList from '../FriendsList/FriendsList'
import ChatTray from '../../chat/ChatTray/ChatTray'
import './ProfilePage.css'

export default function ProfilePage({ currentUser }) {
  const [chats, setChats]       = useState([])
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    fetch('/api/connections/friends', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { friends: [] })
      .then(data => setContacts((data.friends || []).map(f => ({ ...f, avatarSrc: f.avatarUrl, online: f.isOnline }))))
  }, [])

  async function handleOpenChat(contactId) {
    const existing = chats.find(c => c.contactId === contactId)
    if (existing) {
      setChats(prev => prev.map(c => c.contactId === contactId ? { ...c, minimized: false, unreadCount: 0 } : c))
      return
    }
    const res = await fetch('/api/dm/conversations', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_user_id: contactId }),
    })
    const convo = res.ok ? await res.json() : {}
    const msgsRes = await fetch(`/api/dm/conversations/${convo.id}/messages`, { credentials: 'include' })
    const msgsData = msgsRes.ok ? await msgsRes.json() : { messages: [] }
    const newChat = {
      contactId,
      conversationId: convo.id,
      minimized: false,
      messages: (msgsData.messages || []).slice().reverse().map(m => ({ id: m.id, text: m.body, fromMe: m.sender_id === currentUser.id })),
      unreadCount: 0,
      closing: false,
    }
    setChats(prev => {
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

  async function handleSendMessage(contactId, text) {
    const chat = chats.find(c => c.contactId === contactId)
    if (!chat?.conversationId) return
    const res = await fetch(`/api/dm/conversations/${chat.conversationId}/messages`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text }),
    })
    if (res.ok) {
      const msg = await res.json()
      setChats(prev => prev.map(c =>
        c.contactId === contactId ? { ...c, messages: [...c.messages, { id: msg.id, text: msg.body, fromMe: true }] } : c
      ))
    }
  }

  return (
    <main className="profile-page">
      <div className="profile-page__inner">
        <div className="profile-page__main">
          <ProfileCard user={currentUser} />
          <div className="profile-page__activity">
            <ActivityGraph />
          </div>
          <ComponentList components={[]} />
          <VideoList videos={[]} />
        </div>
        <aside className="profile-page__sidebar">
          <FriendsList contacts={contacts} onMessage={handleOpenChat} />
        </aside>
      </div>

      <ChatTray
        chats={chats}
        contacts={contacts}
        onMinimize={handleMinimize}
        onClose={handleClose}
        onRemove={handleRemove}
        onSendMessage={handleSendMessage}
      />
    </main>
  )
}
