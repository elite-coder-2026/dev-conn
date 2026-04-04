import { useState, useEffect } from 'react'
import AppHeader from './components/layout/AppHeader/AppHeader'
import FeedPage from './components/feed/FeedPage/FeedPage'
import ActivityGraph from './components/feed/ActivityGraph/ActivityGraph'
import MessagesPage from './components/messages/MessagesPage/MessagesPage'
import FriendsPage from './components/friends/FriendsPage/FriendsPage'
import ProfilePage from './components/feed/ProfilePage/ProfilePage'
import VideoPlayerPage from './components/video/VideoPlayerPage/VideoPlayerPage'
import DiscoverPage from './components/discover/DiscoverPage/DiscoverPage'
import SearchResultsPage from './components/search/SearchResultsPage/SearchResultsPage'
import ComponentEditorPage from './components/editor/ComponentEditorPage/ComponentEditorPage'
import AuthPage from './components/auth/AuthPage/AuthPage'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [activeNav, setActiveNav]     = useState('feed')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(user => { setCurrentUser(user); setAuthChecked(true) })
      .catch(() => setAuthChecked(true))
  }, [])

  function handleAuth(user) {
    setCurrentUser(user)
  }

  function handleSearch(query) {
    setSearchQuery(query)
    setActiveNav('search')
  }

  if (!authChecked) return null

  if (!currentUser) {
    return <AuthPage onAuth={handleAuth} />
  }

  return (
    <>
      <AppHeader activeNav={activeNav} setActiveNav={setActiveNav} onSearch={handleSearch} currentUser={currentUser} />
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
      {activeNav === 'search' && <SearchResultsPage query={searchQuery} />}
      {activeNav === 'editor' && <ComponentEditorPage currentUser={currentUser} />}
      {activeNav !== 'activity' && activeNav !== 'messages' && activeNav !== 'friends' && activeNav !== 'profile' && activeNav !== 'videos' && activeNav !== 'discover' && activeNav !== 'search' && activeNav !== 'editor' && <FeedPage currentUser={currentUser} />}
    </>
  )
}

export default App
