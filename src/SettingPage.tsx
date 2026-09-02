import { useState } from 'react'

// --- Reusable UI Components ---
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e2eaf8', borderRadius: 20, overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
      {children}
    </div>
  )
}

function CardHeader({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: '#f8faff', border: '1px solid #e2eaf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>{title}</h3>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{subtitle}</p>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', background: on ? '#3b82f6' : '#cbd5e1', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0, flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: on ? 25 : 3, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
    </button>
  )
}

// --- Main Settings Component ---
export default function SettingPage({ user, setUser }: { user: any; setUser: any }) {
  const [name, setName] = useState(user.name || '')
  const [fullName, setFullName] = useState(user.fullName || '')
  const [major, setMajor] = useState(user.major || '')
  const [year, setYear] = useState(user.year || 'Year 2')
  const [email, setEmail] = useState(user.email || '')
  
  const [saved, setSaved] = useState(false)
  
  const [emailNotifs, setEmailNotifs] = useState(true)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    const initials = fullName.trim().split(' ').filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    const updated = { ...user, name, fullName, major, year, email, avatarInitials: initials }
    
    setUser(updated)
    localStorage.setItem('academix_current_user', JSON.stringify(updated))

    const allUsers = JSON.parse(localStorage.getItem('academix_users') || '[]')
    const newAll = allUsers.map((u: any) => u.id === user.id ? updated : u)
    localStorage.setItem('academix_users', JSON.stringify(newAll))

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleEmailToggle = async (val: boolean) => {
    setEmailNotifs(val);
    try {
      await fetch('https://academix-portal-1.onrender.com/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, emailNotifs: val })
      });
      console.log('Đã cập nhật trạng thái thông báo xuống Server!');
    } catch (e) { 
      console.error('Lỗi API Settings:', e) 
    }
  };

  return (
    <div style={{ maxWidth: 820, width: '100%', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 26, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Manage your profile information and notification preferences.</p>
      </div>

      {saved && (
        <div style={{ padding: '12px 18px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, color: '#065f46', fontSize: 13, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Changes saved successfully!
        </div>
      )}

      {/* --- Public Profile Section --- */}
      <Card>
        <CardHeader title="Public Profile" subtitle="Update your personal information visible across the portal." icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>} />
        
        <form onSubmit={handleSaveProfile} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="Full Name" value={fullName} onChange={setFullName} placeholder="John Doe" />
            <Field label="Nickname" value={name} onChange={setName} placeholder="John" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="Major / Course" value={major} onChange={setMajor} placeholder="Computer Science" />
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Year of Study</label>
              <select value={year} onChange={e => setYear(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 14, color: '#1e293b', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
              </select>
            </div>
          </div>

          <Field label="Email Address" value={email} onChange={setEmail} type="email" placeholder="name@university.edu" />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" style={{ padding: '11px 22px', borderRadius: 12, border: 'none', background: '#3b82f6', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 10px rgba(59,130,246,0.3)', fontFamily: "'Outfit', sans-serif" }}>
              Save Changes
            </button>
          </div>
        </form>
      </Card>

      {/* --- Preferences Section --- */}
      <Card>
        <CardHeader title="Preferences" subtitle="Customize automated schedule notifications." icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>} />
        
        <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f8faff', border: '1px solid #e2eaf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </div>
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Schedule Email Notifications</span>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Receive reminders at 21:00 the day before and 1 hour before class.</div>
            </div>
          </div>
          <Toggle on={emailNotifs} onChange={handleEmailToggle} />
        </div>

        <div style={{ padding: '14px 28px', background: '#f8faff', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Preferences take effect immediately and sync with your account.</span>
        </div>
      </Card>
    </div>
  )
}