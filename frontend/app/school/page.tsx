'use client'
import useSWR from 'swr'
import { useState, useRef } from 'react'
import { fetcher, schoolApi } from '@/lib/api'
import type { SchoolEvent, Child } from '@/lib/types'
import { DEMO_EVENTS, DEMO_CHILDREN } from '@/lib/demoData'

function SchoolEventCard({ event, onFeePaid, onComplete, onGenerateReply }: {
    event: SchoolEvent
    onFeePaid: (id: string) => void
    onComplete: (id: string) => void
    onGenerateReply: (id: string) => void
}) {
    const [reply, setReply] = useState(event.whatsapp_reply_draft || '')
    const [genLoading, setGenLoading] = useState(false)

    const urgency = event.days_until_deadline && event.days_until_deadline <= 3 ? 'red' :
        event.days_until_deadline && event.days_until_deadline <= 7 ? 'amber' : 'blue'

    const handleReply = async () => {
        setGenLoading(true)
        try {
            const data = await schoolApi.generateTeacherReply(event.id)
            setReply(data.message || '')
        } finally { setGenLoading(false) }
    }

    return (
        <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(16,185,129,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}> </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1c1917', marginBottom: '2px' }}>{event.event_name}</div>
                    <div style={{ fontSize: '12px', color: '#78716c' }}>{event.child_name}</div>
                </div>
                {event.action_required && <span className={`badge badge-${urgency}`}>Action Required</span>}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {event.event_date && <span className="tag"> {event.event_date}</span>}
                {event.deadline_date && <span className="tag" style={{ color: urgency === 'red' ? '#f43f5e' : urgency === 'amber' ? '#f59e0b' : undefined }}>⏰ Deadline: {event.deadline_date}</span>}
                {event.fee_amount && (
                    <span className={`tag badge-${event.fee_paid ? 'green' : 'amber'}`} style={{ background: event.fee_paid ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: event.fee_paid ? '#10b981' : '#f59e0b', border: 'none' }}>
                        💰 ₹{event.fee_amount} {event.fee_paid ? '— Paid ' : '— Due'}
                    </span>
                )}
            </div>

            {event.special_instructions && (
                <div style={{ fontSize: '13px', color: '#78716c', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', padding: '10px', marginBottom: '14px', border: '1px solid rgba(0,0,0,0.04)' }}>
                    📝 {event.special_instructions}
                </div>
            )}

            {reply && (
                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>AI-Drafted Reply</div>
                    <div style={{ fontSize: '13px', color: '#44403c', lineHeight: 1.6 }}>{reply}</div>
                    <button className="btn-secondary" style={{ marginTop: '8px', fontSize: '11px', padding: '6px 12px' }}
                        onClick={() => navigator.clipboard.writeText(reply)}>Copy Copy</button>
                </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {!reply && (
                    <button className="btn-primary" style={{ fontSize: '12px', padding: '8px 14px' }} onClick={handleReply} disabled={genLoading}>
                        {genLoading ? 'Drafting...' : 'Draft Reply'}
                    </button>
                )}
                {event.fee_amount && !event.fee_paid && (
                    <button className="btn-secondary" style={{ fontSize: '12px', padding: '8px 14px' }} onClick={() => onFeePaid(event.id)}>
                        Mark Fee Paid
                    </button>
                )}
                <button className="btn-secondary" style={{ fontSize: '12px', padding: '8px 14px' }} onClick={() => onComplete(event.id)}>
                    Mark Done
                </button>
            </div>
        </div>
    )
}

function CircularUpload({ onUpload, children }: { onUpload: (file: File) => void; children: Child[] }) {
    const [dragging, setDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [ocrResult, setOcrResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const ref = useRef<HTMLInputElement>(null)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragging(false)
        setFile(e.dataTransfer.files[0] || null)
    }

    const handleProcess = async () => {
        if (!file) return
        setLoading(true)
        try {
            const result = await schoolApi.uploadCircular(file, children[0]?.id || 'c1')
            setOcrResult(result)
        } finally { setLoading(false) }
    }

    return (
        <div>
            <div className={`upload-zone ${dragging ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => ref.current?.click()}>
                <input ref={ref} type="file" accept="image/*,.pdf" hidden onChange={e => setFile(e.target.files?.[0] || null)} />
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
                <div style={{ fontWeight: 700, color: '#1c1917', marginBottom: '6px' }}>Drop school circular here</div>
                <div style={{ fontSize: '13px', color: '#78716c' }}>Saheli will extract all event details automatically</div>
                {file && <div className="badge badge-green" style={{ marginTop: '10px', display: 'inline-flex' }}>{file.name}</div>}
            </div>

            {file && !ocrResult && (
                <button className="btn-primary" style={{ marginTop: '12px', width: '100%', justifyContent: 'center', padding: '12px' }}
                    onClick={handleProcess} disabled={loading}>
                    {loading ? '🔍 Extracting...' : '🔍 Extract Event Details'}
                </button>
            )}

            {ocrResult && (
                <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '20px', marginTop: '14px' }}>
                    <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '12px' }}>
                        Circular Processed · +{ocrResult.cognitive_minutes_saved} min saved
                    </div>
                    {ocrResult.extracted_data && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(Object.entries(ocrResult.extracted_data) as [string, unknown][]).map(([k, v]) => v ? (
                                <div key={k} style={{ display: 'flex', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#78716c', minWidth: '120px', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                                    <span style={{ fontSize: '13px', color: '#44403c' }}>{String(v)}</span>
                                </div>
                            ) : null)}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function SchoolPage() {
    const { data: evData, mutate: revals } = useSWR<{ events: SchoolEvent[] }>('/api/school/events', fetcher)
    const { data: childData } = useSWR<{ children: Child[] }>('/api/school/children', fetcher)
    const events = evData?.events || DEMO_EVENTS
    const children = childData?.children || DEMO_CHILDREN

    const handleFeePaid = async (id: string) => { await schoolApi.markFeePaid(id); revals() }
    const handleComplete = async (id: string) => { await schoolApi.markComplete(id); revals() }

    return (
        <div style={{ padding: '32px', maxWidth: '1100px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1c1917', fontFamily: 'Plus Jakarta Sans', marginBottom: '6px' }}> School Loop</h1>
                <p style={{ color: '#78716c', fontSize: '15px' }}>Upload circulars. Saheli extracts events, deadlines, and drafts teacher replies.</p>
            </div>

            {children.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {children.map(c => (
                        <div key={c.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', padding: '10px 16px' }}>
                            <span style={{ width: '32px', height: '32px', background: 'rgba(16,185,129,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#10b981' }}>
                                {c.name.charAt(0)}
                            </span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '13px', color: '#1c1917' }}>{c.name}</div>
                                <div style={{ fontSize: '11px', color: '#78716c' }}>{c.class_name} · {c.school_name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Upload */}
                <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1c1917', marginBottom: '16px' }}>Upload Upload Circular</h2>
                    <CircularUpload onUpload={() => revals()} children={children} />
                </div>

                {/* Events */}
                <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1c1917', marginBottom: '16px' }}>
                        Upcoming Events
                        <span className="badge badge-amber" style={{ marginLeft: '10px' }}>{events.filter(e => e.action_required).length} need action</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {events.map(e => (
                            <SchoolEventCard key={e.id} event={e} onFeePaid={handleFeePaid} onComplete={handleComplete} onGenerateReply={() => { }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
