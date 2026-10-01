const navItems = [
  ['Overview', '▦'],
  ['Usage', '⌁'],
  ['Optimization', '✦'],
  ['Models', '◈'],
]

export default function Sidebar({ activePage, onNavigate, open }) {
  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <div className="brand"><span className="brand-mark">◇</span><span>Promptly</span></div>
      <div className="workspace-switcher"><span className="workspace-dot" /><span>Jarvis AI</span><span className="chevron">⌄</span></div>
      <nav className="nav-list" aria-label="Main navigation">
        <p className="nav-label">Monitor</p>
        {navItems.map(([label, icon]) => <button key={label} className={`nav-item ${activePage === label ? 'active' : ''}`} onClick={() => onNavigate(label)}><span className="nav-icon">{icon}</span>{label}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-item"><span className="nav-icon">⚙</span>Settings</button>
        <div className="plan-card"><div className="plan-row"><span>Pro plan</span><span>78%</span></div><div className="progress"><span /></div><small>78.2M of 100M tokens</small><button>Manage plan <span>→</span></button></div>
        <div className="sidebar-footer">Promptly <span>v1.4.0</span></div>
      </div>
    </aside>
  )
}
