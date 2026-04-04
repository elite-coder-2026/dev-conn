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

export default function PostComposer({ user, onPost }) {
  const [expanded, setExpanded]           = useState(false)
  const [type, setType]                   = useState('text')
  const [text, setText]                   = useState('')
  const [imageUrl, setImageUrl]           = useState('')
  const [videoUrl, setVideoUrl]           = useState('')
  const [linkUrl, setLinkUrl]             = useState('')
  const [linkTitle, setLinkTitle]         = useState('')
  const [code, setCode]                   = useState(DEFAULT_COMPONENT_CODE)
  const [compName, setCompName]           = useState('')
  const [compVersion, setCompVersion]     = useState('1.0.0')
  const [compDesc, setCompDesc]           = useState('')
  const [compDeps, setCompDeps]           = useState('')
  const [compLicense, setCompLicense]     = useState('MIT')
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
    setCompName('')
    setCompVersion('1.0.0')
    setCompDesc('')
    setCompDeps('')
    setCompLicense('MIT')
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
    if (type === 'component' && (!compName.trim() || !code.trim())) return false
    return true
  }

  async function handleSubmit() {
    let content = text.trim()
    if (type === 'component') {
      const lines = [
        `Component: ${compName.trim()}`,
        `Version: ${compVersion.trim()}`,
        `Author: ${user.name} (@${user.handle})`,
        `License: ${compLicense.trim()}`,
      ]
      if (compDeps.trim()) lines.push(`Dependencies: ${compDeps.trim()}`)
      if (compDesc.trim()) lines.push(`\n${compDesc.trim()}`)
      lines.push(`\n\`\`\`html\n${code.trim()}\n\`\`\``)
      content = lines.join('\n')
    }

    const body = { content }
    if (type === 'image' && imageUrl.trim()) body.image_url = imageUrl.trim()

    try {
      const res = await fetch('/api/posts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!res.ok) return
      const saved = await res.json()
      onPost({
        id: saved.id,
        type: type === 'component' ? 'component' : saved.image_url ? 'image' : 'text',
        author: {
          name: saved.author_name,
          handle: saved.author_handle,
          avatarSrc: saved.author_avatar_url,
        },
        timeAgo: 'Just now',
        content: type === 'component'
          ? [
              `Component: ${compName.trim()}`,
              `Version: ${compVersion.trim()}`,
              `Author: ${user.name} (@${user.handle})`,
              `License: ${compLicense.trim()}`,
              compDeps.trim() ? `Dependencies: ${compDeps.trim()}` : '',
              compDesc.trim() ? `\n${compDesc.trim()}` : '',
            ].filter(Boolean).join('\n')
          : saved.content,
        code: type === 'component' ? code.trim() : undefined,
        imageUrl: saved.image_url || undefined,
        likes: 0,
        comments: 0,
        shares: 0,
      })
      reset()
    } catch (err) {
      console.error('Post failed:', err)
    }
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
            <div className="post-composer__comp-meta">
              <input
                className="post-composer__field"
                type="text"
                placeholder="Component name *"
                value={compName}
                onChange={e => setCompName(e.target.value)}
              />
              <div className="post-composer__comp-row">
                <input
                  className="post-composer__field"
                  type="text"
                  placeholder="Version (e.g. 1.0.0)"
                  value={compVersion}
                  onChange={e => setCompVersion(e.target.value)}
                />
                <input
                  className="post-composer__field"
                  type="text"
                  placeholder="License (e.g. MIT)"
                  value={compLicense}
                  onChange={e => setCompLicense(e.target.value)}
                />
              </div>
              <input
                className="post-composer__field"
                type="text"
                placeholder="Dependencies (e.g. React 18, Tailwind)"
                value={compDeps}
                onChange={e => setCompDeps(e.target.value)}
              />
              <textarea
                className="post-composer__field"
                placeholder="Description — what does this component do?"
                value={compDesc}
                onChange={e => setCompDesc(e.target.value)}
                rows={2}
              />
            </div>
            <div className="post-composer__code-preview-row">
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
