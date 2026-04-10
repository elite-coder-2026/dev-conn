import { useState, useEffect } from 'react'
import ProfileCard from '../ProfileCard/ProfileCard'
import './OtherUserProfilePage.css'

export default function OtherUserProfilePage({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!userId) return
    fetch(`/api/users/${userId}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        setUser({
          ...data,
          avatarSrc: data.avatar_url,
          coverColor: data.cover_color,
          stats: {
            posts: data.posts_count ?? 0,
            followers: data.followers_count ?? 0,
            following: data.following_count ?? 0,
          },
        })
      })
  }, [userId])

  if (!user) return null

  return (
    <main className="other-profile-page">
      <div className="other-profile-page__inner">
        <ProfileCard user={user} />
      </div>
    </main>
  )
}
