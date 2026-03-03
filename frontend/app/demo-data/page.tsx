'use client'
import { useState } from 'react'
import { DEMO_PERSONS, DEMO_MEDICINES, DEMO_EVENTS, DEMO_BIRTHDAYS, DEMO_REMINDERS } from '@/lib/demoData'
import type { Person, Medicine, SchoolEvent, Reminder } from '@/lib/types'

// ── In-memory live state for demo editing ─────────────────────────────────────
// (Resets on page reload — for a full demo without a database)

type Tab = 'family' | 'medicines' | 'events' | 'reminders'

export default function DemoDataPage() {
    const [tab, setTab] = useState<Tab>('family')
    const [persons, setPersons] = useState<typeof DEMO_PERSONS>([...DEMO_PERSONS])
    const [medicines, setMedicines] = useState<Medicine[]>([...DEMO_MEDICINES])
    const [events, setEvents] = useState<SchoolEvent[]>([...DEMO_EVENTS])
    const [reminders, setReminders] = useState<Reminder[]>([...DEMO_REMINDERS])
    const [editId, setEditId] = useState<string | null>(null)
    const [showAdd, setShowAdd] = useState(false)
    const [saved, setSaved] = useState<string | null>(null)

    const flash = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(null), 2500) }

    // ── Family ─────────────────────────────────────────────────────────────────

    const PersonRow = ({ p }: { p: typeof DEMO_PERSONS[0] }) => {
        const [editing, setEditing] = useState(editId === p.id)
        const [form, setForm] = useState({ ...p })

        const save = () => {
            setPersons(prev => prev.map(x => x.id === p.id ? { ...form } : x))
            setEditId(null)
            flash(`✅ ${form.name} updated`)
        }
        const del = () => {
            setPersons(prev => prev.filter(x => x.id !== p.id))
            flash(`🗑️ ${p.name} removed`)
        }

        return (
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                {editing ? (
                    <>
                        <td style={tdStyle}><input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></td>
                        <td style={tdStyle}><input className="input-field" value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))} /></td>
                        <td style={tdStyle}><input className="input-field" type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} /></td>
                        <td style={tdStyle}><input className="input-field" type="number" value={form.gift_budget} onChange={e => setForm(f => ({ ...f, gift_budget: Number(e.target.value) }))} /></td>
                        <td style={tdStyle}><input className="input-field" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></td>
                        <td style={tdStyle}>
                            <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={save}>Save</button>
                            <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', marginLeft: '6px' }} onClick={() => setEditId(null)}>Cancel</button>
                        </td>
                    </>
                ) : (
                    <>
                        <td style={tdStyle}><strong style={{ color: '#1c1917' }}>{p.name}</strong></td>
                        <td style={tdStyle}><span className="badge badge-rose">{p.relation}</span></td>
                        <td style={tdStyle} className="text-muted">{p.birthday}</td>
                        <td style={tdStyle}>₹{p.gift_budget?.toLocaleString('en-IN')}</td>
                        <td style={tdStyle} className="text-muted">{p.phone || '—'}</td>
                        <td style={tdStyle}>
                            <button className="btn-secondary" style={{ fontSize: '11px', padding: '5px 10px' }} onClick={() => { setEditId(p.id); setEditing(true) }}>✏️ Edit</button>
                            <button style={{ fontSize: '11px', padding: '5px 10px', marginLeft: '6px', background: '#fff1f4', border: '1px solid #fecdd3', borderRadius: '8px', color: '#be123c', cursor: 'pointer' }} onClick={del}>🗑️</button>
                        </td>
                    </>
                )}
            </tr>
        )
    }

    const AddPersonRow = () => {
        const [form, setForm] = useState({ name: '', relation: 'Friend', birthday: '', gift_budget: 2000, phone: '', days_until_birthday: 365 })
        const save = () => {
            setPersons(prev => [...prev, { ...form, id: 'new_' + Date.now() }])
            setShowAdd(false)
            flash(`✅ ${form.name} added`)
        }
        return (
            <tr style={{ background: '#fdf8f5', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <td style={tdStyle}><input className="input-field" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></td>
                <td style={tdStyle}><input className="input-field" placeholder="Relation" value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))} /></td>
                <td style={tdStyle}><input className="input-field" type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} /></td>
                <td style={tdStyle}><input className="input-field" type="number" value={form.gift_budget} onChange={e => setForm(f => ({ ...f, gift_budget: Number(e.target.value) }))} /></td>
                <td style={tdStyle}><input className="input-field" placeholder="+91..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></td>
                <td style={tdStyle}>
                    <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={save} disabled={!form.name || !form.birthday}>+ Add</button>
                    <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 10px', marginLeft: '6px' }} onClick={() => setShowAdd(false)}>✕</button>
                </td>
            </tr>
        )
    }

    // ── Medicine quick-edit ────────────────────────────────────────────────────

    const MedicineRow = ({ m }: { m: Medicine }) => {
        const [editing, setEditing] = useState(false)
        const [form, setForm] = useState({ ...m })
        const save = () => { setMedicines(prev => prev.map(x => x.id === m.id ? { ...form } : x)); setEditing(false); flash(`✅ ${form.name} updated`) }
        const del = () => { setMedicines(prev => prev.filter(x => x.id !== m.id)); flash(`🗑️ ${m.name} removed`) }
        return (
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                {editing ? (
                    <>
                        <td style={tdStyle}><input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></td>
                        <td style={tdStyle}><input className="input-field" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} /></td>
                        <td style={tdStyle}><input className="input-field" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} /></td>
                        <td style={tdStyle}><input className="input-field" type="number" value={form.pills_remaining} onChange={e => setForm(f => ({ ...f, pills_remaining: Number(e.target.value) }))} /></td>
                        <td style={tdStyle}><input className="input-field" value={form.prescribed_for} onChange={e => setForm(f => ({ ...f, prescribed_for: e.target.value }))} /></td>
                        <td style={tdStyle}>
                            <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={save}>Save</button>
                            <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 10px', marginLeft: '6px' }} onClick={() => setEditing(false)}>Cancel</button>
                        </td>
                    </>
                ) : (
                    <>
                        <td style={tdStyle}><strong style={{ color: '#1c1917' }}>{m.name}</strong></td>
                        <td style={tdStyle}>{m.dosage}</td>
                        <td style={tdStyle}><span className="tag">{m.frequency}</span></td>
                        <td style={tdStyle}>
                            <span className={m.pills_remaining <= 5 ? 'badge badge-red' : m.pills_remaining <= 10 ? 'badge badge-amber' : 'badge badge-green'}>
                                {m.pills_remaining} left
                            </span>
                        </td>
                        <td style={tdStyle} className="text-muted">{m.prescribed_for}</td>
                        <td style={tdStyle}>
                            <button className="btn-secondary" style={{ fontSize: '11px', padding: '5px 10px' }} onClick={() => setEditing(true)}>✏️ Edit</button>
                            <button style={{ fontSize: '11px', padding: '5px 10px', marginLeft: '6px', background: '#fff1f4', border: '1px solid #fecdd3', borderRadius: '8px', color: '#be123c', cursor: 'pointer' }} onClick={del}>🗑️</button>
                        </td>
                    </>
                )}
            </tr>
        )
    }

    // ── School event quick-edit ───────────────────────────────────────────────

    const EventRow = ({ e }: { e: SchoolEvent }) => {
        const [editing, setEditing] = useState(false)
        const [form, setForm] = useState({ ...e })
        const save = () => { setEvents(prev => prev.map(x => x.id === e.id ? { ...form } : x)); setEditing(false); flash(`✅ ${form.event_name} updated`) }
        const del = () => { setEvents(prev => prev.filter(x => x.id !== e.id)); flash(`🗑️ ${e.event_name} removed`) }
        return (
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                {editing ? (
                    <>
                        <td style={tdStyle}><input className="input-field" value={form.event_name} onChange={e2 => setForm(f => ({ ...f, event_name: e2.target.value }))} /></td>
                        <td style={tdStyle}><input className="input-field" type="date" value={form.event_date} onChange={e2 => setForm(f => ({ ...f, event_date: e2.target.value }))} /></td>
                        <td style={tdStyle}><input className="input-field" type="number" placeholder="0 = no fee" value={form.fee_amount ?? ''} onChange={e2 => setForm(f => ({ ...f, fee_amount: e2.target.value ? Number(e2.target.value) : undefined }))} /></td>
                        <td style={tdStyle}><input className="input-field" value={form.special_instructions || ''} onChange={e2 => setForm(f => ({ ...f, special_instructions: e2.target.value }))} /></td>
                        <td style={tdStyle}>
                            <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={save}>Save</button>
                            <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 10px', marginLeft: '6px' }} onClick={() => setEditing(false)}>Cancel</button>
                        </td>
                    </>
                ) : (
                    <>
                        <td style={tdStyle}><strong style={{ color: '#1c1917' }}>{e.event_name}</strong></td>
                        <td style={tdStyle}>{e.event_date}</td>
                        <td style={tdStyle}>{e.fee_amount ? <span className={e.fee_paid ? 'badge badge-green' : 'badge badge-amber'}>₹{e.fee_amount} {e.fee_paid ? '✓' : 'due'}</span> : <span className="text-muted">—</span>}</td>
                        <td style={tdStyle} className="text-muted">{e.special_instructions || '—'}</td>
                        <td style={tdStyle}>
                            <button className="btn-secondary" style={{ fontSize: '11px', padding: '5px 10px' }} onClick={() => setEditing(true)}>✏️ Edit</button>
                            <button style={{ fontSize: '11px', padding: '5px 10px', marginLeft: '6px', background: '#fff1f4', border: '1px solid #fecdd3', borderRadius: '8px', color: '#be123c', cursor: 'pointer' }} onClick={del}>🗑️</button>
                        </td>
                    </>
                )}
            </tr>
        )
    }

    const tabs: { id: Tab; label: string; icon: string; count: number }[] = [
        { id: 'family', label: 'Family Members', icon: '👨‍👩‍👧', count: persons.length },
        { id: 'medicines', label: 'Medicines', icon: '💊', count: medicines.length },
        { id: 'events', label: 'School Events', icon: '🏫', count: events.length },
        { id: 'reminders', label: 'Reminders', icon: '🔔', count: reminders.length },
    ]

    return (
        <div style={{ padding: '32px', maxWidth: '1200px' }}>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1c1917', fontFamily: 'Plus Jakarta Sans', marginBottom: '6px' }}>
                    🗂️ Demo Data Editor
                </h1>
                <p style={{ color: '#78716c', fontSize: '15px' }}>
                    Insert, update, or delete demo data. Changes stay active for this session.
                </p>
            </div>

            {/* Save flash */}
            {saved && (
                <div className="alert-banner alert-success" style={{ marginBottom: '16px', animation: 'fadeInUp 0.3s ease' }}>
                    {saved}
                </div>
            )}

            <div style={{ padding: '4px', background: '#fdf8f5', borderRadius: '12px', display: 'inline-flex', gap: '4px', marginBottom: '20px', border: '1px solid rgba(0,0,0,0.07)' }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                        padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                        transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: '6px',
                        background: tab === t.id ? '#fff' : 'transparent',
                        color: tab === t.id ? '#1c1917' : '#78716c',
                        boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    }}>
                        {t.icon} {t.label} <span className={tab === t.id ? 'badge badge-rose' : 'badge badge-blue'} style={{ fontSize: '10px', padding: '1px 7px' }}>{t.count}</span>
                    </button>
                ))}
            </div>

            {/* ── Family Tab ─────────────────────────── */}
            {tab === 'family' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <span style={{ fontWeight: 700, color: '#1c1917', fontSize: '15px' }}>Family Members</span>
                        <button className="btn-primary" style={{ fontSize: '12px', padding: '7px 14px' }} onClick={() => setShowAdd(true)}>+ Add Person</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#fdf8f5' }}>
                                    {['Name', 'Relation', 'Birthday', 'Budget', 'Phone', 'Actions'].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {showAdd && <AddPersonRow />}
                                {persons.map(p => <PersonRow key={p.id} p={p} />)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Medicines Tab ───────────────────────── */}
            {tab === 'medicines' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#1c1917', fontSize: '15px' }}>Active Medicines</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#fdf8f5' }}>
                                    {['Medicine', 'Dosage', 'Frequency', 'Pills Left', 'Prescribed For', 'Actions'].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.map(m => <MedicineRow key={m.id} m={m} />)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Events Tab ─────────────────────────── */}
            {tab === 'events' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#1c1917', fontSize: '15px' }}>School Events</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#fdf8f5' }}>
                                    {['Event', 'Date', 'Fee', 'Instructions', 'Actions'].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(e => <EventRow key={e.id} e={e} />)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Reminders Tab ─────────────────────── */}
            {tab === 'reminders' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <span style={{ fontWeight: 700, color: '#1c1917', fontSize: '15px' }}>Active Reminders</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#fdf8f5' }}>
                                    {['Title', 'Type', 'Priority', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {reminders.map(r => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={tdStyle}><strong style={{ color: '#1c1917', fontSize: '13px' }}>{r.title}</strong><div style={{ fontSize: '11px', color: '#78716c', marginTop: '2px' }}>{r.body}</div></td>
                                        <td style={tdStyle}><span className="badge badge-blue">{r.type}</span></td>
                                        <td style={tdStyle}><span className={`badge badge-${r.priority === 'high' ? 'red' : r.priority === 'medium' ? 'amber' : 'green'}`}>{r.priority}</span></td>
                                        <td style={tdStyle}><span className={`badge badge-${r.status === 'pending' ? 'amber' : 'green'}`}>{r.status}</span></td>
                                        <td style={tdStyle}>
                                            <button style={{ fontSize: '11px', padding: '5px 10px', background: '#fff1f4', border: '1px solid #fecdd3', borderRadius: '8px', color: '#be123c', cursor: 'pointer' }}
                                                onClick={() => { setReminders(prev => prev.filter(x => x.id !== r.id)); flash(`🗑️ Reminder removed`) }}>
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="alert-banner alert-info" style={{ marginTop: '24px', fontSize: '13px' }}>
                💡 Changes here update the in-memory demo state for this session. For permanent changes, edit <code style={{ background: 'rgba(14,165,233,0.1)', borderRadius: '4px', padding: '1px 5px' }}>frontend/lib/demoData.ts</code> and the server <code style={{ background: 'rgba(14,165,233,0.1)', borderRadius: '4px', padding: '1px 5px' }}>database/seed_demo.sql</code>.
            </div>
        </div>
    )
}

const thStyle: React.CSSProperties = {
    padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700,
    color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
}

const tdStyle: React.CSSProperties = {
    padding: '12px 16px', verticalAlign: 'middle', fontSize: '13px', color: '#44403c',
}
