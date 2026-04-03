import Avatar from '../../common/Avatar/Avatar'
import './FriendsList.css'

export default function FriendsList({ contacts, onMessage }) {
  const online  = contacts.filter(c => c.online)
  const offline = contacts.filter(c => !c.online)

  return (
    <div className="friends-list">
      <h2 className="friends-list__heading">Friends</h2>

      {online.length > 0 && (
        <>
          <p className="friends-list__section-label">Online</p>
          {online.map(c => (
            <div key={c.id} className="friends-list__row" role="button" tabIndex={0} onClick={() => onMessage(c.id)}>
              <Avatar src={c.avatarSrc} alt={c.name} size="sm" online={c.online} />
              <div className="friends-list__info">
                <p className="friends-list__name">{c.name}</p>
                <p className="friends-list__handle">{c.handle}</p>
              </div>
            </div>
          ))}
        </>
      )}

      {offline.length > 0 && (
        <>
          <div className="friends-list__divider" />
          <p className="friends-list__section-label">Offline</p>
          {offline.map(c => (
            <div key={c.id} className="friends-list__row" role="button" tabIndex={0} onClick={() => onMessage(c.id)}>
              <Avatar src={c.avatarSrc} alt={c.name} size="sm" online={c.online} />
              <div className="friends-list__info">
                <p className="friends-list__name">{c.name}</p>
                <p className="friends-list__handle">{c.handle}</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
