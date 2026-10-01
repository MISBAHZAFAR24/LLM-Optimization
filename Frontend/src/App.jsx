import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Usage from './pages/Usage.jsx'
import Optimization from './pages/Optimization.jsx'
import Models from './pages/Models.jsx'
import Auth from './pages/Auth.jsx'

const pages = { Overview: Dashboard, Usage, Optimization, Models }

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('promptly_user') || 'null'))
  const [authNotice, setAuthNotice] = useState('')
  const [activePage, setActivePage] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const Page = pages[activePage]
  const navigate = (page) => { setActivePage(page); setSidebarOpen(false) }
  const logout = () => { localStorage.removeItem('promptly_token'); localStorage.removeItem('promptly_user'); setUser(null) }
  useEffect(() => {
    const handleSessionExpired = () => {
      setAuthNotice('Your session expired. Please sign in again.')
      setUser(null)
    }
    window.addEventListener('promptly:session-expired', handleSessionExpired)
    return () => window.removeEventListener('promptly:session-expired', handleSessionExpired)
  }, [])
  const authenticate = (authenticatedUser) => {
    setAuthNotice('')
    setUser(authenticatedUser)
  }
  if (!user) return <Auth onAuthenticated={authenticate} notice={authNotice} />
  return <div className="app-shell"><Sidebar activePage={activePage} onNavigate={navigate} open={sidebarOpen} /><div className="main-column"><Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} onLogout={logout} /><main className="content"><Page user={user} /></main></div></div>
}
