import './Avatar.css'

const PALETTE = [
  '#5B4FE9', '#E94F4F', '#4F9DE9', '#4FE97B',
  '#E9A84F', '#9B4FE9', '#4FE9D9', '#E94FA8',
]

function getColor(name = '') {
  const sum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return PALETTE[sum % PALETTE.length]
}

function getInitials(alt = '') {
  return alt
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
}

export default function Avatar({ src, alt = '', size = 'md', online = false }) {
  return (
    <div className={`avatar avatar--${size}`}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <span
          className="avatar__fallback"
          style={{ background: getColor(alt) }}
          aria-label={alt}
        >
          {getInitials(alt)}
        </span>
      )}
      {online && <span className="avatar__dot" aria-hidden="true" />}
    </div>
  )
}
