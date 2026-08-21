import { useState, useEffect } from 'react'
import Dashboard from './Dashboard'
import Schedule from './Schedule'
import StudyHub from './StudyHub' 
import Settings from './SettingPage'
import AuthPage from './AuthPage'

type NavItem = 'Dashboard' | 'Schedule' | 'Study Hub' | 'Settings'
const navItems: NavItem[] = ['Dashboard', 'Schedule', 'Study Hub', 'Settings']

// --- Icons ---
const navIcons: Record<NavItem, React.JSX.Element> = {
  Dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  Schedule:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  'Study Hub': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
  Settings:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
}

export default function App() {
  const [activeNav, setActiveNav] = useState<NavItem>('Dashboard')

  // --- Session State ---
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('academix_current_user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('academix_current_user', JSON.stringify(user))
    }
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('academix_current_user')
    setUser(null)
    setActiveNav('Dashboard')
  }

  // --- Unauthenticated View ---
  if (!user) {
    return <AuthPage onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)} />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#eef3fc', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* --- Sidebar --- */}
      <aside style={{ width: 240, minWidth: 240, background: '#ffffff', borderRight: '1px solid #e2eaf8', display: 'flex', flexDirection: 'column', padding: '28px 0', zIndex: 10 }}>
        <div style={{ padding: '0 24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: '#1e293b', letterSpacing: '-0.01em' }}>Academix</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Student Portal</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 12px', marginBottom: 8 }}>Main Menu</div>
          {navItems.map(item => {
            const active = activeNav === item
            return (
              <button key={item} onClick={() => setActiveNav(item)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: active ? '#eff6ff' : 'transparent', color: active ? '#2563eb' : '#64748b', fontWeight: active ? 600 : 400, fontSize: 14, fontFamily: "'Outfit', sans-serif", width: '100%', textAlign: 'left', transition: 'background 0.15s, color 0.15s' }} onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = '#f8faff'; (e.currentTarget as HTMLButtonElement).style.color = '#3b82f6' } }} onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#64748b' } }}>
                <span style={{ opacity: active ? 1 : 0.7 }}>{navIcons[item]}</span>
                {item}
                {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />}
              </button>
            )
          })}
        </nav>

        {/* --- Sidebar Footer & Logout --- */}
        <div style={{ padding: '0 12px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: '#f8faff', border: '1px solid #e2eaf8' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {user.avatarInitials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.fullName}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.major} · {user.year}</div>
            </div>
          </div>

          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 10, border: '1px solid #e2eaf8', background: 'white', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main style={{ flex: 1, overflow: 'auto', padding: '32px 36px', display: 'flex', flexDirection: 'column' }}>
        {activeNav === 'Dashboard' && <Dashboard user={user} setActiveNav={setActiveNav} />}
        {activeNav === 'Schedule' && <Schedule userId={user.id} />}
        {activeNav === 'Study Hub' && <StudyHub userId={user.id} />}
        {activeNav === 'Settings' && <Settings user={user} setUser={setUser} />}
      </main>
    </div>
  )
}