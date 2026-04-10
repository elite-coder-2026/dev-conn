import ProfileCard from '../ProfileCard/ProfileCard'
import ShortcutList from '../ShortcutList/ShortcutList'
import './LeftSidebar.css'

export default function LeftSidebar({ currentUser }) {
  return (
    <div className="left-sidebar">
      <ProfileCard user={currentUser} />
      <ShortcutList />
    </div>
  )
}
