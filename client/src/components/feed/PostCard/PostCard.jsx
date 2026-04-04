import { useState, useEffect, useRef } from 'react'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import ShareIcon from '@mui/icons-material/Share'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import LinkIcon from '@mui/icons-material/Link'
import Avatar from '../../common/Avatar/Avatar'
import ShareModal from '../ShareModal/ShareModal'
import CommentSection from '../CommentSection/CommentSection'
import './PostCard.css'

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function PostMedia({ post }) {
  const { type, imageUrl, videoUrl, link, code } = post

  if (type === 'image' && imageUrl) {
    return <img className="post-card__image" src={imageUrl} alt="Post attachment" />
  }

  if (type === 'video' && videoUrl) {
    return (
      <div className="post-card__video-wrap">
        <iframe
          className="post-card__video"
          src={videoUrl}
          title="Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (type === 'link' && link) {
    return (
      <a className="post-card__link-preview" href={link.url} target="_blank" rel="noopener noreferrer">
        {link.image && (
          <img className="post-card__link-image" src={link.image} alt="" />
        )}
        <div className="post-card__link-info">
          <span className="post-card__link-domain">
            <LinkIcon style={{ fontSize: 12 }} /> {link.domain}
          </span>
          <p className="post-card__link-title">{link.title}</p>
          <p className="post-card__link-desc">{link.description}</p>
        </div>
      </a>
    )
  }

  if (type === 'component' && code) {
    return (
      <iframe
        className="post-card__component-frame"
        srcDoc={code}
        sandbox="allow-scripts"
        title="Component preview"
      />
    )
  }

  return null
}

export default function PostCard({ post, onDelete, onUpdate, currentUser = {} }) {
  const { author, timeAgo, likes, comments, shares } = post
  const [content, setContent] = useState(post.content)
  const [shareOpen, setShareOpen] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentsList, setCommentsList] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(post.content)
  const menuRef = useRef(null)
  const isOwner = currentUser.handle && author.handle === currentUser.handle

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleDelete() {
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok) onDelete(post.id)
    setMenuOpen(false)
  }

  function handleEditOpen() {
    setEditText(content)
    setEditing(true)
    setMenuOpen(false)
  }

  async function handleEditSave() {
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: editText.trim() }),
    })
    if (res.ok) {
      setContent(editText.trim())
      setEditing(false)
    }
  }

  function handleShare(description) {
    setShareOpen(false)
  }

  function handleAddComment(text) {
    const newComment = {
      id: `c-${Date.now()}`,
      author: { name: currentUser.name, handle: currentUser.handle, avatarSrc: currentUser.avatar_url },
      timeAgo: 'Just now',
      text,
      replies: [],
    }
    setCommentsList(prev => [newComment, ...prev])
  }

  function handleAddReply(commentId, text) {
    const newReply = {
      id: `r-${Date.now()}`,
      author: { name: currentUser.name, handle: currentUser.handle, avatarSrc: currentUser.avatar_url },
      timeAgo: 'Just now',
      text,
    }
    setCommentsList(prev =>
      prev.map(c => c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c)
    )
  }

  return (
    <article className="post-card">
      <div className="post-card__header">
        <Avatar src={author.avatarSrc} alt={author.name} size="md" />
        <div className="post-card__author">
          <p className="post-card__name">{author.name}</p>
          <p className="post-card__meta">
            <span>{author.handle}</span>
            <span className="post-card__meta-sep">·</span>
            <span>{timeAgo}</span>
          </p>
        </div>
        <div className="post-card__kebab-wrap" ref={menuRef}>
          <button className="post-card__kebab" aria-label="More options" onClick={() => setMenuOpen(o => !o)}>
            <MoreHorizIcon />
          </button>
          {menuOpen && (
            <div className="post-card__menu">
              {isOwner && (
                <button className="post-card__menu-item" onClick={handleEditOpen}>
                  Edit post
                </button>
              )}
              {isOwner && (
                <button className="post-card__menu-item post-card__menu-item--danger" onClick={handleDelete}>
                  Delete post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="post-card__body">
        {editing ? (
          <div className="post-card__edit">
            <textarea
              className="post-card__edit-textarea"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={4}
              autoFocus
            />
            <div className="post-card__edit-actions">
              <button className="post-card__edit-cancel" onClick={() => setEditing(false)}>Cancel</button>
              <button className="post-card__edit-save" onClick={handleEditSave} disabled={!editText.trim()}>Save</button>
            </div>
          </div>
        ) : (
          <>
            {content && <p className="post-card__content">{content}</p>}
            <PostMedia post={post} />
          </>
        )}
      </div>

      <div className="post-card__actions">
        <button className="post-card__action-btn" aria-label={`${likes} likes`}>
          <ThumbUpOutlinedIcon />
          {formatCount(likes)}
        </button>
        <button className="post-card__action-btn" aria-label={`${comments} comments`} onClick={() => setCommentsOpen(o => !o)}>
          <ChatBubbleOutlineIcon />
          {formatCount(comments)}
        </button>
        <button className="post-card__action-btn" aria-label={`${shares} shares`} onClick={() => setShareOpen(true)}>
          <ShareIcon />
          {formatCount(shares)}
        </button>
      </div>

      {commentsOpen && (
        <CommentSection
          comments={commentsList}
          currentUser={{ name: currentUser.name, handle: currentUser.handle, avatarSrc: currentUser.avatar_url }}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
        />
      )}

      {shareOpen && (
        <ShareModal post={post} onClose={() => setShareOpen(false)} onShare={handleShare} />
      )}
    </article>
  )
}
