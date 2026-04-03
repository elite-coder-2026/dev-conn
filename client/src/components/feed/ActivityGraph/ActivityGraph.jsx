import { useMemo } from 'react'
import './ActivityGraph.css'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CELL_COLORS = [
  '#EBEDF0',
  'rgba(91,79,233,0.25)',
  'rgba(91,79,233,0.50)',
  'rgba(91,79,233,0.75)',
  '#5B4FE9',
]

function getLevel(count) {
  if (count === 0)  return 0
  if (count <= 7)   return 1
  if (count <= 15)  return 2
  if (count <= 25)  return 3
  return 4
}

function randomCount() {
  const r = Math.random()
  if (r < 0.05) return 0
  if (r < 0.15) return Math.floor(Math.random() * 5) + 1
  if (r < 0.35) return Math.floor(Math.random() * 8) + 8
  if (r < 0.65) return Math.floor(Math.random() * 10) + 16
  return Math.floor(Math.random() * 12) + 26
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function generateDays() {
  const today = new Date(2026, 3, 2) // April 2, 2026
  // go back to the most recent Sunday on or before (today - 52 weeks)
  const start = new Date(today)
  start.setDate(start.getDate() - 364)
  // rewind to Sunday
  start.setDate(start.getDate() - start.getDay())

  const days = []
  const d = new Date(start)
  while (d <= today) {
    days.push({ date: new Date(d), count: randomCount() })
    d.setDate(d.getDate() + 1)
  }
  return days
}

export default function ActivityGraph() {
  const days = useMemo(() => generateDays(), [])

  const total = days.reduce((sum, d) => sum + d.count, 0)

  // build weeks: array of 7-element arrays
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  // compute month labels: { label, col } where col is the week index
  const monthLabels = []
  weeks.forEach((week, wi) => {
    // use the first day of the week
    const first = week[0].date
    if (wi === 0 || first.getDate() <= 7) {
      const label = MONTHS[first.getMonth()]
      // avoid duplicate labels
      if (!monthLabels.length || monthLabels[monthLabels.length - 1].label !== label) {
        monthLabels.push({ label, col: wi })
      }
    }
  })

  return (
    <div className="activity-graph">
      <p className="activity-graph__heading">
        <strong>{total.toLocaleString()}</strong> contributions in the last year
      </p>

      <div className="activity-graph__scroll">
        <div className="activity-graph__inner">
          {/* Month labels */}
          <div className="activity-graph__months">
            {monthLabels.map(({ label, col }) => (
              <span
                key={`${label}-${col}`}
                className="activity-graph__month"
                style={{ gridColumnStart: col + 1 }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="activity-graph__body">
            {/* Day labels */}
            <div className="activity-graph__days">
              <span style={{ gridRow: 2 }}>Mon</span>
              <span style={{ gridRow: 4 }}>Wed</span>
              <span style={{ gridRow: 6 }}>Fri</span>
            </div>

            {/* Grid */}
            <div className="activity-graph__grid">
              {weeks.map((week, wi) =>
                week.map((day, di) => {
                  const level = getLevel(day.count)
                  const label = day.count === 0
                    ? `No contributions on ${formatDate(day.date)}`
                    : `${day.count} contribution${day.count !== 1 ? 's' : ''} on ${formatDate(day.date)}`
                  return (
                    <div
                      key={day.date.toISOString()}
                      className="activity-graph__cell"
                      style={{
                        gridColumn: wi + 1,
                        gridRow: di + 1,
                        background: CELL_COLORS[level],
                      }}
                      title={label}
                    />
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="activity-graph__legend">
        <span>Less</span>
        {CELL_COLORS.map((color, i) => (
          <div key={i} className="activity-graph__legend-cell" style={{ background: color }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
