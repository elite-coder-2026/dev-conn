import Avatar from '../../common/Avatar/Avatar'
import './ProfileCard.css'

function formatStat(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function ProfileCard({ user }) {
  return (
    <div className="profile-card">
      <div
        className="profile-card__cover"
        style={{ background: user.coverColor || 'linear-gradient(135deg, #5B4FE9, #7B72ED)' }}
      />
      <div className="profile-card__body">
        <div className="profile-card__avatar-wrap">
          <Avatar src={user.avatarSrc} alt={user.name} size="lg" />
        </div>
        <p className="profile-card__name">{user.name}</p>
        <p className="profile-card__handle">{user.handle}</p>
        <div className="profile-card__stats">
          <div className="profile-card__stat">
            <span className="profile-card__stat-value">{formatStat(user.stats.posts)}</span>
            <span className="profile-card__stat-label">Posts</span>
          </div>
          <div className="profile-card__stat">
            <span className="profile-card__stat-value">{formatStat(user.stats.followers)}</span>
            <span className="profile-card__stat-label">Followers</span>
          </div>
          <div className="profile-card__stat">
            <span className="profile-card__stat-value">{formatStat(user.stats.following)}</span>
            <span className="profile-card__stat-label">Following</span>
          </div>
        </div>
      </div>
    </div>
  )
}
