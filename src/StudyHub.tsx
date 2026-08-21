import { useState, useRef, useEffect } from 'react'

// --- Types ---
type FileEntry = {
  id: number
  name: string
  type: 'pdf' | 'doc' | 'image' | 'ppt' | 'zip'
  category: 'Lecture Notes' | 'Past Exams' | 'Assignments' | 'Textbooks'
  date: string
  size: string
  sizeMB: number 
  starred: boolean
}

type Folder = {
  id: number
  subject: string
  code: string
  color: { bg: string; icon: string; text: string; light: string }
  files: FileEntry[]
}

// --- Colors & Styling ---
const FOLDER_PALETTES = [
  { bg: '#dbeafe', icon: '#2563eb', text: '#1e40af', light: '#eff6ff' },
  { bg: '#d1fae5', icon: '#059669', text: '#065f46', light: '#ecfdf5' },
  { bg: '#ede9fe', icon: '#7c3aed', text: '#5b21b6', light: '#f5f3ff' },
  { bg: '#fef3c7', icon: '#d97706', text: '#92400e', light: '#fffbeb' },
  { bg: '#fce7f3', icon: '#db2777', text: '#9d174d', light: '#fdf2f8' },
  { bg: '#ccfbf1', icon: '#0d9488', text: '#134e4a', light: '#f0fdfa' },
]

const FILE_COLORS: Record<FileEntry['type'], { bg: string; stroke: string; label: string }> = {
  pdf:   { bg: '#fee2e2', stroke: '#dc2626', label: 'PDF'  },
  doc:   { bg: '#dbeafe', stroke: '#2563eb', label: 'DOC'  },
  ppt:   { bg: '#ffedd5', stroke: '#ea580c', label: 'PPT'  },
  image: { bg: '#ede9fe', stroke: '#7c3aed', label: 'IMG'  },
  zip:   { bg: '#d1fae5', stroke: '#059669', label: 'ZIP'  },
}

const CATEGORY_COLORS: Record<FileEntry['category'], { bg: string; text: string }> = {
  'Lecture Notes': { bg: '#dbeafe', text: '#1d4ed8' },
  'Past Exams':    { bg: '#fee2e2', text: '#b91c1c' },
  'Assignments':   { bg: '#fef3c7', text: '#92400e' },
  'Textbooks':     { bg: '#d1fae5', text: '#065f46' },
}

function FileTypeChip({ type }: { type: FileEntry['type'] }) {
  const c = FILE_COLORS[type]
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, background: c.bg }}>
      <FileTypeIcon type={type} size={12} />
      <span style={{ fontSize: 10, fontWeight: 700, color: c.stroke, letterSpacing: '0.05em' }}>{c.label}</span>
    </div>
  )
}

function FileTypeIcon({ type, size = 16 }: { type: FileEntry['type']; size?: number }) {
  const c = FILE_COLORS[type]
  if (type === 'image') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
  )
  if (type === 'ppt') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2={type === 'doc' ? '12' : '16'} y2="17" /></svg>
  )
}

// --- Folder Card Component ---
function FolderCard({ folder, onClick, expanded }: { folder: Folder; onClick: () => void; expanded: boolean }) {
  const totalFiles = folder.files.length
  const totalMB = folder.files.reduce((s, f) => s + f.sizeMB, 0).toFixed(1)

  return (
    <button onClick={onClick} style={{ background: expanded ? folder.color.light : 'white', border: `1.5px solid ${expanded ? folder.color.icon : '#e2eaf8'}`, borderRadius: 16, padding: '20px', textAlign: 'left', cursor: 'pointer', width: '100%', transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.12s', transform: expanded ? 'none' : undefined, fontFamily: "'Outfit', sans-serif" }} onMouseEnter={e => { if (!expanded) { ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; ;(e.currentTarget as HTMLButtonElement).style.borderColor = folder.color.icon } }} onMouseLeave={e => { if (!expanded) { ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#e2eaf8' } }}>
      <div style={{ width: 48, height: 48, borderRadius: 13, background: folder.color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill={folder.color.icon} stroke={folder.color.icon} strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" opacity="0.25" /><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="none" stroke={folder.color.icon} strokeWidth="1.6" />{expanded && <polyline points="9 18 15 12 9 6" stroke={folder.color.icon} strokeWidth="1.8" fill="none" transform="rotate(90 12 12)" />}</svg>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: "'DM Sans', sans-serif", marginBottom: 2, lineHeight: 1.3 }}>{folder.subject}</div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14 }}>{folder.code || 'No Code'}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: 12, color: '#64748b' }}>{totalFiles} file{totalFiles !== 1 ? 's' : ''}</span><span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>{totalMB} MB</span></div>
    </button>
  )
}

function FileRow({ file, accentColor, onStar, onDownload, onDelete, downloaded }: { file: FileEntry, accentColor: string, onStar: (id: number) => void, onDownload: (id: number) => void, onDelete: () => void, downloaded: boolean }) {
  const cat = CATEGORY_COLORS[file.category]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 150px 130px 140px', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', gap: 12, transition: 'background 0.1s' }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#fafcff' }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: FILE_COLORS[file.type].bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileTypeIcon type={file.type} size={16} /></div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}><FileTypeChip type={file.type} /><span style={{ fontSize: 10, color: '#94a3b8' }}>{file.size}</span></div>
        </div>
      </div>
      <div><span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 6, background: cat.bg, fontSize: 11, fontWeight: 600, color: cat.text }}>{file.category}</span></div>
      <div style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{file.date}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0, color: '#f87171', transition: 'color 0.15s' }} title="Delete file" onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')} onMouseLeave={e => (e.currentTarget.style.color = '#f87171')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
        </button>
        <button onClick={() => onStar(file.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0, color: file.starred ? '#f59e0b' : '#cbd5e1', transition: 'color 0.15s' }} title={file.starred ? 'Unstar' : 'Star'}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill={file.starred ? '#f59e0b' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
        </button>
        <button onClick={() => onDownload(file.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: 'none', background: downloaded ? '#d1fae5' : accentColor + '18', color: downloaded ? '#059669' : accentColor, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'background 0.2s, color 0.2s', whiteSpace: 'nowrap' }}>
          {downloaded ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Saved</> : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>Download</>}
        </button>
      </div>
    </div>
  )
}

function FolderFileList({ folder, onStar, downloadedIds, onDownload, onDelete }: { folder: Folder, onStar: (folderId: number, fileId: number) => void, downloadedIds: Set<number>, onDownload: (fileId: number) => void, onDelete: (folderId: number, fileId: number) => void }) {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const categories = ['All', ...Array.from(new Set(folder.files.map(f => f.category)))]
  const filtered = activeCategory === 'All' ? folder.files : folder.files.filter(f => f.category === activeCategory)

  return (
    <div style={{ background: 'white', border: `1.5px solid ${folder.color.icon}`, borderRadius: 16, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: folder.color.light }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: folder.color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={folder.color.icon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div>
          <span style={{ fontSize: 14, fontWeight: 700, color: folder.color.text, fontFamily: "'DM Sans', sans-serif" }}>{folder.subject}</span><span style={{ fontSize: 11, color: '#94a3b8' }}>{folder.code}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '4px 11px', borderRadius: 7, border: activeCategory === cat ? `1.5px solid ${folder.color.icon}` : '1.5px solid #e2eaf8', background: activeCategory === cat ? folder.color.bg : 'white', color: activeCategory === cat ? folder.color.text : '#64748b', fontSize: 11, fontWeight: activeCategory === cat ? 700 : 400, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'all 0.12s' }}>{cat}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 150px 130px 140px', padding: '9px 20px', borderBottom: '1px solid #e2eaf8', background: '#fafcff', gap: 12 }}>
        {['File Name', 'Category', 'Date', ''].map((h, i) => <div key={i} style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: i === 3 ? 'right' : 'left' }}>{h}</div>)}
      </div>
      {filtered.map(file => <FileRow key={file.id} file={file} accentColor={folder.color.icon} onStar={() => onStar(folder.id, file.id)} onDownload={onDownload} onDelete={() => onDelete(folder.id, file.id)} downloaded={downloadedIds.has(file.id)} />)}
      {filtered.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No files in this category yet.</div>}
    </div>
  )
}

// --- Upload Modal ---
function UploadModal({ onClose, folders, onUploadSuccess }: { onClose: () => void, folders: Folder[], onUploadSuccess: (file: FileEntry, folderId: number) => void }) {
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [folderId, setFolderId] = useState('')
  const [category, setCategory] = useState('')
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0])
  }

  const handleUpload = () => {
    if (!selectedFile || !folderId || !category) return
    setUploading(true)
    
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || ''
    let type: FileEntry['type'] = 'doc'
    if (ext === 'pdf') type = 'pdf'
    else if (['png','jpg','jpeg'].includes(ext)) type = 'image'
    else if (['ppt','pptx'].includes(ext)) type = 'ppt'
    else if (ext === 'zip') type = 'zip'

    const sizeMB = selectedFile.size / (1024 * 1024)
    const sizeStr = sizeMB > 1 ? `${sizeMB.toFixed(1)} MB` : `${(selectedFile.size / 1024).toFixed(0)} KB`

    const newFile: FileEntry = {
      id: Date.now(),
      name: selectedFile.name,
      type,
      category: category as any,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      size: sizeStr,
      sizeMB: Number(sizeMB.toFixed(1)),
      starred: false
    }

    setTimeout(() => { 
      setUploading(false)
      setDone(true)
      onUploadSuccess(newFile, Number(folderId))
      setTimeout(onClose, 1000)
    }, 1200)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '32px', width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>Upload Material</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 24px' }}>Add new study resources to your personal drive.</p>
        
        <div onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => inputRef.current?.click()} style={{ border: `2px dashed ${dragging ? '#3b82f6' : selectedFile ? '#059669' : '#e2eaf8'}`, borderRadius: 14, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', background: dragging ? '#eff6ff' : selectedFile ? '#ecfdf5' : '#fafcff', transition: 'all 0.15s', marginBottom: 20 }}>
          <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]) }} />
          {selectedFile ? (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>{selectedFile.name}</div>
            </>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px' }}><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Drop your file here, or <span style={{ color: '#3b82f6' }}>browse</span></div>
            </>
          )}
        </div>
        
        <select value={folderId} onChange={e => setFolderId(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2eaf8', fontSize: 13, color: '#475569', marginBottom: 12, fontFamily: "'Outfit', sans-serif", background: 'white', outline: 'none' }}>
          <option value="">Select subject folder…</option>
          {folders.map(f => <option key={f.id} value={f.id}>{f.subject}</option>)}
        </select>
        
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2eaf8', fontSize: 13, color: '#475569', marginBottom: 20, fontFamily: "'Outfit', sans-serif", background: 'white', outline: 'none' }}>
          <option value="">Select category…</option>
          {['Lecture Notes', 'Past Exams', 'Assignments', 'Textbooks'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <button onClick={handleUpload} disabled={!selectedFile || !folderId || !category || uploading || done} style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: done ? '#d1fae5' : (!selectedFile || !folderId || !category) ? '#e2e8f0' : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', color: done ? '#059669' : (!selectedFile || !folderId || !category) ? '#94a3b8' : 'white', fontSize: 14, fontWeight: 700, cursor: (selectedFile && folderId && category && !uploading && !done) ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {done ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Uploaded successfully!</> : uploading ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.9s linear infinite' }}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>Uploading…</> : 'Upload Material'}
        </button>
      </div>
    </div>
  )
}

// --- Add Subject Modal ---
function AddSubjectModal({ onClose, onAdd }: { onClose: () => void, onAdd: (name: string, code: string) => void }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim(), code.trim())
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '32px', width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative' }}>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>Add New Subject</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 24px' }}>Create a new folder to organize your materials.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Subject Name</label>
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Machine Learning" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Subject Code (Optional)</label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. CS 401" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2eaf8', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 18px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Create Folder</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// --- Main StudyHub Application ---
export default function StudyHub({ userId }: { userId: string }) {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [downloadedIds, setDownloadedIds] = useState<Set<number>>(new Set())

  // --- Dynamic Storage for User (Now starts completely empty: []) ---
  const storageKey = `academix_studyhub_${userId}`
  const [folderData, setFolderData] = useState<Folder[]>(() => {
    const savedData = localStorage.getItem(storageKey);
    return savedData ? JSON.parse(savedData) : []; 
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(folderData));
  }, [folderData, storageKey]);

  // --- Actions ---
  const handleAddSubject = (name: string, code: string) => {
    const newFolder: Folder = {
      id: Date.now(),
      subject: name,
      code,
      color: FOLDER_PALETTES[folderData.length % FOLDER_PALETTES.length],
      files: []
    }
    setFolderData(prev => [...prev, newFolder])
  }

  const handleStar = (folderId: number, fileId: number) => {
    setFolderData(prev => prev.map(f => f.id !== folderId ? f : { ...f, files: f.files.map(file => file.id === fileId ? { ...file, starred: !file.starred } : file) }))
  }

  const handleDeleteFile = (folderId: number, fileId: number) => {
    if (window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      setFolderData(prev => prev.map(f => f.id !== folderId ? f : { ...f, files: f.files.filter(file => file.id !== fileId) }))
    }
  }

  const handleDownload = (fileId: number) => {
    setDownloadedIds(prev => new Set([...prev, fileId]))
    setTimeout(() => setDownloadedIds(prev => { const n = new Set(prev); n.delete(fileId); return n }), 2500)
  }

  const handleUploadSuccess = (newFile: FileEntry, folderId: number) => {
    setFolderData(prev => prev.map(f => f.id === folderId ? { ...f, files: [newFile, ...f.files] } : f))
  }

  const query = search.toLowerCase()
  const filteredFolders = folderData.filter(f => f.subject.toLowerCase().includes(query) || f.code.toLowerCase().includes(query) || f.files.some(file => file.name.toLowerCase().includes(query)))
  const expandedFolder = expandedId !== null ? folderData.find(f => f.id === expandedId) : null
  const totalFiles = folderData.reduce((s, f) => s + f.files.length, 0)
  const totalMB = folderData.reduce((s, f) => s + f.files.reduce((ss, ff) => ss + ff.sizeMB, 0), 0).toFixed(1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* --- Action Bar --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexShrink: 0 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search subjects or files…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '13px 16px 13px 44px', borderRadius: 13, border: '1.5px solid #e2eaf8', background: 'white', fontSize: 14, color: '#0f172a', fontFamily: "'Outfit', sans-serif", outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box' }} onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.10)' }} onBlur={e => { e.target.style.borderColor = '#e2eaf8'; e.target.style.boxShadow = 'none' }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: '#e2e8f0', border: 'none', borderRadius: 6, width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>}
        </div>
        
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={() => setShowAddSubject(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 18px', borderRadius: 13, border: '1px solid #e2eaf8', background: 'white', color: '#475569', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8faff')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Subject
          </button>
          <button onClick={() => { if(folderData.length === 0) { alert("Please add a Subject folder first!"); return; } setShowUpload(true) }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 13, border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', color: 'white', fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', boxShadow: '0 2px 14px rgba(99,102,241,0.30)', whiteSpace: 'nowrap', transition: 'opacity 0.15s, transform 0.12s' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.92'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Upload Material
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexShrink: 0 }}>
        {[ { label: 'Subjects', value: folderData.length }, { label: 'Total Files', value: totalFiles }, { label: 'MB Used', value: totalMB } ].map(stat => (
          <div key={stat.label} style={{ background: 'white', border: '1px solid #e2eaf8', borderRadius: 12, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', fontFamily: "'DM Sans', sans-serif" }}>{stat.value}</span><span style={{ fontSize: 12, color: '#94a3b8' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14, flexShrink: 0 }}>
        {search ? `${filteredFolders.length} result${filteredFolders.length !== 1 ? 's' : ''} for "${search}"` : 'All Subjects'}
      </div>

      {/* --- Main Content --- */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        
        {folderData.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Your Study Hub is empty</div>
            <div style={{ fontSize: 14, marginBottom: 20 }}>Click "Add Subject" to create your first folder.</div>
            <button onClick={() => setShowAddSubject(true)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#f1f5f9', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>+ Add Subject</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
            {filteredFolders.map(folder => <FolderCard key={folder.id} folder={folder} expanded={expandedId === folder.id} onClick={() => setExpandedId(expandedId === folder.id ? null : folder.id)} />)}
          </div>
        )}

        {expandedFolder && <FolderFileList folder={expandedFolder} onStar={handleStar} downloadedIds={downloadedIds} onDownload={handleDownload} onDelete={handleDeleteFile} />}

        {filteredFolders.length === 0 && search && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#475569', marginBottom: 4 }}>No results found</div>
            <div style={{ fontSize: 13 }}>Try searching for a subject name or file title.</div>
          </div>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} folders={folderData} onUploadSuccess={handleUploadSuccess} />}
      {showAddSubject && <AddSubjectModal onClose={() => setShowAddSubject(false)} onAdd={handleAddSubject} />}
    </div>
  )
}