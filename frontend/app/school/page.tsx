'use client'
import useSWR from 'swr'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetcher, schoolApi } from '@/lib/api'
import type { SchoolEvent, Child } from '@/lib/types'
import { DEMO_EVENTS, DEMO_CHILDREN } from '@/lib/demoData'
import { isDemoUser, getLoggedInUser } from '@/lib/userUtils'

function EventCard({ event, onFeePaid, onComplete }: {
    event: SchoolEvent
    onFeePaid: (id: string) => void
    onComplete: (id: string) => void
}) {
    const [reply, setReply] = useState(event.whatsapp_reply_draft || '')
    const [genLoading, setGenLoading] = useState(false)
    const urgencyColor = event.days_until_deadline && event.days_until_deadline <= 3 ? '#c8456c'
        : event.days_until_deadline && event.days_until_deadline <= 7 ? '#b45309' : '#5b2d8e'

    const handleReply = async () => {
        setGenLoading(true)
        try { const d = await schoolApi.generateTeacherReply(event.id); setReply(d.message || '') }
        finally { setGenLoading(false) }
    }

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* urgency stripe */}
            <div style={{ height: 4, background: urgencyColor }} />
            <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{
                        width: 40, height: 40, background: '#e8f6f4', borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0
                    }}>🏫</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#1a1118', marginBottom: 2 }}>{event.event_name}</div>
                        <div style={{ fontSize: 12, color: '#8b7d97' }}>{event.child_name}</div>
                    </div>
                    {event.action_required && <span className="pill pill-rose" style={{ flexShrink: 0, fontSize: 10 }}>Action!</span>}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    {event.event_date && <span className="tag">📅 {event.event_date}</span>}
                    {event.fee_amount && (
                        <span className="tag" style={{ color: event.fee_paid ? '#0d7c6e' : '#b45309', fontWeight: 700 }}>
                            ₹{event.fee_amount} {event.fee_paid ? '✓' : '— Due'}
                        </span>
                    )}
                </div>

                {event.special_instructions && (
                    <div style={{ fontSize: 12, color: '#8b7d97', background: '#f5f0ed', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
                        📝 {event.special_instructions}
                    </div>
                )}

                {reply && (
                    <div style={{ background: '#e8f6f4', border: '1px solid rgba(13,124,110,0.2)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#0d7c6e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>AI Draft Reply</div>
                        <div style={{ fontSize: 12, color: '#4a3d56', lineHeight: 1.6 }}>{reply}</div>
                        <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => navigator.clipboard.writeText(reply)}>
                            Copy
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {!reply && (
                        <button className="btn btn-primary btn-sm" onClick={handleReply} disabled={genLoading}>
                            {genLoading ? 'Drafting...' : '✏️ Draft Reply'}
                        </button>
                    )}
                    {event.fee_amount && !event.fee_paid && (
                        <button className="btn btn-secondary btn-sm" onClick={() => onFeePaid(event.id)}>
                            Mark Fee Paid
                        </button>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => onComplete(event.id)}>
                        ✓ Done
                    </button>
                </div>
            </div>
        </div>
    )
}

function CircularUpload({ onUpload, children }: { onUpload: (file: File) => void; children: Child[] }) {
    const [file, setFile] = useState<File | null>(null)
    const [ocrResult, setOcrResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [dragging, setDragging] = useState(false)
    const ref = useRef<HTMLInputElement>(null)

    const handleProcess = async () => {
        if (!file) return
        setLoading(true)
        try { const r = await schoolApi.uploadCircular(file, children[0]?.id || 'c1'); setOcrResult(r) }
        finally { setLoading(false) }
    }

    return (
        <div>
            <div className={`upload-zone ${dragging ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0] || null) }}
                onClick={() => ref.current?.click()}>
                <input ref={ref} type="file" accept="image/*,.pdf" hidden onChange={e => setFile(e.target.files?.[0] || null)} />
                <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                <div style={{ fontWeight: 700, color: '#1a1118', marginBottom: 4 }}>Upload School Circular</div>
                <div style={{ fontSize: 12, color: '#8b7d97' }}>SaheliAI extracts all event details automatically</div>
                {file && <span className="pill pill-teal" style={{ marginTop: 10 }}>{file.name}</span>}
            </div>
            {file && !ocrResult && (
                <button className="btn btn-primary btn-full" style={{ marginTop: 12 }} onClick={handleProcess} disabled={loading}>
                    {loading ? '🔍 Extracting...' : '🔍 Extract Event Details'}
                </button>
            )}
            {ocrResult && (
                <div style={{ background: '#e8f6f4', borderRadius: 12, padding: 14, marginTop: 12 }}>
                    <div style={{ fontWeight: 700, color: '#0d7c6e', marginBottom: 8 }}>
                        ✓ Processed · +{ocrResult.cognitive_minutes_saved} min saved
                    </div>
                    {ocrResult.extracted_data && Object.entries(ocrResult.extracted_data).map(([k, v]) =>
                        v ? (
                            <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#8b7d97', minWidth: 100, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                                <span style={{ fontSize: 12, color: '#4a3d56' }}>{String(v)}</span>
                            </div>
                        ) : null
                    )}
                </div>
            )}
        </div>
    )
}

export default function SchoolPage() {
    const { data: evData, mutate: revals } = useSWR<{ events: SchoolEvent[] }>('/api/school/events', fetcher)
    const { data: childData } = useSWR<{ children: Child[] }>('/api/school/children', fetcher)
    const [isDemo, setIsDemo] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (!getLoggedInUser()) { router.replace('/login'); return }
        setIsDemo(isDemoUser())
    }, [])

    const events = ((evData?.events?.length ? evData.events : null) ?? (isDemo ? DEMO_EVENTS : []))
    const children = ((childData?.children?.length ? childData.children : null) ?? (isDemo ? DEMO_CHILDREN : []))
    const [showUpload, setShowUpload] = useState(false)

    const handleFeePaid = async (id: string) => { await schoolApi.markFeePaid(id); revals() }
    const handleComplete = async (id: string) => { await schoolApi.markComplete(id); revals() }

    return (
        <div className="page-content">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1118', letterSpacing: '-0.3px', marginBottom: 2 }}>School</h1>
                <p style={{ fontSize: 13, color: '#8b7d97' }}>Circulars, events & teacher replies — automated.</p>
            </div>

            {/* Children chips */}
            {children.length > 0 && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                    {children.map(c => (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 14px' }}>
                            <span style={{ width: 28, height: 28, background: '#e8f6f4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0d7c6e', fontSize: 12 }}>
                                {c.name.charAt(0)}
                            </span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1118' }}>{c.name}</div>
                                <div style={{ fontSize: 11, color: '#8b7d97' }}>{c.class_name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload circular toggle */}
            <button className="btn btn-primary btn-full" style={{ marginBottom: 16 }} onClick={() => setShowUpload(v => !v)}>
                📄 {showUpload ? 'Cancel Upload' : 'Upload Circular'}
            </button>

            {showUpload && (
                <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                    <CircularUpload onUpload={() => revals()} children={children} />
                </div>
            )}

            {/* Events list */}
            <div className="section-header">
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1118' }}>Upcoming Events</span>
                <span className="pill pill-rose">{events.filter(e => e.action_required).length} need action</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {events.map(e => (
                    <EventCard key={e.id} event={e} onFeePaid={handleFeePaid} onComplete={handleComplete} />
                ))}
            </div>
        </div>
    )
}
