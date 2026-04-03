import ChatIcon from '@mui/icons-material/Chat'
import Avatar from '../../common/Avatar/Avatar'
import './ContactRow.css'

export default function ContactRow({ contact, onMessage }) {
  function handleMessage(e) {
    e.stopPropagation()
    onMessage(contact.id)
  }

  return (
    <div className="contact-row" onClick={() => onMessage(contact.id)} role="button" tabIndex={0}>
      <Avatar
        src={contact.avatarSrc}
        alt={contact.name}
        size="sm"
        online={contact.online}
      />
      <div className="contact-row__info">
        <p className="contact-row__name">{contact.name}</p>
        <p className="contact-row__handle">{contact.handle}</p>
      </div>
      <button
        className="contact-row__msg-btn"
        aria-label={`Message ${contact.name}`}
        onClick={handleMessage}
      >
        <ChatIcon />
      </button>
    </div>
  )
}
