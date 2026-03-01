'use client'
import useSWR, { mutate } from 'swr'
import { useState } from 'react'
import { fetcher, familyApi } from '@/lib/api'
import type { Person, BirthdayEvent, GiftSuggestion } from '@/lib/types'
import { DEMO_PERSONS, DEMO_BIRTHDAYS } from '@/lib/demoData'

function PersonCard({ person, onGenerateSuggestions, onGenerateMessage }: {
    person: Person
    onGenerateSuggestions: (id: string) => void
    onGenerateMessage: (id: string) => void
}) {
    const daysUntil = (person as any).days_until_birthday ?? 999
    const urgency = daysUntil <= 3 ? 'red' : daysUntil <= 14 ? 'amber' : 'blue'

    return (
        <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: `linear-gradient(135deg, hsl(${person.name.charCodeAt(0) * 5 % 360}, 60%, 40%), hsl(${person.name.charCodeAt(0) * 5 + 40 % 360}, 60%, 30%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: 700, color: 'white',
                }}>
                    {person.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1c1917' }}>{person.name}</div>
                    <div style={{ fontSize: '12px', color: '#78716c', marginTop: '2px' }}>{person.relation}</div>
                </div>
                {daysUntil <= 30 && (
                    <span className={`badge badge-${urgency}`}>
                        {daysUntil === 0 ? '🎂 Today!' : `🎂 ${daysUntil}d`}
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span className="tag"> {(person as any).birthday?.replace(/^\d{4}-/, '').replace('-', ' ')}</span>
                {person.gift_budget && <span className="tag">💰 ₹{person.gift_budget.toLocaleString('en-IN')}</span>}
                {person.phone && <span className="tag">{person.phone}</span>}
            </div>

            {daysUntil <= 30 && (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-primary" style={{ fontSize: '12px', padding: '8px 14px' }}
                        onClick={() => onGenerateSuggestions(person.id)}>
                        🎁 Gift Ideas
                    </button>
                    <button className="btn-secondary" style={{ fontSize: '12px', padding: '8px 14px' }}
                        onClick={() => onGenerateMessage(person.id)}>
                        💬 Draft Message
                    </button>
                </div>
            )}
        </div>
    )
}

function GiftModal({ personId, personName, onClose }: { personId: string; personName: string; onClose: () => void }) {
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([])
    const [message, setMessage] = useState('')
    const [activeTab, setActiveTab] = useState<'gifts' | 'message'>('gifts')

    const fetchSuggestions = async () => {
        setLoading(true)
        try {
            const data = await familyApi.generateGiftSuggestions(personId)
            setSuggestions(data.suggestions || [])
        } finally {
            setLoading(false)
        }
    }

    const fetchMessage = async () => {
        setLoading(true)
        try {
            const data = await familyApi.generateBirthdayMessage(personId)
            setMessage(data.message || '')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card glass-strong" style={{ maxWidth: '540px', width: '100%', padding: '28px', maxHeight: '80vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1c1917' }}> {personName}</h2>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={onClose}>Close</button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    {(['gifts', 'message'] as const).map(tab => (
                        <button key={tab} className={activeTab === tab ? 'btn-primary' : 'btn-secondary'}
                            style={{ fontSize: '13px', padding: '8px 16px' }}
                            onClick={() => setActiveTab(tab)}>
                            {tab === 'gifts' ? '🎁 Gift Ideas' : 'Birthday Message'}
                        </button>
                    ))}
                </div>

                {activeTab === 'gifts' && (
                    <div>
                        {suggestions.length === 0 ? (
                            <button className="btn-primary" onClick={fetchSuggestions} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                                {loading ? 'Generating...' : 'Generate Gift Suggestions'}
                            </button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {suggestions.map((g, i) => (
                                    <div key={i} style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1c1917', marginBottom: '6px' }}>{g.name}</div>
                                        <div style={{ fontSize: '13px', color: '#78716c', marginBottom: '8px' }}>{g.description}</div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span className="badge badge-green">₹{g.price?.toLocaleString('en-IN')}</span>
                                            <span style={{ fontSize: '12px', color: '#78716c' }}>{g.where_to_buy}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'message' && (
                    <div>
                        {!message ? (
                            <button className="btn-primary" onClick={fetchMessage} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                                {loading ? 'Drafting...' : 'Generate Birthday Message'}
                            </button>
                        ) : (
                            <div>
                                <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(99,102,241,0.25)', marginBottom: '12px', fontSize: '14px', color: '#44403c', lineHeight: 1.7, fontStyle: 'italic' }}>
                                    &ldquo;{message}&rdquo;
                                </div>
                                <button className="btn-secondary" style={{ fontSize: '12px', padding: '8px 14px' }}
                                    onClick={() => { navigator.clipboard.writeText(message) }}>
                                    Copy Copy to Clipboard
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function AddPersonForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [form, setForm] = useState({ name: '', relation: '', birthday: '', gift_budget: '3000', phone: '' })
    const [loading, setLoading] = useState(false)
    const relations = ['Mother', 'Father', 'Spouse/Partner', 'Sister', 'Brother', 'Friend', 'Colleague', 'Uncle', 'Aunt', 'Grandparent']

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await familyApi.addPerson({ ...form, gift_budget: parseInt(form.gift_budget) || 0 })
            onSuccess()
            onClose()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card glass-strong" style={{ maxWidth: '480px', width: '100%', padding: '28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1c1917', marginBottom: '20px' }}>👤 Add Family Member</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
                        {loading ? 'Adding...' : '+ Add Person'}
                    </button>
                    <button className="btn-secondary" onClick={onClose} style={{ padding: '12px 20px' }}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default function FamilyPage() {
    const { data, mutate: revalidate } = useSWR<{ persons: Person[] }>('/api/family/persons', fetcher)
    const { data: birthdaysData } = useSWR<{ birthdays: BirthdayEvent[] }>('/api/family/birthdays/upcoming', fetcher)
    const [showAddForm, setShowAddForm] = useState(false)
    const [modalPerson, setModalPerson] = useState<{ id: string; name: string } | null>(null)
    const persons = (data?.persons || DEMO_PERSONS) as any[]
    const birthdays = birthdaysData?.birthdays || DEMO_BIRTHDAYS

    return (
        <div style={{ padding: '32px', maxWidth: '1100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1c1917', fontFamily: 'Plus Jakarta Sans', marginBottom: '6px' }}> Family Loop
                    </h1>
                    <p style={{ color: '#78716c', fontSize: '15px' }}>Birthdays, gifts, and messages — handled by Saheli.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddForm(true)}>+ Add Person</button>
            </div>

            {/* Upcoming birthdays alert strip */}
            {birthdays.filter(b => b.days_until <= 7).map(b => (
                <div key={b.id} className="alert-banner alert-urgent" style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '18px' }}> </span>
                    <div>
                        <strong>{b.person_name}</strong> ({b.relation}) — birthday in <strong>{b.days_until === 0 ? 'TODAY!' : `${b.days_until} days`}</strong> on {b.birthday}
                    </div>
                    <button className="btn-primary" style={{ marginLeft: 'auto', fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}
                        onClick={() => setModalPerson({ id: b.id, name: b.person_name })}>
                        🎁 Prepare
                    </button>
                </div>
            ))}

            {/* Active persons grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {persons.map((p: any) => (
                    <PersonCard key={p.id} person={p}
                        onGenerateSuggestions={() => setModalPerson({ id: p.id, name: p.name })}
                        onGenerateMessage={() => setModalPerson({ id: p.id, name: p.name })}
                    />
                ))}
            </div>

            {showAddForm && (
                <AddPersonForm onClose={() => setShowAddForm(false)} onSuccess={() => revalidate()} />
            )}
            {modalPerson && (
                <GiftModal personId={modalPerson.id} personName={modalPerson.name} onClose={() => setModalPerson(null)} />
            )}
        </div>
    )
}
