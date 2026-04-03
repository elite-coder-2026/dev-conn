import { useState, useRef } from 'react'
import ImageIcon from '@mui/icons-material/Image'
import VideocamIcon from '@mui/icons-material/Videocam'
import LinkIcon from '@mui/icons-material/Link'
import CodeIcon from '@mui/icons-material/Code'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import CloseIcon from '@mui/icons-material/Close'
import Avatar from '../../common/Avatar/Avatar'
import './PostComposer.css'

const TYPES = [
  { id: 'text',      label: 'Text',      Icon: TextFieldsIcon },
  { id: 'image',     label: 'Image',     Icon: ImageIcon      },
  { id: 'video',     label: 'Video',     Icon: VideocamIcon   },
  { id: 'link',      label: 'Link',      Icon: LinkIcon       },
  { id: 'component', label: 'Component', Icon: CodeIcon       },
]

const DEFAULT_COMPONENT_CODE = `<style>
  * { margin: 0; box-sizing: border-box; font-family: system-ui, sans-serif; }
  body { display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0f2f5; }
  .box { padding: 24px 40px; background: #5B4FE9; color: #fff; border-radius: 12px; font-size: 18px; font-weight: 600; }
</style>
<div class="box">Hello, world!</div>`

let postIdCounter = 100

export default function PostComposer({ user, onPost }) {
  const [expanded, setExpanded] = useState(false)
  const [type, setType]         = useState('text')
  const [text, setText]         = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [linkUrl, setLinkUrl]   = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [code, setCode]         = useState(DEFAULT_COMPONENT_CODE)
  const textareaRef = useRef(null)

  function reset() {
    setExpanded(false)
    setType('text')
    setText('')
    setImageUrl('')
    setVideoUrl('')
    setLinkUrl('')
    setLinkTitle('')
    setCode(DEFAULT_COMPONENT_CODE)
  }

  function getYouTubeEmbedUrl(url) {
    const match = url.match(/(?:youtu\.be\/|v=)([^&?\s]+)/)
    if (match) return `https://www.youtube.com/embed/${match[1]}`
    return url
  }

  function canSubmit() {
    if (!text.trim() && type === 'text') return false
    if (type === 'image' && !imageUrl.trim()) return false
    if (type === 'video' && !videoUrl.trim()) return false
    if (type === 'link' && !linkUrl.trim()) return false
    if (type === 'component' && !code.trim()) return false
    return true
  }

  function handleSubmit() {
    const base = {
      id: `p${postIdCounter++}`,
      type,
      author: {
        name: user.name,
        handle: user.handle,
        avatarSrc: user.avatarSrc,
      },
      timeAgo: 'Just now',
      content: text.trim(),
      likes: 0,
      comments: 0,
      shares: 0,
    }

    let post = base
    if (type === 'image')     post = { ...base, imageUrl: imageUrl.trim() }
    if (type === 'video')     post = { ...base, videoUrl: getYouTubeEmbedUrl(videoUrl.trim()) }
    if (type === 'link')      post = { ...base, link: { url: linkUrl.trim(), title: linkTitle.trim() || linkUrl.trim(), description: '', domain: new URL(linkUrl.trim()).hostname, image: null } }
    if (type === 'component') post = { ...base, code: code.trim() }

    onPost(post)
    reset()
  }

  if (!expanded) {
    return (
      <div className="post-composer">
        <div className="post-composer__row">
          <Avatar src={user.avatarSrc} alt={user.name} size="md" />
          <input
            className="post-composer__input"
            type="text"
            placeholder={`What's on your mind, ${user.name.split(' ')[0]}?`}
            onFocus={() => setExpanded(true)}
            readOnly
          />
        </div>
      </div>
    )
  }

  return (
    <div className="post-composer post-composer--expanded">
      {/* Header */}
      <div className="post-composer__expanded-header">
        <Avatar src={user.avatarSrc} alt={user.name} size="md" />
        <span className="post-composer__expanded-name">{user.name}</span>
        <button className="post-composer__close-btn" onClick={reset} aria-label="Cancel">
          <CloseIcon fontSize="small" />
        </button>
      </div>

      {/* Type tabs */}
      <div className="post-composer__tabs">
        {TYPES.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`post-composer__tab${type === id ? ' post-composer__tab--active' : ''}`}
            onClick={() => setType(id)}
          >
            <Icon style={{ fontSize: 16 }} />
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="post-composer__body">
        <textarea
          ref={textareaRef}
          className="post-composer__textarea"
          placeholder={`What's on your mind, ${user.name.split(' ')[0]}?`}
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          autoFocus
        />

        {type === 'image' && (
          <input
            className="post-composer__field"
            type="url"
            placeholder="Image URL"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
        )}

        {type === 'video' && (
          <input
            className="post-composer__field"
            type="url"
            placeholder="YouTube URL (e.g. https://youtu.be/abc123)"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
          />
        )}

        {type === 'link' && (
          <>
            <input
              className="post-composer__field"
              type="url"
              placeholder="URL (e.g. https://example.com)"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
            />
            <input
              className="post-composer__field"
              type="text"
              placeholder="Link title (optional)"
              value={linkTitle}
              onChange={e => setLinkTitle(e.target.value)}
            />
          </>
        )}

        {type === 'component' && (
          <div className="post-composer__component-editor">
            <div className="post-composer__code-wrap">
              <p className="post-composer__code-label">HTML / CSS / JS</p>
              <textarea
                className="post-composer__code"
                value={code}
                onChange={e => setCode(e.target.value)}
                rows={10}
                spellCheck={false}
              />
            </div>
            <div className="post-composer__preview-wrap">
              <p className="post-composer__code-label">Preview</p>
              <iframe
                className="post-composer__preview-frame"
                srcDoc={code}
                sandbox="allow-scripts"
                title="Component preview"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="post-composer__footer">
        <button
          className="post-composer__submit"
          onClick={handleSubmit}
          disabled={!canSubmit()}
        >
          Post
        </button>
      </div>
    </div>
  )
}
