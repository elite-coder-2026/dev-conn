import './IconButton.css'

export default function IconButton({ icon, label, badge, onClick, active = false }) {
  return (
    <button
      className={`icon-btn${active ? ' icon-btn--active' : ''}`}
      aria-label={label}
      onClick={onClick}
    >
      {icon}
      {badge > 0 && <span className="icon-btn__badge">{badge > 99 ? '99+' : badge}</span>}
    </button>
  )
}
