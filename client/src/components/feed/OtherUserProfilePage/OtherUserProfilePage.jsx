import ProfileCard from '../ProfileCard/ProfileCard'
import mockContacts from '../../../data/mockContacts'
import './OtherUserProfilePage.css'

const MOCK_OTHER_USER = {
  name: 'Amara Osei',
  handle: '@amaraosei',
  avatarSrc: 'https://i.pravatar.cc/150?u=p1',
  coverColor: 'linear-gradient(135deg, #1a7f5a, #34c48a)',
  stats: { posts: 84, followers: 1240, following: 310 },
  mutualIds: ['c1', 'c3', 'c5'],
}

function getMutualLabel(mutualIds) {
  const mutuals = mutualIds.map(id => mockContacts.find(c => c.id === id)).filter(Boolean)
  if (mutuals.length === 0) return ''
  if (mutuals.length === 1) return `Mutual friend: ${mutuals[0].name}`
  return `${mutuals[0].name} and ${mutuals.length - 1} other mutual ${mutuals.length - 1 === 1 ? 'friend' : 'friends'}`
}

export default function OtherUserProfilePage() {
  const mutuals = MOCK_OTHER_USER.mutualIds
    .map(id => mockContacts.find(c => c.id === id))
    .filter(Boolean)

  return (
    <main className="other-profile-page">
      <div className="other-profile-page__inner">
        <ProfileCard user={MOCK_OTHER_USER} />

        {mutuals.length > 0 && (
          <div className="other-profile__mutuals">
            <p className="other-profile__mutuals-heading">
              {mutuals.length} mutual {mutuals.length === 1 ? 'friend' : 'friends'}
            </p>
            <div className="other-profile__mutual-avatars">
              {mutuals.slice(0, 3).map(m => (
                <img
                  key={m.id}
                  src={m.avatarSrc}
                  alt={m.name}
                  className="other-profile__mutual-avatar"
                  title={m.name}
                />
              ))}
            </div>
            <p className="other-profile__mutual-label">{getMutualLabel(MOCK_OTHER_USER.mutualIds)}</p>
          </div>
        )}
      </div>
    </main>
  )
}
