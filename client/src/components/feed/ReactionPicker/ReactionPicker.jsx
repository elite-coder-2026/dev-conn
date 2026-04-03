import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt'
import FavoriteIcon from '@mui/icons-material/Favorite'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'
import './ReactionPicker.css'

const REACTIONS = [
  { key: 'like',    label: 'Like',    Icon: ThumbUpAltIcon,                 color: '#5B4FE9' },
  { key: 'dislike', label: 'Dislike', Icon: ThumbDownAltIcon,               color: '#6B7280' },
  { key: 'love',    label: 'Love',    Icon: FavoriteIcon,                   color: '#E94F6A' },
  { key: 'care',    label: 'Care',    Icon: VolunteerActivismIcon,          color: '#E9A84F' },
  { key: 'angry',   label: 'Angry',   Icon: SentimentVeryDissatisfiedIcon, color: '#E94F4F' },
]

export default function ReactionPicker({ onSelect }) {
  return (
    <div className="reaction-picker" role="toolbar" aria-label="React to post">
      {REACTIONS.map(({ key, label, Icon, color }) => (
        <button
          key={key}
          className="reaction-picker__btn"
          aria-label={label}
          onClick={() => onSelect(key)}
        >
          <Icon className="reaction-picker__icon" style={{ color }} />
          <span className="reaction-picker__label">{label}</span>
        </button>
      ))}
    </div>
  )
}
