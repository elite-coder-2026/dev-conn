import ContactRow from './ContactRow'
import './ContactSidebar.css'

export default function ContactSidebar({ contacts, onMessage }) {
  const online  = contacts.filter(c => c.online)
  const offline = contacts.filter(c => !c.online)

  return (
    <div className="contact-sidebar">
      <h2 className="contact-sidebar__heading">Contacts</h2>

      {online.length > 0 && (
        <>
          <p className="contact-sidebar__section-label">Online</p>
          {online.map(c => (
            <ContactRow key={c.id} contact={c} onMessage={onMessage} />
          ))}
        </>
      )}

      {offline.length > 0 && (
        <>
          <div className="contact-sidebar__divider" />
          <p className="contact-sidebar__section-label">Offline</p>
          {offline.map(c => (
            <ContactRow key={c.id} contact={c} onMessage={onMessage} />
          ))}
        </>
      )}
    </div>
  )
}
