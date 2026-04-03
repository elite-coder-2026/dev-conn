import { useState, useEffect } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import Avatar from '../../common/Avatar/Avatar'
import './ShareModal.css'

export default function ShareModal({ post, onClose, onShare }) {
  const [description, setDescription] = useState('')
  const { author, timeAgo, content } = post

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleShare() {
    onShare(description)
  }

  return (
    <div className="share-modal-overlay" onClick={handleOverlayClick}>
      <div className="share-modal" role="dialog" aria-modal="true" aria-label="Share post">
        <div className="share-modal__header">
          <span className="share-modal__title">Share Post</span>
          <button className="share-modal__close" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="share-modal__post-meta">
          <Avatar src={author.avatarSrc} alt={author.name} size="md" />
          <div className="share-modal__post-author">
            <p className="share-modal__author-name">{author.name}</p>
            <p className="share-modal__author-sub">
              {author.handle} · {timeAgo}
            </p>
          </div>
        </div>

        {content && <p className="share-modal__post-content">{content}</p>}

        <textarea
          className="share-modal__textarea"
          placeholder="Say something about this…"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
        />

        <div className="share-modal__actions">
          <button className="share-modal__btn share-modal__btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="share-modal__btn share-modal__btn--primary" onClick={handleShare}>
            Share
          </button>
        </div>
      </div>
    </div>
  )
}
