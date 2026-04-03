import ProfileCard from '../ProfileCard/ProfileCard'
import ShortcutList from '../ShortcutList/ShortcutList'
import mockUser from '../../../data/mockUser'
import './LeftSidebar.css'

export default function LeftSidebar() {
  return (
    <div className="left-sidebar">
      <ProfileCard user={mockUser} />
      <ShortcutList />
    </div>
  )
}
