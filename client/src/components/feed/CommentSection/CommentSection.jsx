import { useState } from 'react'
import Avatar from '../../common/Avatar/Avatar'
import './CommentSection.css'

export default function CommentSection({ comments, currentUser, onAddComment, onAddReply }) {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  function handleAddComment() {
    if (!newComment.trim()) return
    onAddComment(newComment.trim())
    setNewComment('')
  }

  function handleCommentKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddComment()
    }
  }

  function handleAddReply(commentId) {
    if (!replyText.trim()) return
    onAddReply(commentId, replyText.trim())
    setReplyText('')
    setReplyingTo(null)
  }

  function handleReplyKeyDown(e, commentId) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddReply(commentId)
    }
  }

  function toggleReply(commentId) {
    setReplyingTo(replyingTo === commentId ? null : commentId)
    setReplyText('')
  }

  return (
    <div className="comment-section">

      <div className="comment-section__compose">
        <Avatar src={currentUser.avatarSrc} alt={currentUser.name} size="sm" />
        <div className="comment-section__input-wrap">
          <textarea
            className="comment-section__input"
            placeholder="Write a comment…"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={handleCommentKeyDown}
            rows={1}
          />
          {newComment.trim() && (
            <button className="comment-section__submit" onClick={handleAddComment}>
              Post
            </button>
          )}
        </div>
      </div>

      <div className="comment-section__list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-section__item">

            <div className="comment-section__row">
              <Avatar src={comment.author.avatarSrc} alt={comment.author.name} size="sm" />
              <div className="comment-section__bubble">
                <div className="comment-section__bubble-header">
                  <span className="comment-section__author">{comment.author.name}</span>
                  <span className="comment-section__handle">{comment.author.handle}</span>
                  <span className="comment-section__time">{comment.timeAgo}</span>
                </div>
                <p className="comment-section__text">{comment.text}</p>
              </div>
            </div>

            <button
              className="comment-section__reply-btn"
              onClick={() => toggleReply(comment.id)}
            >
              Reply
            </button>

            {comment.replies.length > 0 && (
              <div className="comment-section__replies">
                {comment.replies.map(reply => (
                  <div key={reply.id} className="comment-section__row">
                    <Avatar src={reply.author.avatarSrc} alt={reply.author.name} size="sm" />
                    <div className="comment-section__bubble comment-section__bubble--reply">
                      <div className="comment-section__bubble-header">
                        <span className="comment-section__author">{reply.author.name}</span>
                        <span className="comment-section__handle">{reply.author.handle}</span>
                        <span className="comment-section__time">{reply.timeAgo}</span>
                      </div>
                      <p className="comment-section__text comment-section__text--reply">{reply.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {replyingTo === comment.id && (
              <div className="comment-section__replies comment-section__compose">
                <Avatar src={currentUser.avatarSrc} alt={currentUser.name} size="sm" />
                <div className="comment-section__input-wrap">
                  <textarea
                    className="comment-section__input"
                    placeholder={`Reply to ${comment.author.name}…`}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => handleReplyKeyDown(e, comment.id)}
                    rows={1}
                    autoFocus
                  />
                  {replyText.trim() && (
                    <button className="comment-section__submit" onClick={() => handleAddReply(comment.id)}>
                      Reply
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  )
}
