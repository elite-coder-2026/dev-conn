import { useState } from 'react'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CheckIcon from '@mui/icons-material/Check'
import Avatar from '../../common/Avatar/Avatar'
import mockContacts from '../../../data/mockContacts'
import './DiscoverPage.css'

const PEOPLE_YOU_MAY_KNOW = [
  {
    id: 'p1',
    name: 'Amara Osei',
    handle: '@amaraosei',
    avatarSrc: 'https://i.pravatar.cc/150?u=p1',
    online: true,
    mutualIds: ['c1', 'c3', 'c5'],
  },
  {
    id: 'p2',
    name: 'Felix Braun',
    handle: '@felixbraun',
    avatarSrc: 'https://i.pravatar.cc/150?u=p2',
    online: false,
    mutualIds: ['c2', 'c4'],
  },
  {
    id: 'p3',
    name: 'Naledi Dlamini',
    handle: '@naledidlamini',
    avatarSrc: 'https://i.pravatar.cc/150?u=p3',
    online: true,
    mutualIds: ['c1', 'c6', 'c8', 'c10'],
  },
  {
    id: 'p4',
    name: 'Soren Larsen',
    handle: '@sorenlarsen',
    avatarSrc: 'https://i.pravatar.cc/150?u=p4',
    online: false,
    mutualIds: ['c3', 'c7'],
  },
  {
    id: 'p5',
    name: 'Ingrid Vasquez',
    handle: '@ingridvasquez',
    avatarSrc: 'https://i.pravatar.cc/150?u=p5',
    online: true,
    mutualIds: ['c2', 'c5', 'c9'],
  },
  {
    id: 'p6',
    name: 'Kofi Mensah',
    handle: '@kofimensah',
    avatarSrc: 'https://i.pravatar.cc/150?u=p6',
    online: false,
    mutualIds: ['c4', 'c6'],
  },
  {
    id: 'p7',
    name: 'Hana Yoshida',
    handle: '@hanayoshida',
    avatarSrc: 'https://i.pravatar.cc/150?u=p7',
    online: true,
    mutualIds: ['c1', 'c2', 'c3'],
  },
  {
    id: 'p8',
    name: 'Mateo Reyes',
    handle: '@mateoreyes',
    avatarSrc: 'https://i.pravatar.cc/150?u=p8',
    online: false,
    mutualIds: ['c8', 'c9', 'c10'],
  },
]

function getMutualLabel(mutualIds) {
  const mutuals = mutualIds.map(id => mockContacts.find(c => c.id === id)).filter(Boolean)
  if (mutuals.length === 0) return ''
  if (mutuals.length === 1) return `Mutual friend: ${mutuals[0].name}`
  return `${mutuals[0].name} and ${mutuals.length - 1} other mutual ${mutuals.length - 1 === 1 ? 'friend' : 'friends'}`
}

export default function DiscoverPage() {
  const [requested, setRequested] = useState(new Set())

  function handleRequest(id) {
    setRequested(prev => new Set([...prev, id]))
  }

  return (
    <div className="discover-page">
      <div className="discover-page__inner">

        <div className="discover-page__header">
          <h1 className="discover-page__title">Discover</h1>
        </div>

        <section className="discover-page__section">
          <h2 className="discover-page__section-heading">People You May Know</h2>
          <p className="discover-page__section-sub">Based on your contacts and their connections</p>

          <div className="friends-page__grid">
            {PEOPLE_YOU_MAY_KNOW.map(person => {
              const mutuals = person.mutualIds
                .map(id => mockContacts.find(c => c.id === id))
                .filter(Boolean)

              return (
                <div key={person.id} className="friend-card">
                  <div className="friend-card__avatar">
                    <Avatar src={person.avatarSrc} alt={person.name} size="lg" online={person.online} />
                  </div>
                  <p className="friend-card__name">{person.name}</p>
                  <p className="friend-card__handle">{person.handle}</p>

                  <div className="discover-card__mutuals">
                    <div className="discover-card__mutual-avatars">
                      {mutuals.slice(0, 3).map(m => (
                        <img
                          key={m.id}
                          src={m.avatarSrc}
                          alt={m.name}
                          className="discover-card__mutual-avatar"
                          title={m.name}
                        />
                      ))}
                    </div>
                    <p className="discover-card__mutual-label">{getMutualLabel(person.mutualIds)}</p>
                  </div>

                  <div className="friend-card__actions">
                    {requested.has(person.id) ? (
                      <button className="friend-card__btn friend-card__btn--sent" disabled>
                        <CheckIcon style={{ fontSize: 16 }} /> Requested
                      </button>
                    ) : (
                      <button
                        className="friend-card__btn friend-card__btn--primary"
                        onClick={() => handleRequest(person.id)}
                      >
                        <PersonAddIcon style={{ fontSize: 16 }} /> Add Friend
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}
