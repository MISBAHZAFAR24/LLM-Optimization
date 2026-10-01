export default function Navbar({ onMenuClick, user, onLogout }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenuClick} aria-label="Open navigation">=</button>
      <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>Overview</strong></div>
      <div className="topbar-actions">
        <button className="icon-button" aria-label="Search">⌕</button>
        <button className="icon-button notification" aria-label="Notifications">◌<i /></button>
        <div className="user-chip"><span className="avatar">{user?.name?.slice(0, 2).toUpperCase()}</span><span className="user-name">{user?.name}</span><button className="logout-button" onClick={onLogout}>Log out</button></div>
      </div>
    </header>
  )
}
