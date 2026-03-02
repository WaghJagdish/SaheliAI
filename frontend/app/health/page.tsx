'use client'
import useSWR from 'swr'
import { useState, useRef } from 'react'
import { fetcher, healthApi } from '@/lib/api'
import type { Medicine, Prescription } from '@/lib/types'
import { DEMO_MEDICINES, DEMO_PRESCRIPTIONS } from '@/lib/demoData'

function MedicineCard({ medicine, onTaken, onSkip }: {
    medicine: Medicine
    onTaken: (id: string) => void
    onSkip: (id: string) => void
}) {
    const pillPct = medicine.total_pills ? (medicine.pills_remaining / medicine.total_pills) * 100 : 100
    const lowStock = medicine.pills_remaining <= 7

    return (
        <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                    width: 44, height: 44, background: lowStock ? '#fceef3' : '#f0eaf8',
                    borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                }}>💊</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1a1118', marginBottom: 2 }}>{medicine.name}</div>
                    <div style={{ fontSize: 12, color: '#8b7d97' }}>{medicine.dosage} · {medicine.frequency}</div>
                </div>
                {lowStock && <span className="pill pill-rose" style={{ flexShrink: 0 }}>Low</span>}
                {medicine.refill_needed && <span className="pill pill-amber" style={{ flexShrink: 0 }}>Refill!</span>}
            </div>

            {/* Stock progress */}
            <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: '#8b7d97' }}>Pills remaining</span>
                    <span style={{ fontSize: 12, color: lowStock ? '#c8456c' : '#0d7c6e', fontWeight: 700 }}>
                        {medicine.pills_remaining} / {medicine.total_pills}
                    </span>
                </div>
                <div className="progress-track">
                    <div className="progress-fill" style={{
                        width: `${pillPct}%`,
                        background: lowStock ? 'linear-gradient(90deg, #c8456c, #e8729a)' : 'linear-gradient(90deg, #5b2d8e, #0d7c6e)',
                    }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <span className="tag">👤 {medicine.prescribed_for}</span>
                {medicine.schedule_times?.map(t => <span key={t} className="tag">⏰ {t}</span>)}
            </div>

            {medicine.today_status?.some(s => s.status === 'pending') && (
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onTaken(medicine.id)}>
                        ✓ Mark Taken
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => onSkip(medicine.id)}>Skip</button>
                </div>
            )}
        </div>
    )
}

function UploadCTA({ onUpload }: { onUpload: (file: File, for_: string) => void }) {
    const [dragging, setDragging] = useState(false)
    const [prescribedFor, setPrescribedFor] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const ref = useRef<HTMLInputElement>(null)

    return (
        <div>
            <div className={`upload-zone ${dragging ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); setSelectedFile(e.dataTransfer.files[0] || null) }}
                onClick={() => ref.current?.click()}>
                <input ref={ref} type="file" accept="image/*,.pdf" hidden onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
                <div style={{ fontWeight: 700, color: '#1a1118', marginBottom: 4 }}>Upload Prescription</div>
                <div style={{ fontSize: 12, color: '#8b7d97' }}>Tap to take photo or browse files</div>
                {selectedFile && <span className="pill pill-teal" style={{ marginTop: 10 }}>{selectedFile.name}</span>}
            </div>

            {selectedFile && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input className="input-field" placeholder="Prescribed for (e.g. Mother)" value={prescribedFor}
                        onChange={e => setPrescribedFor(e.target.value)} />
                    <button className="btn btn-primary btn-full" onClick={() => onUpload(selectedFile, prescribedFor)}>
                        Process with OCR
                    </button>
                </div>
            )}
        </div>
    )
}

export default function HealthPage() {
    const { data: medData, mutate: revals } = useSWR<{ medicines: Medicine[] }>('/api/health/medicines', fetcher)
    const { data: rxData } = useSWR<{ prescriptions: Prescription[] }>('/api/health/prescriptions', fetcher)
    const [ocrResult, setOcrResult] = useState<any>(null)
    const [uploading, setUploading] = useState(false)
    const [showUpload, setShowUpload] = useState(false)

    const medicines = medData?.medicines || DEMO_MEDICINES
    const prescriptions = rxData?.prescriptions || DEMO_PRESCRIPTIONS
    const refillsNeeded = medicines.filter(m => m.refill_needed || m.pills_remaining <= 5)

    const handleUpload = async (file: File, for_: string) => {
        setUploading(true)
        try { const result = await healthApi.uploadPrescription(file, for_); setOcrResult(result); revals() }
        finally { setUploading(false) }
    }

    const handleTaken = (id: string) => healthApi.markTaken(id).then(() => revals()).catch(() => revals())
    const handleSkip = (id: string) => healthApi.markSkipped(id).then(() => revals()).catch(() => revals())

    return (
        <div className="page-content">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1118', letterSpacing: '-0.3px', marginBottom: 2 }}>Health</h1>
                <p style={{ fontSize: 13, color: '#8b7d97' }}>Medicines, prescriptions & refill alerts.</p>
            </div>

            {/* Refill alerts */}
            {refillsNeeded.map(m => (
                <div key={m.id} className="alert-urgent" style={{ marginBottom: 10 }}>
                    💊 <strong>{m.name}</strong> for {m.prescribed_for} — only {m.pills_remaining} pills left. Refill by {m.end_date}.
                </div>
            ))}

            {/* Upload prescription button */}
            <button
                className="btn btn-primary btn-full"
                style={{ marginBottom: 20 }}
                onClick={() => setShowUpload(v => !v)}
            >
                📷 {showUpload ? 'Cancel' : 'Upload Prescription'}
            </button>

            {showUpload && (
                <div className="card" style={{ padding: 16, marginBottom: 20 }}>
                    {uploading ? (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: '#8b7d97' }}>
                            <div style={{ fontSize: 28, marginBottom: 10 }}>✨</div>
                            <div style={{ fontWeight: 700, color: '#5b2d8e', marginBottom: 6 }}>Processing OCR...</div>
                            <div style={{ fontSize: 12 }}>Extracting medicine data with AI</div>
                        </div>
                    ) : (
                        <UploadCTA onUpload={handleUpload} />
                    )}

                    {ocrResult && (
                        <div style={{ background: '#e8f6f4', border: '1px solid rgba(13,124,110,0.2)', borderRadius: 12, padding: 14, marginTop: 14 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0d7c6e', marginBottom: 8 }}>
                                ✓ Processed · +{ocrResult.cognitive_minutes_saved} min saved
                            </div>
                            {ocrResult.extracted_data?.medicines?.map((med: any, i: number) => (
                                <div key={i} style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: 10, marginTop: 6 }}>
                                    <div style={{ fontWeight: 600, color: '#1a1118', marginBottom: 2 }}>{med.name} {med.dosage}</div>
                                    <div style={{ fontSize: 12, color: '#8b7d97' }}>{med.frequency}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Active medicines */}
            <div className="section-header">
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1118' }}>Active Medicines</span>
                <span className="pill pill-plum">{medicines.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {medicines.map(m => (
                    <MedicineCard key={m.id} medicine={m} onTaken={handleTaken} onSkip={handleSkip} />
                ))}
            </div>

            {/* Prescription history */}
            <div style={{ marginTop: 24 }}>
                <div className="section-header">
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1118' }}>Prescription History</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {prescriptions.map(rx => (
                        <div key={rx.id} style={{
                            display: 'flex', gap: 12, padding: '12px 14px',
                            background: 'white', borderRadius: 14, border: '1px solid var(--border)',
                            alignItems: 'center',
                        }}>
                            <span style={{ fontSize: 22 }}>📋</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1118' }}>{rx.doctor_name}</div>
                                <div style={{ fontSize: 12, color: '#8b7d97' }}>{rx.prescribed_for} · {rx.medicine_count} medicine(s)</div>
                            </div>
                            <span className="pill pill-teal" style={{ fontSize: 10 }}>Done</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
