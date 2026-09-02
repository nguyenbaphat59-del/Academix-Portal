import { useState } from 'react'

type AuthMode = 'signin' | 'signup'

interface AuthPageProps {
  onAuthSuccess: (user: any) => void
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [error, setError] = useState<string>('')
  
  // --- Form States ---
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [nickname, setNickname] = useState('')
  const [major, setMajor] = useState('')
  const [year, setYear] = useState('')

  // --- Helpers ---
  const getRegisteredUsers = () => {
    const data = localStorage.getItem('academix_users')
    return data ? JSON.parse(data) : []
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const users = getRegisteredUsers()
    const existing = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      setError('An account with this email already exists.')
      return
    }

    const initials = fullName.trim().split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2)

    const newUser = {
      id: 'usr_' + Date.now(),
      email: email.trim().toLowerCase(),
      password,
      fullName: fullName.trim(),
      name: nickname.trim() || fullName.trim().split(' ')[0],
      major: major.trim(),
      year,
      avatarInitials: initials,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    localStorage.setItem('academix_users', JSON.stringify(users))
    localStorage.setItem('academix_current_user', JSON.stringify(newUser))

    // --- SENT API TO BACKEND ---
    try {
      await fetch('https://academix-portal-2.onrender.com/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      console.log('Successfully synced User to Backend!');
    } catch (error) {
      console.error('Error connecting to Backend:', error);
    }

    onAuthSuccess(newUser)
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const users = getRegisteredUsers()
    const foundUser = users.find(
      (u: any) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    )

    if (!foundUser) {
      setError('Invalid email or password. Please try again.')
      return
    }

    localStorage.setItem('academix_current_user', JSON.stringify(foundUser))
    onAuthSuccess(foundUser)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#eef3fc', padding: '24px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ background: 'white', border: '1px solid #e2eaf8', borderRadius: 24, padding: '40px', width: '100%', maxWidth: 440, boxShadow: '0 12px 32px rgba(15,23,42,0.05)' }}>
        
        {/* --- Logo Header --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: '#1e293b' }}>Academix</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Student Portal</div>
          </div>
        </div>

        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px', lineHeight: 1.4 }}>
          {mode === 'signin' ? 'Log in to access your timetable and study library.' : 'Sign up to start organizing your university workflow.'}
        </p>

        {/* --- Tab Switcher --- */}
        <div style={{ display: 'flex', background: '#f8faff', padding: 4, borderRadius: 12, border: '1px solid #e2eaf8', marginBottom: 20 }}>
          <button 
            type="button"
            onClick={() => { setMode('signin'); setError('') }} 
            style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: mode === 'signin' ? 'white' : 'transparent', color: mode === 'signin' ? '#3b82f6' : '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: mode === 'signin' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.15s' }}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setMode('signup'); setError('') }} 
            style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: mode === 'signup' ? 'white' : 'transparent', color: mode === 'signup' ? '#3b82f6' : '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: mode === 'signup' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.15s' }}
          >
            Sign Up
          </button>
        </div>

        {/* --- Error Banner --- */}
        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 12, fontWeight: 500, marginBottom: 18 }}>
            {error}
          </div>
        )}

        {/* --- Form Section --- */}
        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Full Name</label>
                <input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. John Doe" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Nickname</label>
                  <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="e.g. John" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Year</label>
                  <select value={year} onChange={e => setYear(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'white' }}>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Major / Course</label>
                <input required value={major} onChange={e => setMajor(e.target.value)} placeholder="e.g. Computer Science" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Email Address</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@university.edu" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" style={{ marginTop: 8, padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', color: 'white', fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)', transition: 'opacity 0.15s' }}>
            {mode === 'signin' ? 'Sign In to Dashboard' : 'Create Account'}
          </button>
        </form>

      </div>
    </div>
  )
}