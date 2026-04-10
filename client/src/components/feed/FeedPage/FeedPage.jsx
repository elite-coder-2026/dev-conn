import { useState, useEffect } from 'react'
import LeftSidebar from '../LeftSidebar/LeftSidebar'
import PostComposer from '../PostComposer/PostComposer'
import PostFeed from '../PostFeed/PostFeed'
import ContactSidebar from '../ContactSidebar/ContactSidebar'
import ChatTray from '../../chat/ChatTray/ChatTray'
import './FeedPage.css'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function normalisePost(row) {
  let type = row.image_url ? 'image' : 'text'
  let content = row.content
  let code
  let videoTitle
  let videoMeta
  let videoSrc

  if (content.startsWith('Component:')) {
    const codeMatch = content.match(/```html\n([\s\S]*?)```/)
    if (codeMatch) {
      type = 'component'
      code = codeMatch[1].trim()
      content = content.replace(/\n*```html\n[\s\S]*?```/, '').trim()
    }
  } else {
    const videoMatch = content.match(/(?:\n\n|^)Video: (.+)\n::video-meta:: (.+?)(?:\n::video-src:: (.+))?$/)
    if (videoMatch) {
      type = 'video'
      videoTitle = videoMatch[1].trim()
      videoMeta = videoMatch[2].trim()
      videoSrc = videoMatch[3] ? videoMatch[3].trim() : undefined
      content = content.replace(/(?:\n\n)?Video: .+\n::video-meta:: .+(?:\n::video-src:: .+)?/, '').trim()
    }
  }

  return {
    id: row.id,
    type,
    author: {
      name: row.author_name,
      handle: row.author_handle,
      avatarSrc: row.author_avatar_url,
    },
    timeAgo: timeAgo(row.created_at),
    content,
    code,
    videoTitle,
    videoMeta,
    videoSrc,
    imageUrl: row.image_url || undefined,
    likes: row.likes_count,
    comments: row.comments_count,
    shares: row.shares_count,
    likedByMe: row.liked_by_me,
    sharedByMe: row.shared_by_me,
  }
}

let msgIdCounter = 1

export default function FeedPage({ currentUser = {} }) {
  const [posts, setPosts]       = useState([])
  const [chats, setChats]       = useState([])
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    fetch('/api/connections/friends', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { friends: [] })
      .then(data => setContacts((data.friends || []).map(f => ({ ...f, avatarSrc: f.avatarUrl, online: f.isOnline }))))
  }, [])

  useEffect(() => {
    fetch('/api/feed/', { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => setPosts(data.posts.map(normalisePost)))
      .catch(err => console.error('Feed fetch failed:', err))
  }, [])

  function handleAddPost(post) {
    setPosts(prev => [post, ...prev])
  }

  function handleSharePost(post) {
    setPosts(prev => prev.find(p => p.id === post.id) ? prev : [post, ...prev])
  }

  function handleDeletePost(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

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
    <main className="feed-page">
      <div className="feed-page__inner">
        <aside className="feed-page__left" aria-label="Profile and shortcuts">
          <LeftSidebar currentUser={currentUser} />
        </aside>

        <section className="feed-page__center">
          <PostComposer user={currentUser} onPost={handleAddPost} />
          <PostFeed posts={posts} onDelete={handleDeletePost} onShare={handleSharePost} currentUser={currentUser} />
        </section>

        <aside className="feed-page__right" aria-label="Contacts">
          <ContactSidebar contacts={contacts} onMessage={handleOpenChat} />
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
