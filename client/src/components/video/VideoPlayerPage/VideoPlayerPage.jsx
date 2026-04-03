import { useState, useRef, useEffect, useCallback } from 'react'
import './VideoPlayerPage.css'

const MOCK_COMMENTS = [
  {
    id: 'c1',
    username: 'Nadia Osei',
    initials: 'NO',
    color: '#E040FB',
    timeAgo: '2 days ago',
    text: 'The section on token aliasing at 14:32 finally made it click for me. Been struggling with this for months — thank you.',
    likes: 847,
  },
  {
    id: 'c2',
    username: 'Riku Mäkinen',
    initials: 'RM',
    color: '#00BFA5',
    timeAgo: '3 days ago',
    text: 'Watched this twice back-to-back. The way you break down semantic vs. literal tokens is better than any blog post I\'ve read on the subject.',
    likes: 413,
  },
  {
    id: 'c3',
    username: 'Theo Callahan',
    initials: 'TC',
    color: '#FF6D00',
    timeAgo: '5 days ago',
    text: 'Just migrated our entire component library using this approach. Took a weekend but the result is clean. Highly recommend pausing at 22:10.',
    likes: 289,
  },
  {
    id: 'c4',
    username: 'Yara Lindström',
    initials: 'YL',
    color: '#00C8FF',
    timeAgo: '1 week ago',
    text: 'I appreciate that you showed the messy intermediate state — most tutorials skip that and it\'s always where I get lost.',
    likes: 172,
  },
  {
    id: 'c5',
    username: 'Dev Singh',
    initials: 'DS',
    color: '#FFD600',
    timeAgo: '2 weeks ago',
    text: 'Would love a follow-up on theming multiple brands from a single token set. That\'s the real challenge we\'re facing right now.',
    likes: 98,
  },
]

const MOCK_RELATED = [
  {
    id: 'r1',
    title: 'CSS Grid Mastery: From Basics to Complex Layouts',
    channel: 'Alex Rivera',
    views: '218K views',
    duration: '28:14',
    thumbColor: '#1a2744',
  },
  {
    id: 'r2',
    title: 'React Performance: Profiling and Fixing Re-renders',
    channel: 'Alex Rivera',
    views: '94K views',
    duration: '41:07',
    thumbColor: '#1a3322',
  },
  {
    id: 'r3',
    title: 'Accessible Modals, Drawers & Tooltips',
    channel: 'Alex Rivera',
    views: '67K views',
    duration: '19:55',
    thumbColor: '#2d1a44',
  },
  {
    id: 'r4',
    title: 'The Complete Guide to CSS Custom Properties',
    channel: 'Alex Rivera',
    views: '312K views',
    duration: '53:22',
    thumbColor: '#2d1a1a',
  },
  {
    id: 'r5',
    title: 'Command Palettes: UX Patterns & Implementation',
    channel: 'Alex Rivera',
    views: '41K views',
    duration: '24:38',
    thumbColor: '#1a2a2d',
  },
  {
    id: 'r6',
    title: 'Typography Systems for UI — Beyond Font Pairing',
    channel: 'Alex Rivera',
    views: '55K views',
    duration: '33:49',
    thumbColor: '#2d2a1a',
  },
]

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoPlayerPage() {
  const videoRef = useRef(null)
  const playerWrapRef = useRef(null)

  const [isPlaying, setIsPlaying]       = useState(false)
  const [currentTime, setCurrentTime]   = useState(0)
  const [duration, setDuration]         = useState(0)
  const [volume, setVolume]             = useState(0.8)
  const [isMuted, setIsMuted]           = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [liked, setLiked]               = useState(false)
  const [likeCount, setLikeCount]       = useState(4821)
  const [disliked, setDisliked]         = useState(false)
  const [comments, setComments]         = useState(MOCK_COMMENTS)
  const [newComment, setNewComment]     = useState('')

  function handleAddComment(e) {
    e.preventDefault()
    const text = newComment.trim()
    if (!text) return
    setComments(prev => [{
      id: `c${Date.now()}`,
      username: 'Alex Rivera',
      initials: 'AR',
      color: '#5B4FE9',
      timeAgo: 'Just now',
      text,
      likes: 0,
    }, ...prev])
    setNewComment('')
  }

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setIsPlaying(true) }
    else          { v.pause(); setIsPlaying(false) }
  }, [])

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current?.currentTime ?? 0)
  }

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current?.duration ?? 0)
  }

  const handleEnded = () => setIsPlaying(false)

  const handleScrub = (e) => {
    const v = videoRef.current
    if (!v) return
    const t = Number(e.target.value)
    v.currentTime = t
    setCurrentTime(t)
  }

  const handleVolume = (e) => {
    const v = videoRef.current
    const val = Number(e.target.value)
    if (v) v.volume = val
    setVolume(val)
    setIsMuted(val === 0)
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    const el = playerWrapRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const handleLike = () => {
    if (liked) {
      setLiked(false)
      setLikeCount(c => c - 1)
    } else {
      setLiked(true)
      setLikeCount(c => c + 1)
      if (disliked) setDisliked(false)
    }
  }

  const handleDislike = () => {
    if (disliked) {
      setDisliked(false)
    } else {
      setDisliked(true)
      if (liked) { setLiked(false); setLikeCount(c => c - 1) }
    }
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0
  const volumePct   = isMuted ? 0 : volume * 100

  return (
    <div className="video-player-page">
      <div className="vp-content">

        {/* ── Main column ── */}
        <div className="vp-main">

          {/* Player */}
          <div className="vp-player-wrap" ref={playerWrapRef}>
            <video
              ref={videoRef}
              className="vp-video"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              onClick={togglePlay}
            >
              <source src="" type="video/mp4" />
            </video>


<div className="vp-controls">
              <div className="vp-controls__progress-row">
                <input
                  type="range"
                  className="vp-scrubber"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleScrub}
                  style={{ '--pct': `${progressPct}%` }}
                />
              </div>
              <div className="vp-controls__bar">
                <div className="vp-controls__left">
                  <button className="vp-btn vp-btn--play" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying
                      ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                      : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    }
                  </button>
                  <div className="vp-volume">
                    <button className="vp-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                      {isMuted || volume === 0
                        ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18l1.28 1.27L20.27 18 5.27 3 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                        : volume < 0.5
                        ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>
                        : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                      }
                    </button>
                    <input
                      type="range"
                      className="vp-volume-slider"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolume}
                      style={{ '--pct': `${volumePct}%` }}
                    />
                  </div>
                  <span className="vp-time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                <div className="vp-controls__right">
                  <button className="vp-btn" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                    {isFullscreen
                      ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                      : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Title & meta */}
          <div className="vp-info-card">
            <h1 className="vp-title">Building a Design System from Scratch</h1>
            <div className="vp-meta-row">
              <div className="vp-channel">
                <div className="vp-channel__avatar">AR</div>
                <div>
                  <p className="vp-channel__name">Alex Rivera</p>
                  <p className="vp-channel__subs">48.2K subscribers</p>
                </div>
                <button className="vp-subscribe-btn">Subscribe</button>
              </div>
              <div className="vp-actions">
                <button
                  className={`vp-action-btn${liked ? ' vp-action-btn--active' : ''}`}
                  onClick={handleLike}
                  aria-label="Like"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
                  <span>{likeCount.toLocaleString()}</span>
                </button>
                <button
                  className={`vp-action-btn${disliked ? ' vp-action-btn--active' : ''}`}
                  onClick={handleDislike}
                  aria-label="Dislike"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>
                </button>
                <button className="vp-action-btn" aria-label="Share">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
                  <span>Share</span>
                </button>
              </div>
            </div>
            <div className="vp-stats-row">
              <span className="vp-stat">312,847 views</span>
              <span className="vp-stat-dot">·</span>
              <span className="vp-stat">Mar 14, 2026</span>
            </div>
          </div>

          {/* Description */}
          <div className="vp-desc-card">
            <div className={`vp-desc__body${descExpanded ? ' vp-desc__body--expanded' : ''}`}>
              <p>
                In this deep-dive, we build a complete token-based design system from the ground up — starting
                with raw color primitives and ending with a fully documented, theme-ready component library.
              </p>
              <p>
                We cover semantic token aliasing, multi-brand theming, dark mode architecture, and the tooling
                pipeline that keeps your tokens in sync across Figma and code. No shortcuts taken — every
                decision is explained so you can adapt it to your own codebase.
              </p>
              <p>
                Chapters:<br />
                00:00 — Introduction &amp; motivation<br />
                04:18 — Primitive tokens: color, space, type<br />
                14:32 — Semantic aliasing explained<br />
                22:10 — Component tokens &amp; composition<br />
                31:45 — Dark mode without tears<br />
                41:00 — Multi-brand theming<br />
                50:20 — Tooling: Style Dictionary + Figma Variables<br />
                58:44 — Q&amp;A and wrap-up
              </p>
            </div>
            <button
              className="vp-desc__toggle"
              onClick={() => setDescExpanded(e => !e)}
            >
              {descExpanded ? 'Show less ▲' : 'Show more ▼'}
            </button>
          </div>

          {/* Comments */}
          <div className="vp-comments-card">
            <h2 className="vp-comments__heading">{comments.length} Comments</h2>

            <form className="vp-comment-form" onSubmit={handleAddComment}>
              <div className="vp-comment__avatar" style={{ background: '#5B4FE9' }}>AR</div>
              <div className="vp-comment-form__input-wrap">
                <textarea
                  className="vp-comment-form__input"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  rows={1}
                />
                {newComment.trim() && (
                  <div className="vp-comment-form__actions">
                    <button type="button" className="vp-comment-form__cancel" onClick={() => setNewComment('')}>Cancel</button>
                    <button type="submit" className="vp-comment-form__submit">Comment</button>
                  </div>
                )}
              </div>
            </form>

            <div className="vp-comments__list">
              {comments.map(c => (
                <div key={c.id} className="vp-comment">
                  <div className="vp-comment__avatar" style={{ background: c.color }}>
                    {c.initials}
                  </div>
                  <div className="vp-comment__body">
                    <div className="vp-comment__header">
                      <span className="vp-comment__username">{c.username}</span>
                      <span className="vp-comment__time">{c.timeAgo}</span>
                    </div>
                    <p className="vp-comment__text">{c.text}</p>
                    <div className="vp-comment__footer">
                      <button className="vp-comment__like">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
                        {c.likes.toLocaleString()}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Related sidebar ── */}
        <aside className="vp-sidebar">
          <h2 className="vp-sidebar__heading">Up Next</h2>
          <div className="vp-related-list">
            {MOCK_RELATED.map(r => (
              <div key={r.id} className="vp-related-card">
                <div className="vp-related-card__thumb" style={{ background: r.thumbColor }}>
                  <div className="vp-related-card__grid" aria-hidden="true" />
                  <span className="vp-related-card__duration">{r.duration}</span>
                </div>
                <div className="vp-related-card__info">
                  <p className="vp-related-card__title">{r.title}</p>
                  <p className="vp-related-card__channel">{r.channel}</p>
                  <p className="vp-related-card__views">{r.views}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  )
}
