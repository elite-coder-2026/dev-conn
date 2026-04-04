import { useState, useEffect } from 'react'
import LeftSidebar from '../LeftSidebar/LeftSidebar'
import PostComposer from '../PostComposer/PostComposer'
import PostFeed from '../PostFeed/PostFeed'
import ContactSidebar from '../ContactSidebar/ContactSidebar'
import ChatTray from '../../chat/ChatTray/ChatTray'
import mockContacts from '../../../data/mockContacts'
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

  if (content.startsWith('Component:')) {
    const codeMatch = content.match(/```html\n([\s\S]*?)```/)
    if (codeMatch) {
      type = 'component'
      code = codeMatch[1].trim()
      content = content.replace(/\n*```html\n[\s\S]*?```/, '').trim()
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
    imageUrl: row.image_url || undefined,
    likes: row.likes_count,
    comments: row.comments_count,
    shares: row.shares_count,
    likedByMe: row.liked_by_me,
    sharedByMe: row.shared_by_me,
  }
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

let msgIdCounter = 1

export default function FeedPage({ currentUser = {} }) {
  const [posts, setPosts] = useState([])
  const [chats, setChats] = useState([])

  useEffect(() => {
    fetch('/api/feed/', { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => setPosts(data.posts.map(normalisePost)))
      .catch(err => console.error('Feed fetch failed:', err))
  }, [])

  function handleAddPost(post) {
    setPosts(prev => [post, ...prev])
  }

  function handleDeletePost(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

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
    <main className="feed-page">
      <div className="feed-page__inner">
        <aside className="feed-page__left" aria-label="Profile and shortcuts">
          <LeftSidebar />
        </aside>

        <section className="feed-page__center">
          <PostComposer user={currentUser} onPost={handleAddPost} />
          <PostFeed posts={posts} onDelete={handleDeletePost} currentUser={currentUser} />
        </section>

        <aside className="feed-page__right" aria-label="Contacts">
          <ContactSidebar contacts={mockContacts} onMessage={handleOpenChat} />
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
