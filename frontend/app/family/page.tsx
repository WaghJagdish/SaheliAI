'use client'
import useSWR, { mutate } from 'swr'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetcher, familyApi } from '@/lib/api'
import type { Person, BirthdayEvent, GiftSuggestion } from '@/lib/types'
import { DEMO_PERSONS, DEMO_BIRTHDAYS } from '@/lib/demoData'
import { isDemoUser, getLoggedInUser } from '@/lib/userUtils'

function PersonCard({ person, onAction }: {
    person: any
    onAction: (id: string, name: string) => void
}) {
    const daysUntil = person.days_until_birthday ?? 999
    const urgency = daysUntil <= 3 ? 'pill-rose' : daysUntil <= 14 ? 'pill-amber' : 'pill-plum'
    const avatarHue = person.name.charCodeAt(0) * 5 % 360

    return (
        <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                    background: `linear-gradient(135deg, hsl(${avatarHue},60%,42%), hsl(${(avatarHue + 40) % 360},60%,32%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 700, color: 'white',
                }}>
                    {person.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1118', marginBottom: 2 }}>{person.name}</div>
                    <div style={{ fontSize: 12, color: '#8b7d97' }}>{person.relation}</div>
                </div>
                {daysUntil <= 30 && (
                    <span className={`pill ${urgency}`} style={{ fontSize: 11, flexShrink: 0 }}>
                        {daysUntil === 0 ? 'Today!' : `${daysUntil}d`}
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <span className="tag">{person.birthday?.replace(/^\d{4}-/, '').replace('-', '/')}</span>
                {person.gift_budget && <span className="tag">₹{person.gift_budget.toLocaleString('en-IN')}</span>}
            </div>

            {daysUntil <= 30 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => onAction(person.id, person.name)} style={{ flex: 1 }}>
                        🎁 Gift Ideas
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => onAction(person.id, person.name)} style={{ flex: 1 }}>
                        💬 Message
                    </button>
                </div>
            )}
        </div>
    )
}

function GiftSheet({ personId, personName, onClose }: { personId: string; personName: string; onClose: () => void }) {
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([])
    const [message, setMessage] = useState('')
    const [tab, setTab] = useState<'gifts' | 'message'>('gifts')

    const fetchSuggestions = async () => {
        setLoading(true)
        try { const d = await familyApi.generateGiftSuggestions(personId); setSuggestions(d.suggestions || []) }
        finally { setLoading(false) }
    }
    const fetchMessage = async () => {
        setLoading(true)
        try { const d = await familyApi.generateBirthdayMessage(personId); setMessage(d.message || '') }
        finally { setLoading(false) }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1118' }}>🎂 {personName}</h2>
                    <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ minHeight: 'auto', padding: '6px 10px' }}>×</button>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {(['gifts', 'message'] as const).map(t => (
                        <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setTab(t)}>
                            {t === 'gifts' ? '🎁 Gift Ideas' : '💬 Message'}
                        </button>
                    ))}
                </div>

                {tab === 'gifts' && (
                    <div>
                        {suggestions.length === 0 ? (
                            <button className="btn btn-primary btn-full" onClick={fetchSuggestions} disabled={loading}>
                                {loading ? 'Generating...' : 'Generate Gift Suggestions'}
                            </button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {suggestions.map((g, i) => (
                                    <div key={i} style={{ background: '#f5f0ed', borderRadius: 12, padding: 14 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1118', marginBottom: 4 }}>{g.name}</div>
                                        <div style={{ fontSize: 12, color: '#8b7d97', marginBottom: 8 }}>{g.description}</div>
                                        <span className="pill pill-teal">₹{g.price?.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {tab === 'message' && (
                    <div>
                        {!message ? (
                            <button className="btn btn-primary btn-full" onClick={fetchMessage} disabled={loading}>
                                {loading ? 'Drafting...' : 'Generate Birthday Message'}
                            </button>
                        ) : (
                            <div>
                                <div style={{ background: '#f5f0ed', borderRadius: 12, padding: 16, marginBottom: 12, fontSize: 14, color: '#4a3d56', lineHeight: 1.7, fontStyle: 'italic' }}>
                                    &ldquo;{message}&rdquo;
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(message)}>
                                    Copy to Clipboard
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function AddPersonSheet({ onClose, onSuccess }: { onClose: () => void; onSuccess: (localPerson?: any) => void }) {
    const [form, setForm] = useState({ name: '', relation: '', birthday: '', gift_budget: '3000', phone: '' })
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')
    const relations = ['Mother', 'Father', 'Spouse/Partner', 'Sister', 'Brother', 'Friend', 'Colleague', 'Uncle', 'Aunt', 'Grandparent']

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.relation || !form.birthday) {
            setErr('Please fill in Name, Relation, and Birthday.')
            return
        }
        setLoading(true)
        setErr('')
        const personData = { ...form, gift_budget: parseInt(form.gift_budget) || 0 }
        try {
            await familyApi.addPerson(personData)
            onSuccess()
            onClose()
        } catch {
            // Backend unavailable — save locally and update UI
            const localPerson = {
                id: `local_${Date.now()}`,
                ...personData,
                days_until_birthday: 999,
            }
            onSuccess(localPerson)
            onClose()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1118', marginBottom: 16 }}>Add Family Member</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {['name', 'phone'].map(field => (
                        <div key={field}>
                            <label className="input-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                            <input className="input-field" placeholder={field === 'name' ? 'e.g. Lakshmi Devi' : '+91 98765 43210'}
                                value={(form as any)[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
                        </div>
                    ))}
                    <div>
                        <label className="input-label">Relation</label>
                        <select className="input-field" value={form.relation} onChange={e => setForm(p => ({ ...p, relation: e.target.value }))}>
                            <option value="">Select relation</option>
                            {relations.map(r => <option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Birthday</label>
                        <input className="input-field" type="date" value={form.birthday} onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))} />
                    </div>
                    <div>
                        <label className="input-label">Gift Budget (₹)</label>
                        <input className="input-field" type="number" value={form.gift_budget} onChange={e => setForm(p => ({ ...p, gift_budget: e.target.value }))} />
                    </div>
                </div>
                {err && (
                    <div style={{ background: '#fff1f4', border: '1px solid #f9c5d4', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#9f1239', marginTop: -4 }}>
                        {err}
                    </div>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 1 }}>
                        {loading ? 'Adding...' : '+ Add Person'}
                    </button>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default function FamilyPage() {
    const { data, mutate: revalidate } = useSWR<{ persons: Person[] }>('/api/family/persons', fetcher)
    const { data: birthdaysData } = useSWR<{ birthdays: BirthdayEvent[] }>('/api/family/birthdays/upcoming', fetcher)
    const [showAdd, setShowAdd] = useState(false)
    const [modal, setModal] = useState<{ id: string; name: string } | null>(null)
    const [isDemo, setIsDemo] = useState(false)
    const [localPersons, setLocalPersons] = useState<any[]>([])
    const router = useRouter()

    useEffect(() => {
        if (!getLoggedInUser()) { router.replace('/login'); return }
        setIsDemo(isDemoUser())
    }, [])

    const apiPersons = ((data?.persons?.length ? data.persons : null) ?? (isDemo ? DEMO_PERSONS : [])) as any[]
    const persons = [...apiPersons, ...localPersons]
    const birthdays = (birthdaysData?.birthdays?.length ? birthdaysData.birthdays : null) ?? (isDemo ? DEMO_BIRTHDAYS : [])

    return (
        <div className="page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1118', letterSpacing: '-0.3px', marginBottom: 2 }}>Family</h1>
                    <p style={{ fontSize: 13, color: '#8b7d97' }}>Birthdays, gifts & messages — handled.</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add</button>
            </div>

            {/* Upcoming birthday alerts */}
            {birthdays.filter(b => b.days_until <= 7).map(b => (
                <div key={b.id} className="alert-urgent" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>🎂</span>
                    <div style={{ flex: 1 }}>
                        <strong>{b.person_name}</strong> — birthday in <strong>{b.days_until === 0 ? 'TODAY!' : `${b.days_until} days`}</strong>
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={() => setModal({ id: b.id, name: b.person_name })}>
                        Prepare
                    </button>
                </div>
            ))}

            {/* Empty state for fresh users */}
            {persons.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b7d97' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1118', marginBottom: 6 }}>No family members yet</div>
                    <div style={{ fontSize: 13, marginBottom: 16 }}>Add your first member to track birthdays and generate gift ideas</div>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add first member</button>
                </div>
            )}

            {/* Person cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {persons.map((p: any) => (
                    <PersonCard key={p.id} person={p} onAction={(id, name) => setModal({ id, name })} />
                ))}
            </div>

            {showAdd && <AddPersonSheet onClose={() => setShowAdd(false)} onSuccess={(local) => { if (local) setLocalPersons(prev => [...prev, local]); revalidate() }} />}
            {modal && <GiftSheet personId={modal.id} personName={modal.name} onClose={() => setModal(null)} />}
        </div>
    )
}
