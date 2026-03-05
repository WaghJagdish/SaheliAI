'use client'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { DashboardMetrics, Reminder, ActivityLog } from '@/lib/types'
import { DEMO_DASHBOARD, DEMO_REMINDERS, DEMO_ACTIVITY } from '@/lib/demoData'
import { isDemoUser, getLoggedInUser } from '@/lib/userUtils'

/* ─── Animated number ─── */
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

const TYPE_COLOR: Record<string, string> = {
  birthday: '#c8456c', medicine: '#5b2d8e', school_event: '#0d7c6e', refill: '#b45309',
}
const TYPE_LABEL: Record<string, string> = {
  birthday: 'Birthday', medicine: 'Medicine', school_event: 'School', refill: 'Refill',
}
const AGENT_LABEL: Record<string, string> = {
  health: 'Health', relationship: 'Relationship', school: 'School',
}

const EMPTY_DASHBOARD: DashboardMetrics = {
  cognitive: { total_minutes: 0, reminders_count: 0, tasks_handled: 0, messages_drafted: 0, breakdown: [] },
  family: { total_persons: 0, upcoming_birthdays_30days: 0, next_birthday_days: 0 },
  health: { active_medicines: 0, refills_needed: 0, prescriptions_processed: 0 },
  school: { active_events: 0, fees_pending: 0, circulars_processed: 0 },
  reminders: { total_pending: 0, high_priority: 0 },
}

export default function Dashboard() {
  const { data: metrics } = useSWR<DashboardMetrics>('/api/metrics/dashboard', fetcher, { refreshInterval: 30000 })
  const { data: remindersData } = useSWR<{ reminders: Reminder[] }>('/api/reminders', fetcher, { refreshInterval: 15000 })
  const { data: activityData } = useSWR<{ activities: ActivityLog[] }>('/api/metrics/activity', fetcher)
  const router = useRouter()
  const [isDemo, setIsDemo] = useState(false)
  const [userName, setUserName] = useState('there')

  useEffect(() => {
    const u = getLoggedInUser()
    if (!u) {
      router.replace('/login')
      return
    }
    setIsDemo(isDemoUser())
    setUserName(u.name.split(' ')[0])
  }, [])

  const fallbackDashboard = isDemo ? DEMO_DASHBOARD : EMPTY_DASHBOARD
  const reminders = (remindersData?.reminders?.length ? remindersData.reminders : null) ?? (isDemo ? DEMO_REMINDERS : [])
  const activities = (activityData?.activities?.length ? activityData.activities : null) ?? (isDemo ? DEMO_ACTIVITY : [])
  const rawMetrics = metrics ?? null
  const m = (rawMetrics && Object.keys(rawMetrics).length ? rawMetrics : null) ?? fallbackDashboard
  const totalMinutes = m.cognitive?.total_minutes ?? 0
  const urgentCount = reminders.filter(r => r.priority === 'high').length

  const familyCount = m.family?.total_persons ?? 0
  const medicineCount = m.health?.active_medicines ?? 0
  const schoolCount = m.school?.active_events ?? 0
  const reminderCount = m.reminders?.total_pending ?? 0

  const statCards = [
    {
      label: 'Family', value: familyCount,
      note: familyCount > 0 ? `${m.family?.upcoming_birthdays_30days ?? 0} birthdays soon` : 'Add members',
      color: '#5b2d8e', pill: 'pill-plum',
    },
    {
      label: 'Medicines', value: medicineCount,
      note: medicineCount > 0 ? `${m.health?.refills_needed ?? 0} refill needed` : 'Add medicines',
      color: '#c8456c', pill: 'pill-rose',
    },
    {
      label: 'School', value: schoolCount,
      note: schoolCount > 0 ? `${m.school?.fees_pending ?? 0} fee pending` : 'Add events',
      color: '#0d7c6e', pill: 'pill-teal',
    },
    {
      label: 'Reminders', value: reminderCount,
      note: `${urgentCount} urgent`,
      color: '#b45309', pill: 'pill-amber',
    },
  ]

  return (
    <div className="page-content">

      {/* ── Greeting ── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1118', letterSpacing: '-0.3px', marginBottom: 2 }}>
          Good morning, {userName} 👋
        </h1>
        <p style={{ fontSize: 13, color: '#8b7d97' }}>Here's what SaheliAI managed for you today.</p>
      </div>

      {/* ── Cognitive Hero Card ── */}
      <div style={{
        background: 'linear-gradient(130deg, #5b2d8e 0%, #7b4ab5 55%, #c8456c 100%)',
        borderRadius: 22,
        padding: '22px 20px',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative rings */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -20, right: -20, width: 110, height: 110, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />

        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 6 }}>
          Cognitive Load Reduced
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 52, fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '-2px' }}>
            <AnimatedNumber value={totalMinutes} />
          </span>
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>min saved</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>
          {(totalMinutes / 60).toFixed(1)} hours returned to you this month
        </p>

        {/* Mini stats row */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Reminders', value: m.reminders?.total_pending ?? 0 },
            { label: 'Tasks done', value: m.school?.circulars_processed ?? 0 },
            { label: 'Drafted', value: m.cognitive?.messages_drafted ?? 0 },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: 'rgba(255,255,255,0.14)', borderRadius: 12,
              padding: '10px 8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1 }}>
                <AnimatedNumber value={s.value} duration={1400} />
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat cards — horizontal scroll ── */}
      <div className="section-header">
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1118' }}>Overview</span>
      </div>
      <div className="scroll-row" style={{ marginBottom: 20 }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1118', marginBottom: 6 }}>{s.label}</div>
            <span className={`pill ${s.pill}`} style={{ fontSize: 10 }}>{s.note}</span>
          </div>
        ))}
      </div>

      {/* ── Today's Reminders ── */}
      <div className="card" style={{ padding: '16px', marginBottom: 16 }}>
        <div className="section-header">
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1118' }}>Today's Reminders</span>
          {urgentCount > 0 && <span className="pill pill-rose">{urgentCount} urgent</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {reminders.map((r, idx) => (
            <div key={r.id} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: '11px 0',
              borderTop: idx === 0 ? 'none' : '1px solid #f0eaf3',
            }}>
              <div style={{ width: 3, borderRadius: 2, alignSelf: 'stretch', background: TYPE_COLOR[r.type] || '#5b2d8e', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1118', marginBottom: 2, lineHeight: 1.4 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: '#8b7d97', lineHeight: 1.4 }}>{r.body}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: TYPE_COLOR[r.type] || '#5b2d8e', whiteSpace: 'nowrap', flexShrink: 0, paddingTop: 2 }}>
                {TYPE_LABEL[r.type]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Activity log ── */}
      <div className="card" style={{ padding: '16px', marginBottom: 16 }}>
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1118' }}>AI Actions</span>
            <span className="ai-badge">SaheliAI</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activities.slice(0, 4).map((a, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid #f0eaf3',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: a.agent === 'health' ? '#f0eaf8' : a.agent === 'relationship' ? '#fceef3' : '#e8f6f4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                color: a.agent === 'health' ? '#5b2d8e' : a.agent === 'relationship' ? '#c8456c' : '#0d7c6e',
              }}>
                {a.agent === 'health' ? 'H' : a.agent === 'relationship' ? 'R' : 'S'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#8b7d97', marginBottom: 2 }}>
                  {AGENT_LABEL[a.agent] || a.agent} Agent
                </div>
                <div style={{ fontSize: 12, color: '#4a3d56', lineHeight: 1.4 }}>{a.summary}</div>
                <div style={{ marginTop: 4 }}>
                  <span className="pill pill-teal" style={{ fontSize: 10, padding: '2px 7px' }}>+{a.minutes_saved} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How Saheli helps strip ── */}
      <div style={{
        background: '#f0eaf8', border: '1px solid rgba(91,45,142,0.15)',
        borderRadius: 16, padding: '14px 16px', marginBottom: 8,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5b2d8e', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
          How SaheliAI helps you
        </div>
        {[
          { name: 'Health Agent', desc: 'Reads prescriptions · Tracks doses · Alerts on refills' },
          { name: 'Relationship Agent', desc: 'Surfaces birthdays · Gift ideas · Drafts messages' },
          { name: 'School Agent', desc: 'Parses circulars · Tracks fees · Drafts teacher replies' },
        ].map(ag => (
          <div key={ag.name} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#5b2d8e', marginBottom: 2 }}>{ag.name}</div>
            <div style={{ fontSize: 11, color: '#8b7d97', lineHeight: 1.5 }}>{ag.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Floating Chat FAB ── */}
      <button
        className="fab"
        onClick={() => router.push('/chat')}
        aria-label="Ask Saheli AI"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37A9.95 9.95 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14H7v-2h6v2zm2-4H7v-2h8v2zm0-4H7V6h8v2z" />
        </svg>
      </button>
    </div>
  )
}
