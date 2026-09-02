import { useState, useEffect } from 'react'

// --- Constants & Configs ---
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const HOUR_START = 7
export const HOUR_END = 21
export const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i)

export const PERIODS: Record<number, { startH: number, startM: number, endH: number, endM: number }> = {
  1: { startH: 7, startM: 0, endH: 7, endM: 50 },
  2: { startH: 7, startM: 50, endH: 8, endM: 40 },
  3: { startH: 8, startM: 50, endH: 9, endM: 40 },
  4: { startH: 9, startM: 50, endH: 10, endM: 40 },
  5: { startH: 10, startM: 40, endH: 11, endM: 30 },
  6: { startH: 11, startM: 40, endH: 12, endM: 30 },
  7: { startH: 13, startM: 30, endH: 14, endM: 20 },
  8: { startH: 14, startM: 20, endH: 15, endM: 10 },
  9: { startH: 15, startM: 20, endH: 16, endM: 10 },
  10: { startH: 16, startM: 20, endH: 17, endM: 10 },
  11: { startH: 17, startM: 10, endH: 18, endM: 0 },
  12: { startH: 18, startM: 10, endH: 19, endM: 0 },
  13: { startH: 19, startM: 10, endH: 20, endM: 0 },
  14: { startH: 20, startM: 0, endH: 20, endM: 50 },
}

export const palette = {
  blue:   { bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8', label: '#bfdbfe' },
  violet: { bg: '#ede9fe', border: '#c4b5fd', text: '#6d28d9', label: '#ddd6fe' },
  green:  { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', label: '#a7f3d0' },
  amber:  { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', label: '#fde68a' },
  rose:   { bg: '#fce7f3', border: '#f9a8d4', text: '#9d174d', label: '#fbcfe8' },
  sky:    { bg: '#e0f2fe', border: '#7dd3fc', text: '#075985', label: '#bae6fd' },
  orange: { bg: '#ffedd5', border: '#fdba74', text: '#9a3412', label: '#fed7aa' },
  teal:   { bg: '#ccfbf1', border: '#5eead4', text: '#134e4a', label: '#99f6e4' },
}

export function formatHour(h: number) {
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:00 ${ampm}`
}

const CELL_HEIGHT = 64
const TIME_COL_W = 60

// --- Main Schedule Component ---
export default function Schedule({ userId }: { userId: string }) {
  const storageKey = `academix_schedule_${userId}`

  // Starts completely empty for new users
  const [myClasses, setMyClasses] = useState<any[]>(() => {
    const savedData = localStorage.getItem(storageKey);
    return savedData ? JSON.parse(savedData) : []; 
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(myClasses));
  }, [myClasses, storageKey]);

  // --- HÀM ĐỒNG BỘ API SANG BACKEND ---
  const syncToBackend = async (updatedClasses: any[]) => {
    try {
      await fetch('https://academix-portal-1.onrender.com/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, classes: updatedClasses })
      });
      console.log('Đã đồng bộ Lịch học sang Backend!');
    } catch (error) {
      console.error('Lỗi đồng bộ lịch:', error);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    subject: '', room: '', dayIndex: 0,
    startPeriod: 1, endPeriod: 3,
    startMonth: '2026-08', endMonth: '2026-12'
  })

  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // --- Date Math ---
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: startOffset }, (_, i) => i);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = `${monthNames[month]} ${year}`;

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({ subject: '', room: '', dayIndex: 0, startPeriod: 1, endPeriod: 3, startMonth: '2026-08', endMonth: '2026-12' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cls: any) => {
    setEditingId(cls.id)
    setFormData({
      subject: cls.subject, room: cls.room, dayIndex: cls.dayIndex, 
      startPeriod: cls.startPeriod || 1, endPeriod: cls.endPeriod || 3,
      startMonth: cls.startMonth || '2026-08', endMonth: cls.endMonth || '2026-12'
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (formData.endPeriod < formData.startPeriod) { alert("Ending period cannot be earlier than starting period!"); return; }
    const startObj = PERIODS[formData.startPeriod];
    const endObj = PERIODS[formData.endPeriod];
    const durationMins = (endObj.endH * 60 + endObj.endM) - (startObj.startH * 60 + startObj.startM);
    const newClassData = { ...formData, startHour: startObj.startH, startMin: startObj.startM, durationMins: durationMins };

    let updatedClasses;
    if (editingId) {
      updatedClasses = myClasses.map(c => c.id === editingId ? { ...c, ...newClassData } : c);
    } else {
      updatedClasses = [...myClasses, { ...newClassData, id: Date.now(), color: Object.values(palette)[myClasses.length % 8] }];
    }
    
    setMyClasses(updatedClasses);
    syncToBackend(updatedClasses); // Cập nhật sang server
    setIsModalOpen(false);
  }

  const handleDelete = () => {
    if (editingId) {
      const updatedClasses = myClasses.filter(c => c.id !== editingId);
      setMyClasses(updatedClasses);
      syncToBackend(updatedClasses); // Cập nhật sang server
    }
    setIsModalOpen(false)
  }

  const now = new Date()
  const todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1
  const totalGridMinutes = (HOUR_END - HOUR_START) * 60

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* --- Header --- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>{viewMode === 'week' ? 'Weekly Timetable' : 'Monthly Schedule'}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            {viewMode === 'month' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '4px', borderRadius: 8, border: '1px solid #e2eaf8' }}>
                <button onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }}>◀</button>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', minWidth: 110, textAlign: 'center' }}>{monthName}</span>
                <button onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }}>▶</button>
              </div>
            )}
            {viewMode === 'week' && <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Semester 1 · Aug – Dec 2026</p>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
            <button onClick={() => setViewMode('week')} style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: viewMode === 'week' ? 'white' : 'transparent', color: viewMode === 'week' ? '#3b82f6' : '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: viewMode === 'week' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>Week</button>
            <button onClick={() => setViewMode('month')} style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: viewMode === 'month' ? 'white' : 'transparent', color: viewMode === 'month' ? '#3b82f6' : '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: viewMode === 'month' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>Month</button>
          </div>
          <button onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, border: 'none', background: '#3b82f6', color: 'white', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif", cursor: 'pointer', boxShadow: '0 2px 10px rgba(59,130,246,0.3)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Manage Schedule
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', background: 'white', borderRadius: 20, border: '1px solid #e2eaf8', position: 'relative' }}>
        
        {/* --- Empty State --- */}
        {myClasses.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(2px)' }}>
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
             <h3 style={{ fontSize: 18, color: '#475569', margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>Your schedule is empty</h3>
             <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 20px' }}>Click 'Manage Schedule' to add your classes.</p>
             <button onClick={handleOpenAdd} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#f1f5f9', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>+ Add Class</button>
          </div>
        )}

        {viewMode === 'week' ? (
          <div style={{ minWidth: 900 }}>
            <div style={{ display: 'grid', gridTemplateColumns: `${TIME_COL_W}px repeat(7, 1fr)`, borderBottom: '1px solid #e2eaf8', position: 'sticky', top: 0, background: 'white', zIndex: 5 }}>
              <div style={{ padding: '14px 0', borderRight: '1px solid #f1f5f9' }} />
              {DAYS.map((day, di) => {
                const isToday = di === todayIndex
                return (
                  <div key={day} style={{ padding: '14px 10px', textAlign: 'center', borderRight: di < 6 ? '1px solid #f1f5f9' : 'none', background: isToday ? '#eff6ff' : 'transparent' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: isToday ? '#3b82f6' : '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>{DAY_SHORT[di]}</div>
                    {isToday && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', margin: '0 auto' }} />}
                  </div>
                )
              })}
            </div>
            <div style={{ position: 'relative' }}>
              {HOURS.map((h, hi) => (
                <div key={h} style={{ display: 'grid', gridTemplateColumns: `${TIME_COL_W}px repeat(7, 1fr)`, height: CELL_HEIGHT, borderBottom: hi < HOURS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 12, paddingTop: 6, borderRight: '1px solid #e2eaf8', color: '#94a3b8', fontSize: 11, fontWeight: 500, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{formatHour(h)}</div>
                  {DAYS.map((_, di) => <div key={di} style={{ borderRight: di < 6 ? '1px solid #f1f5f9' : 'none', background: di === todayIndex ? 'rgba(239,246,255,0.4)' : 'transparent', position: 'relative' }} />)}
                </div>
              ))}
              {(() => {
                const fixedMinutes = 20 * 60 + 50; 
                const offsetMins = fixedMinutes - HOUR_START * 60;
                if (offsetMins < 0 || offsetMins > totalGridMinutes) return null;
                const topPx = (offsetMins / 60) * CELL_HEIGHT;
                return (
                  <div style={{ position: 'absolute', top: topPx, left: TIME_COL_W, right: 0, height: 2, background: '#ef4444', zIndex: 4, pointerEvents: 'none' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', position: 'absolute', left: -4, top: -3 }} />
                  </div>
                )
              })()}
              
              {/* Lớp bọc bên ngoài đã bỏ thuộc tính 'display: grid' */}
              <div style={{ position: 'absolute', top: 0, left: TIME_COL_W, right: 0, bottom: 0, pointerEvents: 'none' }}>
                {myClasses.map(cls => {
                  const startMins = (cls.startHour - HOUR_START) * 60 + cls.startMin
                  const topPx = (startMins / 60) * CELL_HEIGHT
                  const heightPx = (cls.durationMins / 60) * CELL_HEIGHT
                  const endH = cls.startHour + Math.floor((cls.startMin + cls.durationMins) / 60)
                  const endM = (cls.startMin + cls.durationMins) % 60
                  const endStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
                  const startStr = `${String(cls.startHour).padStart(2, '0')}:${String(cls.startMin).padStart(2, '0')}`
                  const compact = heightPx < 70
                  return (
                    // Khối môn học đã được gỡ bỏ thuộc tính 'gridColumn'
                    <div key={cls.id} onClick={() => handleOpenEdit(cls)} style={{ position: 'absolute', top: topPx + 3, height: heightPx - 6, left: `calc(${cls.dayIndex} * (100% / 7) + 4px)`, width: `calc(100% / 7 - 8px)`, background: cls.color?.bg || palette.blue.bg, border: `1.5px solid ${cls.color?.border || palette.blue.border}`, borderRadius: 10, padding: compact ? '5px 8px' : '8px 10px', overflow: 'hidden', pointerEvents: 'auto', cursor: 'pointer', transition: 'filter 0.15s, transform 0.15s', zIndex: 3 }} onMouseEnter={e => { ;(e.currentTarget as HTMLDivElement).style.filter = 'brightness(0.96)'; ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1.015)'; ;(e.currentTarget as HTMLDivElement).style.zIndex = '10' }} onMouseLeave={e => { ;(e.currentTarget as HTMLDivElement).style.filter = 'none'; ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; ;(e.currentTarget as HTMLDivElement).style.zIndex = '3' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: cls.color?.border || palette.blue.border, borderRadius: '10px 0 0 10px' }} />
                      <div style={{ paddingLeft: 6 }}>
                        <div style={{ fontSize: compact ? 11 : 12, fontWeight: 700, color: cls.color?.text || palette.blue.text, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cls.subject}</div>
                        {!compact && (
                          <>
                            <div style={{ fontSize: 10, color: cls.color?.text || palette.blue.text, opacity: 0.75, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>{cls.room}</div>
                            <div style={{ fontSize: 10, color: cls.color?.text || palette.blue.text, opacity: 0.65, marginTop: 2 }}>{startStr} – {endStr}</div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 800 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e2eaf8', background: '#f8faff', position: 'sticky', top: 0, zIndex: 2 }}>
              {DAYS.map((day, i) => <div key={day} style={{ padding: '12px 10px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderRight: i < 6 ? '1px solid #e2eaf8' : 'none' }}>{day}</div>)}
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(120px, 1fr)' }}>
              {blanksArray.map(b => <div key={`blank-${b}`} style={{ background: '#f8faff', borderRight: '1px solid #e2eaf8', borderBottom: '1px solid #e2eaf8' }} />)}
              {daysArray.map(dayNum => {
                const currentDateObj = new Date(year, month, dayNum);
                const dayIndex = currentDateObj.getDay() === 0 ? 6 : currentDateObj.getDay() - 1;
                const dayClasses = myClasses.filter(c => c.dayIndex === dayIndex).sort((a,b) => a.startHour - b.startHour);
                const isToday = dayNum === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                return (
                  <div key={dayNum} style={{ padding: 8, borderRight: '1px solid #e2eaf8', borderBottom: '1px solid #e2eaf8', background: isToday ? '#eff6ff' : 'white', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: isToday ? '#3b82f6' : 'transparent', color: isToday ? 'white' : '#1e293b', fontSize: 13, fontWeight: isToday ? 700 : 500 }}>{dayNum}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>
                      {dayClasses.map(cls => (
                        <div key={cls.id} onClick={() => handleOpenEdit(cls)} style={{ fontSize: 11, padding: '6px 8px', background: cls.color?.bg || '#dbeafe', color: cls.color?.text || '#1d4ed8', borderLeft: `3px solid ${cls.color?.border || '#3b82f6'}`, borderRadius: 4, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${cls.subject} (Room ${cls.room})`}>
                          <span style={{ fontWeight: 600 }}>{cls.subject}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '28px 32px', borderRadius: 20, width: 420, maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Outfit', sans-serif" }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, fontFamily: "'DM Sans', sans-serif", color: '#0f172a', fontSize: 22 }}>{editingId ? 'Edit Schedule' : 'Add New Class'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Subject Name</label>
                <input value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 15, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Room</label>
                  <input value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 15, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Day of Week</label>
                  <select value={formData.dayIndex} onChange={e => setFormData({...formData, dayIndex: Number(e.target.value)})} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 15, color: '#1e293b', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}>
                    {DAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>From Period</label>
                  <select value={formData.startPeriod} onChange={e => setFormData({...formData, startPeriod: Number(e.target.value)})} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 15, color: '#1e293b', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}>
                    {Object.keys(PERIODS).map((p) => <option key={p} value={p}>Period {p} ({PERIODS[Number(p)].startH}:{String(PERIODS[Number(p)].startM).padStart(2, '0')})</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>To Period</label>
                  <select value={formData.endPeriod} onChange={e => setFormData({...formData, endPeriod: Number(e.target.value)})} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 15, color: '#1e293b', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}>
                    {Object.keys(PERIODS).map((p) => <option key={p} value={p}>Period {p} ({PERIODS[Number(p)].endH}:{String(PERIODS[Number(p)].endM).padStart(2, '0')})</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              {editingId && <button onClick={handleDelete} style={{ marginRight: 'auto', padding: '10px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Delete</button>}
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '10px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}