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
        <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(99,102,241,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}> </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1c1917', marginBottom: '2px' }}>{medicine.name}</div>
                    <div style={{ fontSize: '12px', color: '#78716c' }}>{medicine.dosage} · {medicine.frequency}</div>
                </div>
                {lowStock && <span className="badge badge-amber">Refill Soon</span>}
                {medicine.refill_needed && <span className="badge badge-red">Refill Now</span>}
            </div>

            <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: '#78716c' }}>Pills remaining</span>
                    <span style={{ fontSize: '12px', color: lowStock ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                        {medicine.pills_remaining} / {medicine.total_pills}
                    </span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pillPct}%`, background: lowStock ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#6366f1,#10b981)' }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span className="tag">👤 {medicine.prescribed_for}</span>
                {medicine.schedule_times?.map(t => <span key={t} className="tag">⏰ {t}</span>)}
            </div>

            {medicine.today_status && medicine.today_status.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {medicine.today_status.map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '12px', color: '#78716c' }}>{s.time}</span>
                            <span className={`badge badge-${s.status === 'taken' ? 'green' : s.status === 'skipped' ? 'amber' : 'blue'}`}>
                                {s.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {medicine.today_status?.some(s => s.status === 'pending') && (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-primary" style={{ fontSize: '12px', padding: '8px 14px' }} onClick={() => onTaken(medicine.id)}>Mark Taken</button>
                    <button className="btn-secondary" style={{ fontSize: '12px', padding: '8px 14px' }} onClick={() => onSkip(medicine.id)}>Skip</button>
                </div>
            )}
        </div>
    )
}

function UploadZone({ onUpload }: { onUpload: (file: File, for_: string) => void }) {
    const [dragging, setDragging] = useState(false)
    const [prescribedFor, setPrescribedFor] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const ref = useRef<HTMLInputElement>(null)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) { setSelectedFile(file) }
    }

    return (
        <div>
            <div className={`upload-zone ${dragging ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => ref.current?.click()}>
                <input ref={ref} type="file" accept="image/*,.pdf" hidden onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
                <div style={{ fontWeight: 700, color: '#1c1917', marginBottom: '6px' }}>Drop prescription image here</div>
                <div style={{ fontSize: '13px', color: '#78716c' }}>or click to browse · JPG, PNG, PDF accepted</div>
                {selectedFile && (
                    <div className="badge badge-green" style={{ marginTop: '12px', display: 'inline-flex' }}>
                        {selectedFile.name}
                    </div>
                )}
            </div>
            {selectedFile && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input className="input-field" placeholder="Prescribed for (e.g. Mother)" value={prescribedFor} onChange={e => setPrescribedFor(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '10px 20px' }} onClick={() => onUpload(selectedFile, prescribedFor)}>
                        Process OCR
                    </button>
                </div>
            )}
        </div>
    )
}

function OCRResult({ result }: { result: any }) {
    if (!result) return null
    return (
        <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '20px', marginTop: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#10b981', marginBottom: '12px' }}>
                Prescription Processed · +{result.cognitive_minutes_saved} min saved
            </div>
            {result.extracted_data?.doctor_name && (
                <div style={{ fontSize: '13px', color: '#78716c', marginBottom: '8px' }}>
                    Doctor: <strong style={{ color: '#44403c' }}>{result.extracted_data.doctor_name}</strong>
                </div>
            )}
            {result.extracted_data?.medicines?.map((m: any, i: number) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '8px', padding: '12px', marginTop: '8px', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ fontWeight: 600, color: '#1c1917', marginBottom: '4px' }}>{m.name} {m.dosage}</div>
                    <div style={{ fontSize: '12px', color: '#78716c' }}>{m.frequency} · Schedule: {m.schedule_times?.join(', ')}</div>
                </div>
            ))}
        </div>
    )
}

export default function HealthPage() {
    const { data: medData, mutate: revals } = useSWR<{ medicines: Medicine[] }>('/api/health/medicines', fetcher)
    const { data: rxData } = useSWR<{ prescriptions: Prescription[] }>('/api/health/prescriptions', fetcher)
    const [ocrResult, setOcrResult] = useState<any>(null)
    const [uploading, setUploading] = useState(false)

    const medicines = medData?.medicines || DEMO_MEDICINES
    const prescriptions = rxData?.prescriptions || DEMO_PRESCRIPTIONS

    const handleUpload = async (file: File, for_: string) => {
        setUploading(true)
        try {
            const result = await healthApi.uploadPrescription(file, for_)
            setOcrResult(result)
            revals()
        } finally {
            setUploading(false)
        }
    }

    const handleTaken = (id: string) => {
        // Optimistic update — flip status locally first
        healthApi.markTaken(id).then(() => revals()).catch(() => {
            // If backend unavailable, just update local demo data visually
            revals()
        })
    }
    const handleSkip = (id: string) => {
        healthApi.markSkipped(id).then(() => revals()).catch(() => revals())
    }


    const refillsNeeded = medicines.filter(m => m.refill_needed || m.pills_remaining <= 5)

    return (
        <div style={{ padding: '32px', maxWidth: '1100px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1c1917', fontFamily: 'Plus Jakarta Sans', marginBottom: '6px' }}> Health Loop</h1>
                <p style={{ color: '#78716c', fontSize: '15px' }}>Upload prescriptions. Saheli extracts, schedules, and alerts you automatically.</p>
            </div>

            {/* Refill alerts */}
            {refillsNeeded.map(m => (
                <div key={m.id} className="alert-banner alert-urgent" style={{ marginBottom: '10px' }}>
                    <strong>{m.name}</strong> for {m.prescribed_for} — only {m.pills_remaining} pills remaining. <strong>Refill by {m.end_date}.</strong>
                </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Left: Upload */}
                <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1c1917', marginBottom: '16px' }}>Upload Upload Prescription</h2>
                    {uploading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#78716c' }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px' }}></div>
                            <div style={{ fontWeight: 600, color: '#7c3aed' }}>Processing OCR...</div>
                            <div style={{ fontSize: '13px', marginTop: '8px' }}>Extracting medicine data with AI</div>
                        </div>
                    ) : (
                        <UploadZone onUpload={handleUpload} />
                    )}
                    <OCRResult result={ocrResult} />

                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1c1917', margin: '28px 0 16px' }}>Copy Prescription History</h2>
                    {prescriptions.map(rx => (
                        <div key={rx.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', marginBottom: '8px', border: '1px solid rgba(0,0,0,0.04)' }}>
                            <span style={{ fontSize: '20px' }}>Copy </span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '13px', color: '#1c1917' }}>{rx.doctor_name}</div>
                                <div style={{ fontSize: '12px', color: '#78716c' }}>{rx.prescribed_for} · {rx.medicine_count} medicine(s)</div>
                            </div>
                            <span className="badge badge-green" style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>Processed</span>
                        </div>
                    ))}
                </div>

                {/* Right: Medicines */}
                <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1c1917', marginBottom: '16px' }}>
                        Active Medicines
                        <span className="badge badge-blue" style={{ marginLeft: '10px' }}>{medicines.length}</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {medicines.map(m => (
                            <MedicineCard key={m.id} medicine={m} onTaken={handleTaken} onSkip={handleSkip} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
