import { useState } from 'react'
import AppHeader from './components/layout/AppHeader/AppHeader'
import FeedPage from './components/feed/FeedPage/FeedPage'
import ActivityGraph from './components/feed/ActivityGraph/ActivityGraph'
import MessagesPage from './components/messages/MessagesPage/MessagesPage'
import FriendsPage from './components/friends/FriendsPage/FriendsPage'
import ProfilePage from './components/feed/ProfilePage/ProfilePage'
import VideoPlayerPage from './components/video/VideoPlayerPage/VideoPlayerPage'
import DiscoverPage from './components/discover/DiscoverPage/DiscoverPage'

function App() {
  const [activeNav, setActiveNav] = useState('feed')

  return (
    <>
      <AppHeader activeNav={activeNav} setActiveNav={setActiveNav} />
      {activeNav === 'activity' && (
        <main style={{ maxWidth: 700, margin: '32px auto', padding: '0 16px' }}>
          <ActivityGraph />
        </main>
      )}
      {activeNav === 'messages' && <MessagesPage />}
      {activeNav === 'friends' && <FriendsPage />}
      {activeNav === 'profile' && <ProfilePage />}
      {activeNav === 'videos' && <VideoPlayerPage />}
      {activeNav === 'discover' && <DiscoverPage />}
      {activeNav !== 'activity' && activeNav !== 'messages' && activeNav !== 'friends' && activeNav !== 'profile' && activeNav !== 'videos' && activeNav !== 'discover' && <FeedPage />}
    </>
  )
}

export default App
