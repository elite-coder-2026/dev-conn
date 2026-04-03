import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import ShareIcon from '@mui/icons-material/Share'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import LinkIcon from '@mui/icons-material/Link'
import Avatar from '../../common/Avatar/Avatar'
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

export default function PostCard({ post }) {
  const { author, timeAgo, content, likes, comments, shares } = post
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
        <button className="post-card__kebab" aria-label="More options">
          <MoreHorizIcon />
        </button>
      </div>

      <div className="post-card__body">
        {content && <p className="post-card__content">{content}</p>}
        <PostMedia post={post} />
      </div>

      <div className="post-card__actions">
        <button className="post-card__action-btn" aria-label={`${likes} likes`}>
          <ThumbUpOutlinedIcon />
          {formatCount(likes)}
        </button>
        <button className="post-card__action-btn" aria-label={`${comments} comments`}>
          <ChatBubbleOutlineIcon />
          {formatCount(comments)}
        </button>
        <button className="post-card__action-btn" aria-label={`${shares} shares`}>
          <ShareIcon />
          {formatCount(shares)}
        </button>
      </div>
    </article>
  )
}
