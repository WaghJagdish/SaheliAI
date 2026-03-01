'use client'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'
import { useState, useEffect } from 'react'
import type { DashboardMetrics, Reminder, ActivityLog } from '@/lib/types'
import { DEMO_DASHBOARD, DEMO_REMINDERS, DEMO_ACTIVITY, isFamilyMember } from '@/lib/demoData'

/* ─── Animated number counter ────────────────────────────── */
function AnimatedNumber({ value, duration = 1800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!value) return
    const step = value / (duration / 16)
    let cur = 0
    const t = setInterval(() => {
      cur = Math.min(cur + step, value)
      setDisplay(Math.floor(cur))
      if (cur >= value) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [value, duration])
  return <>{display.toLocaleString('en-IN')}</>
}

/* ─── Colour dot for reminder type ──────────────────────── */
const TYPE_COLOR: Record<string, string> = {
  birthday: '#c8456c',
  medicine: '#5b2d8e',
  school_event: '#0d7c6e',
  refill: '#b45309',
}
const TYPE_LABEL: Record<string, string> = {
  birthday: 'Birthday', medicine: 'Medicine', school_event: 'School', refill: 'Refill',
}

/* ─── AI Agent label ────────────────────────────────────── */
const AGENT_LABEL: Record<string, string> = {
  health: 'Health Agent', relationship: 'Relationship Agent', school: 'School Agent',
}
const AGENT_ACTION_LABEL: Record<string, string> = {
  prescription_ocr_processed: 'Prescription OCR',
  gift_suggestion_generated: 'Gift Suggestion',
  circular_parsed: 'Circular Parsed',
  whatsapp_draft_generated: 'Message Drafted',
  refill_alert_sent: 'Refill Alert',
}

/* ─── Dashboard ─────────────────────────────────────────── */
export default function Dashboard() {
  const { data: metrics } = useSWR<DashboardMetrics>('/api/metrics/dashboard', fetcher, { refreshInterval: 30000 })
  const { data: remindersData } = useSWR<{ reminders: Reminder[] }>('/api/reminders', fetcher, { refreshInterval: 15000 })
  const { data: activityData } = useSWR<{ activities: ActivityLog[] }>('/api/metrics/activity', fetcher)

  const reminders = remindersData?.reminders || DEMO_REMINDERS
  const activities = activityData?.activities || DEMO_ACTIVITY
  const m = metrics || DEMO_DASHBOARD
  const totalMinutes = m.cognitive?.total_minutes || 247

  const urgentCount = reminders.filter(r => r.priority === 'high').length
  const familyCount = m.family?.total_persons || 4

  return (
    <div style={{ padding: '36px 40px', maxWidth: '1100px' }}>

      {/* ── Page header ──────────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1118', letterSpacing: '-0.3px', marginBottom: '4px' }}>
          Good evening, Priya
        </h1>
        <p style={{ fontSize: '14px', color: '#8b7d97' }}>
          Here is what Saheli managed for you today.
        </p>
      </div>

      {/* ── Cognitive hero banner ─────────────────────── */}
      <div style={{
        background: 'linear-gradient(130deg, #5b2d8e 0%, #7b4ab5 60%, #c8456c 100%)',
        borderRadius: '20px',
        padding: '32px 36px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle texture rings */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '180px', height: '180px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '10px' }}>
              Cognitive Load Reduced
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '64px', fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '-2px' }}>
                <AnimatedNumber value={totalMinutes} />
              </span>
              <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>min saved</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
              {(totalMinutes / 60).toFixed(1)} hours returned to you this month
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Reminders sent', value: m.reminders?.total_pending || 34 },
              { label: 'Tasks completed', value: m.school?.circulars_processed || 18 },
              { label: 'Messages drafted', value: m.cognitive?.messages_drafted || 9 },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '14px',
                padding: '16px 20px',
                minWidth: '100px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', lineHeight: 1, marginBottom: '6px' }}>
                  <AnimatedNumber value={s.value} duration={1400} />
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat row ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Family members', value: familyCount, note: '2 birthdays this month', color: '#5b2d8e', palePill: 'pill-plum' },
          { label: 'Active medicines', value: m.health?.active_medicines || 3, note: '1 refill needed', color: '#c8456c', palePill: 'pill-rose' },
          { label: 'School events', value: m.school?.active_events || 2, note: '₹250 pending', color: '#0d7c6e', palePill: 'pill-teal' },
          { label: 'Pending reminders', value: m.reminders?.total_pending || 4, note: `${urgentCount} urgent`, color: '#b45309', palePill: 'pill-amber' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '32px', fontWeight: 800, color: s.color, letterSpacing: '-1px', lineHeight: 1, marginBottom: '6px' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1118', marginBottom: '4px' }}>{s.label}</div>
            <span className={`pill ${s.palePill}`} style={{ fontSize: '11px' }}>{s.note}</span>
          </div>
        ))}
      </div>

      {/* ── Two columns ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Reminders */}
        <div className="card" style={{ padding: '22px' }}>
          <div className="section-header">
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1118' }}>Today's Reminders</span>
            {urgentCount > 0 && <span className="pill pill-rose">{urgentCount} urgent</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {reminders.map((r, idx) => (
              <div key={r.id} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '12px 0',
                borderTop: idx === 0 ? 'none' : '1px solid #f0eaf3',
              }}>
                <div style={{ width: '3px', borderRadius: '2px', alignSelf: 'stretch', background: TYPE_COLOR[r.type] || '#5b2d8e', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1118', marginBottom: '2px', lineHeight: 1.4 }}>{r.title}</div>
                  <div style={{ fontSize: '12px', color: '#8b7d97', lineHeight: 1.4 }}>{r.body}</div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: TYPE_COLOR[r.type] || '#5b2d8e', background: 'transparent', whiteSpace: 'nowrap', flexShrink: 0, paddingTop: '2px' }}>
                  {TYPE_LABEL[r.type]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Activity log */}
        <div className="card" style={{ padding: '22px' }}>
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1118' }}>AI Actions</span>
              <span className="ai-badge">Saheli AI</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activities.slice(0, 5).map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '11px 0',
                borderTop: i === 0 ? 'none' : '1px solid #f0eaf3',
              }}>
                {/* Agent dot */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: a.agent === 'health' ? '#f0eaf8' : a.agent === 'relationship' ? '#fceef3' : '#e8f6f4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                  color: a.agent === 'health' ? '#5b2d8e' : a.agent === 'relationship' ? '#c8456c' : '#0d7c6e',
                }}>
                  {a.agent === 'health' ? 'H' : a.agent === 'relationship' ? 'R' : 'S'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8b7d97' }}>
                      {AGENT_LABEL[a.agent] || a.agent}
                    </span>
                    <span style={{ fontSize: '10px', color: '#b8aac4' }}>·</span>
                    <span style={{ fontSize: '11px', color: '#b8aac4' }}>
                      {AGENT_ACTION_LABEL[a.action] || a.action}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#4a3d56', lineHeight: 1.4 }}>{a.summary}</div>
                  <div style={{ marginTop: '4px' }}>
                    <span className="pill pill-teal" style={{ fontSize: '10px', padding: '2px 7px' }}>+{a.minutes_saved} min saved</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Feature explainer strip ───────────────── */}
      <div style={{
        marginTop: '24px',
        background: '#f0eaf8',
        border: '1px solid rgba(91,45,142,0.15)',
        borderRadius: '14px',
        padding: '18px 22px',
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b2d8e', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
            How Saheli AI helps you
          </div>
          <div style={{ fontSize: '13px', color: '#4a3d56' }}>
            Three specialist agents run continuously — Health, Relationship, and School — each trained on your family's context.
          </div>
        </div>
        {[
          { name: 'Health Agent', desc: 'Reads prescriptions via OCR · Tracks doses · Alerts on refills' },
          { name: 'Relationship Agent', desc: 'Surfaces birthdays · Generates gift ideas · Drafts messages' },
          { name: 'School Agent', desc: 'Parses circulars · Tracks fees · Drafts teacher replies' },
        ].map(ag => (
          <div key={ag.name} style={{ minWidth: '160px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b2d8e', marginBottom: '3px' }}>{ag.name}</div>
            <div style={{ fontSize: '11px', color: '#8b7d97', lineHeight: 1.5 }}>{ag.desc}</div>
          </div>
        ))}
      </div>

    </div>
  )
}
