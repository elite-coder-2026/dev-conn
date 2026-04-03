import ChatWindow from '../ChatWindow/ChatWindow'
import './ChatTray.css'

export default function ChatTray({ chats, contacts, onMinimize, onClose, onRemove, onSendMessage }) {
  return (
    <div className="chat-tray">
      {chats.map(chat => {
        const contact = contacts.find(c => c.id === chat.contactId)
        if (!contact) return null
        return (
          <ChatWindow
            key={chat.contactId}
            contact={contact}
            chat={chat}
            onMinimize={() => onMinimize(chat.contactId)}
            onClose={() => onClose(chat.contactId)}
            onAnimationEnd={() => onRemove(chat.contactId)}
            onSendMessage={onSendMessage}
          />
        )
      })}
    </div>
  )
}
