import { useState } from 'react'

// --- Types ---
type FileType = 'pdf' | 'doc' | 'image' | 'ppt' | 'zip'

function FileIcon({ type }: { type: FileType }) {
  const configs = {
    pdf:   { bg: '#fee2e2', stroke: '#dc2626' },
    image: { bg: '#ede9fe', stroke: '#7c3aed' },
    doc:   { bg: '#dbeafe', stroke: '#2563eb' },
    ppt:   { bg: '#ffedd5', stroke: '#ea580c' },
    zip:   { bg: '#d1fae5', stroke: '#059669' },
  }
  const c = configs[type] || configs.doc
  return (
    <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {type === 'image' ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2={type === 'doc' ? '12' : '16'} y2="17" /></svg>
      )}
    </div>
  )
}

// --- Main Dashboard Component ---
export default function Dashboard({ user, setActiveNav }: { user: any, setActiveNav: any }) {
  const [downloadedIds, setDownloadedIds] = useState<Set<number>>(new Set())
  
  // --- Get Dynamic User Schedule ---
  const scheduleKey = `academix_schedule_${user.id}`
  const [myClasses] = useState<any[]>(() => {
    const savedData = localStorage.getItem(scheduleKey);
    return savedData ? JSON.parse(savedData) : [];
  });

  // --- Get Dynamic Recent Uploads ---
  const studyHubKey = `academix_studyhub_${user.id}`
  const [recentUploads] = useState<any[]>(() => {
    const savedData = localStorage.getItem(studyHubKey)
    if (savedData) {
      const folders = JSON.parse(savedData)
      // Flatten all files, sort by ID descending (newest first), take top 5
      return folders.flatMap((f: any) => f.files).sort((a: any, b: any) => b.id - a.id).slice(0, 5)
    }
    return []
  })

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const todaysClasses = myClasses
    .filter(c => c.dayIndex === todayIndex)
    .sort((a, b) => a.startHour - b.startHour);

  const handleDownload = (id: number) => {
    setDownloadedIds(prev => new Set([...prev, id]))
    setTimeout(() => setDownloadedIds(prev => { const n = new Set(prev); n.delete(id); return n }), 2000)
  }

  return (
    <div>
      {/* --- Header --- */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>{dateStr}</div>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Good morning, {user.name} 👋</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'white', border: '1px solid #e2eaf8', borderRadius: 12, fontSize: 13, color: '#64748b' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: '#1e293b' }}>{timeStr}</span>
        </div>
      </div>

      {/* --- Today's Schedule --- */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Today's Schedule</h2>
          <span onClick={() => setActiveNav('Schedule')} style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>View all →</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {todaysClasses.length > 0 ? todaysClasses.map((item) => {
            const endH = item.startHour + Math.floor((item.startMin + item.durationMins) / 60)
            const endM = (item.startMin + item.durationMins) % 60
            const startStr = `${String(item.startHour).padStart(2, '0')}:${String(item.startMin).padStart(2, '0')}`
            const endStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

            return (
              <div key={item.id} style={{ background: 'white', border: '1px solid #e2eaf8', borderRadius: 16, padding: '18px 20px', position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.15s, transform 0.15s', cursor: 'default' }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(59,130,246,0.10)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)' }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: item.color?.border || '#3b82f6', borderRadius: '16px 16px 0 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color?.border || '#3b82f6' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{startStr} – {endStr}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: "'DM Sans', sans-serif", marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.subject}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: item.color?.bg || '#dbeafe', borderRadius: 8 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={item.color?.text || '#1d4ed8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                  <span style={{ fontSize: 11, fontWeight: 600, color: item.color?.text || '#1d4ed8' }}>Room {item.room}</span>
                </div>
              </div>
            )
          }) : (
            <div style={{ padding: '20px', color: '#64748b', fontSize: 14, background: 'white', borderRadius: 16, border: '1px dashed #cbd5e1' }}>No classes today! Take a rest. 🎉</div>
          )}
        </div>
      </section>

      {/* --- Quick Stats --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 36 }}>
        {[{ label: 'Classes Today', value: todaysClasses.length.toString(), sub: 'Scheduled', icon: '📚' }].map((stat, i) => (
          <div key={i} style={{ background: 'white', border: '1px solid #e2eaf8', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 26 }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Recent Uploads --- */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Uploads</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentUploads.length > 0 ? recentUploads.map((item) => {
            const downloaded = downloadedIds.has(item.id)
            return (
              <div key={item.id} style={{ background: 'white', border: '1px solid #e2eaf8', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, transition: 'box-shadow 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(59,130,246,0.08)' }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}>
                <FileIcon type={item.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{item.category}</span><span style={{ color: '#cbd5e1', fontSize: 10 }}>•</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{item.date}</span><span style={{ color: '#cbd5e1', fontSize: 10 }}>•</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{item.size}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <button onClick={() => handleDownload(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: 'none', background: downloaded ? '#d1fae5' : '#eff6ff', color: downloaded ? '#059669' : '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'background 0.2s, color 0.2s', whiteSpace: 'nowrap' }}>
                    {downloaded ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Saved</> : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>Download</>}
                  </button>
                </div>
              </div>
            )
          }) : (
             <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
               No recent uploads. Head to Study Hub to add your materials.
             </div>
          )}
        </div>
      </section>
    </div>
  )
}