/**
 * Smoke coverage for every component: it must mount and unmount without throwing,
 * with network calls stubbed. Deeper behaviour lives in per-component test files.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

import AuthPage from '../components/auth/AuthPage/AuthPage'
import ChatTray from '../components/chat/ChatTray/ChatTray'
import ChatWindow from '../components/chat/ChatWindow/ChatWindow'
import Avatar from '../components/common/Avatar/Avatar'
import IconButton from '../components/common/IconButton/IconButton'
import NotificationsDropdown from '../components/common/NotificationsDropdown/NotificationsDropdown'
import DiscoverPage from '../components/discover/DiscoverPage/DiscoverPage'
import ComponentEditorPage from '../components/editor/ComponentEditorPage/ComponentEditorPage'
import ActivityGraph from '../components/feed/ActivityGraph/ActivityGraph'
import CommentSection from '../components/feed/CommentSection/CommentSection'
import ComponentList from '../components/feed/ComponentList/ComponentList'
import ContactRow from '../components/feed/ContactSidebar/ContactRow'
import ContactSidebar from '../components/feed/ContactSidebar/ContactSidebar'
import FeedPage from '../components/feed/FeedPage/FeedPage'
import FriendsList from '../components/feed/FriendsList/FriendsList'
import LeftSidebar from '../components/feed/LeftSidebar/LeftSidebar'
import OtherUserProfilePage from '../components/feed/OtherUserProfilePage/OtherUserProfilePage'
import PostCard from '../components/feed/PostCard/PostCard'
import PostComposer from '../components/feed/PostComposer/PostComposer'
import PostFeed from '../components/feed/PostFeed/PostFeed'
import ProfileCard from '../components/feed/ProfileCard/ProfileCard'
import ProfilePage from '../components/feed/ProfilePage/ProfilePage'
import ReactionPicker from '../components/feed/ReactionPicker/ReactionPicker'
import ShareModal from '../components/feed/ShareModal/ShareModal'
import ShortcutList from '../components/feed/ShortcutList/ShortcutList'
import VideoList from '../components/feed/VideoList/VideoList'
import FriendsPage from '../components/friends/FriendsPage/FriendsPage'
import AppHeader from '../components/layout/AppHeader/AppHeader'
import MessagesPage from '../components/messages/MessagesPage/MessagesPage'
import SearchResultsPage from '../components/search/SearchResultsPage/SearchResultsPage'
import VideoPlayerPage from '../components/video/VideoPlayerPage/VideoPlayerPage'

const currentUser = {
  id: 'u1', name: 'Test User', handle: '@test', avatar_url: null, avatarSrc: null,
  cover_color: '#333', coverColor: '#333',
  stats: { posts: 0, followers: 0, following: 0 },
}

// The client uses a camelCase view model with a nested author, not the API shape.
const post = {
  id: 'p1', type: 'text', content: 'hello world',
  author: { name: 'Test User', handle: '@test', avatarSrc: null },
  timeAgo: '1h', likedByMe: false, sharedByMe: false,
  likes: 0, comments: 0, shares: 0,
}

const contact = { id: 'u2', name: 'Other', handle: '@other', avatarSrc: null, online: true }

const noop = () => {}

const cases = [
  ['AuthPage', AuthPage, { onAuth: noop }],
  ['ChatTray', ChatTray, { chats: [], contacts: [], onMinimize: noop, onClose: noop, onRemove: noop, onSendMessage: noop }],
  ['ChatWindow', ChatWindow, { contact, chat: { minimized: false, messages: [], isTyping: false }, onMinimize: noop, onClose: noop, onAnimationEnd: noop, onSendMessage: noop }],
  ['Avatar', Avatar, { src: null, name: 'Test User', alt: 'Test User' }],
  ['IconButton', IconButton, { onClick: noop, label: 'do', children: 'x' }],
  ['NotificationsDropdown', NotificationsDropdown, { notifications: [], onClose: noop, onMarkAllRead: noop }],
  ['DiscoverPage', DiscoverPage, { currentUser }],
  ['ComponentEditorPage', ComponentEditorPage, { currentUser }],
  ['ActivityGraph', ActivityGraph, {}],
  ['CommentSection', CommentSection, { comments: [], currentUser, onAddComment: noop, onAddReply: noop }],
  ['ComponentList', ComponentList, { components: [] }],
  ['ContactRow', ContactRow, { contact, onMessage: noop }],
  ['ContactSidebar', ContactSidebar, { contacts: [], onMessage: noop }],
  ['FeedPage', FeedPage, { currentUser }],
  ['FriendsList', FriendsList, { contacts: [], onMessage: noop }],
  ['LeftSidebar', LeftSidebar, { currentUser }],
  ['OtherUserProfilePage', OtherUserProfilePage, { userId: 'u2', currentUser }],
  ['PostCard', PostCard, { post, currentUser }],
  ['PostComposer', PostComposer, { user: currentUser, onPost: noop }],
  ['PostFeed', PostFeed, { currentUser, posts: [] }],
  ['ProfileCard', ProfileCard, { user: currentUser }],
  ['ProfilePage', ProfilePage, { currentUser }],
  ['ReactionPicker', ReactionPicker, { onSelect: noop, onPick: noop }],
  ['ShareModal', ShareModal, { post: { author: { name: 'Test User', handle: '@test', avatarSrc: null }, timeAgo: '1h', content: 'hi' }, onClose: noop, onShare: noop }],
  ['ShortcutList', ShortcutList, {}],
  ['VideoList', VideoList, { videos: [] }],
  ['FriendsPage', FriendsPage, { currentUser }],
  ['AppHeader', AppHeader, { activeNav: 'feed', setActiveNav: noop, onSearch: noop, onLogout: noop, currentUser }],
  ['MessagesPage', MessagesPage, { currentUser }],
  ['SearchResultsPage', SearchResultsPage, { query: 'test', currentUser }],
  ['VideoPlayerPage', VideoPlayerPage, { currentUser }],
]

beforeEach(() => {
  global.fetch.mockReset()
  global.fetch.mockImplementation(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]), text: () => Promise.resolve('') }),
  )
})

describe('component smoke tests', () => {
  test.each(cases)('%s mounts and unmounts cleanly', (_name, Component, props) => {
    const { unmount } = render(<Component {...props} />)
    expect(() => unmount()).not.toThrow()
  })
})
