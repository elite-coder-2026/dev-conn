import './ComponentList.css'

export default function ComponentList({ components }) {
  return (
    <div className="component-list">
      <h2 className="component-list__heading">Components</h2>
      <ul className="component-list__items">
        {components.map(comp => (
          <li key={comp.id} className="component-list__item">
            <div className="component-list__item-header">
              <span className="component-list__name">{comp.name}</span>
              <span className="component-list__time">{comp.timeAgo}</span>
            </div>
            <p className="component-list__description">{comp.description}</p>
            <div className="component-list__footer">
              <div className="component-list__tags">
                {comp.tags.map(tag => (
                  <span key={tag} className="component-list__tag">{tag}</span>
                ))}
              </div>
              <div className="component-list__stats">
                <span className="component-list__stat">★ {comp.stars}</span>
                <span className="component-list__stat">⑂ {comp.forks}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
