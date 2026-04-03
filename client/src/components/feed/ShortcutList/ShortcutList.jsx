import HomeIcon from '@mui/icons-material/Home'
import MailIcon from '@mui/icons-material/Mail'
import PeopleIcon from '@mui/icons-material/People'
import ExploreIcon from '@mui/icons-material/Explore'
import './ShortcutList.css'

const ITEMS = [
  { icon: <HomeIcon />,    label: 'Feed'     },
  { icon: <MailIcon />,    label: 'Messages' },
  { icon: <PeopleIcon />,  label: 'Friends'  },
  { icon: <ExploreIcon />, label: 'Discover' },
]

export default function ShortcutList() {
  return (
    <nav className="shortcut-list" aria-label="Shortcuts">
      {ITEMS.map(item => (
        <button key={item.label} className="shortcut-list__item">
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  )
}
