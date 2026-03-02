'use client'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'
import type { BirthdayEvent, Medicine, SchoolEvent, ActivityLog } from '@/lib/types'
import { DEMO_BIRTHDAYS, DEMO_MEDICINES, DEMO_EVENTS, DEMO_ACTIVITY } from '@/lib/demoData'

type TLItem = {
    id: string
    type: 'birthday' | 'medicine_refill' | 'school_event' | 'activity'
    date: string
    daysFrom: number
    title: string
    subtitle: string
    icon: string
    urgency: 'high' | 'medium' | 'low'
    badge?: string
}

const URGENCY_COLOR = { high: '#c8456c', medium: '#b45309', low: '#5b2d8e' }

function TimelineItem({ item }: { item: TLItem }) {
    const color = URGENCY_COLOR[item.urgency]
    const past = item.daysFrom < 0

    return (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            {/* Date + dot column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 52, flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: past ? '#b8aac4' : '#1a1118', textAlign: 'center', lineHeight: 1.2 }}>
                    {item.date.slice(5).replace('-', '/')}
                </div>
                <div style={{ fontSize: 10, color: '#b8aac4', marginBottom: 6, textAlign: 'center' }}>
                    {item.daysFrom === 0 ? 'Today' : item.daysFrom < 0 ? `${Math.abs(item.daysFrom)}d ago` : `in ${item.daysFrom}d`}
                </div>
                <div style={{ width: 2, flex: 1, minHeight: 20, background: 'var(--border-soft)' }} />
            </div>

            {/* Card */}
            <div className="card" style={{
                flex: 1, padding: '12px 14px', marginBottom: 10, opacity: past ? 0.55 : 1,
                borderLeft: `3px solid ${past ? 'var(--border)' : color}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: past ? '#8b7d97' : '#1a1118', marginBottom: 2 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: '#8b7d97' }}>{item.subtitle}</div>
                    </div>
                    {item.badge && !past && (
                        <span className={`pill ${item.urgency === 'high' ? 'pill-rose' : item.urgency === 'medium' ? 'pill-amber' : 'pill-plum'}`} style={{ fontSize: 10, flexShrink: 0 }}>
                            {item.badge}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function TimelinePage() {
    const { data: birthdaysData } = useSWR<{ birthdays: BirthdayEvent[] }>('/api/family/birthdays/upcoming', fetcher)
    const { data: medData } = useSWR<{ medicines: Medicine[] }>('/api/health/medicines', fetcher)
    const { data: evData } = useSWR<{ events: SchoolEvent[] }>('/api/school/events', fetcher)
    const { data: actData } = useSWR<{ activities: ActivityLog[] }>('/api/metrics/activity', fetcher)
    const today = new Date()

    const items: TLItem[] = []
        ; (birthdaysData?.birthdays || DEMO_BIRTHDAYS).forEach(b => {
            items.push({
                id: 'b_' + b.id, type: 'birthday',
                date: '2026-' + b.birthday.slice(5),
                daysFrom: b.days_until,
                title: `${b.person_name}'s Birthday`,
                subtitle: `${b.relation} · Budget ₹${b.gift_budget?.toLocaleString('en-IN')}`,
                icon: '🎂',
                urgency: b.days_until <= 3 ? 'high' : b.days_until <= 14 ? 'medium' : 'low',
                badge: b.days_until <= 3 ? `${b.days_until}d left` : undefined,
            })
        })
        ; (medData?.medicines || DEMO_MEDICINES).filter(m => m.refill_needed || m.pills_remaining <= 7).forEach(m => {
            items.push({
                id: 'rx_' + m.id, type: 'medicine_refill', date: m.end_date,
                daysFrom: Math.round((new Date(m.end_date).getTime() - today.getTime()) / 86400000),
                title: `${m.name} Refill Due`,
                subtitle: `${m.prescribed_for} · ${m.pills_remaining} pills remaining`,
                icon: '💊',
                urgency: m.pills_remaining <= 3 ? 'high' : 'medium',
                badge: `${m.pills_remaining} left`,
            })
        })
        ; (evData?.events || DEMO_EVENTS).forEach(e => {
            items.push({
                id: 'ev_' + e.id, type: 'school_event', date: e.event_date,
                daysFrom: e.days_until,
                title: e.event_name,
                subtitle: `${e.child_name}${e.fee_amount ? ` · ₹${e.fee_amount} fee` : ''}${e.fee_paid ? ' ✓' : ''}`,
                icon: '🏫',
                urgency: (e.days_until_deadline || 99) <= 3 ? 'high' : (e.days_until_deadline || 99) <= 7 ? 'medium' : 'low',
                badge: e.fee_amount && !e.fee_paid ? `₹${e.fee_amount} due` : undefined,
            })
        })
        ; (actData?.activities || DEMO_ACTIVITY).slice(0, 3).forEach((a, i) => {
            const d = new Date(a.timestamp)
            items.push({
                id: 'act_' + i, type: 'activity',
                date: d.toISOString().slice(0, 10),
                daysFrom: Math.round((d.getTime() - today.getTime()) / 86400000),
                title: a.summary,
                subtitle: `+${a.minutes_saved} minutes saved · ${a.agent} agent`,
                icon: '⚡', urgency: 'low', badge: `+${a.minutes_saved}min`,
            })
        })
    items.sort((a, b) => a.daysFrom - b.daysFrom)

    const filterCounts = [
        ['🎂', items.filter(i => i.type === 'birthday').length],
        ['💊', items.filter(i => i.type === 'medicine_refill').length],
        ['🏫', items.filter(i => i.type === 'school_event').length],
        ['⚡', items.filter(i => i.type === 'activity').length],
    ] as [string, number][]

    return (
        <div className="page-content">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1118', letterSpacing: '-0.3px', marginBottom: 2 }}>Timeline</h1>
                <p style={{ fontSize: 13, color: '#8b7d97' }}>All events & reminders in one place.</p>
            </div>

            {/* Summary chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {filterCounts.filter(([, c]) => c > 0).map(([icon, count]) => (
                    <span key={icon} className="pill pill-plum" style={{ fontSize: 12 }}>
                        {icon} {count}
                    </span>
                ))}
            </div>

            {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#b8aac4' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                    <div style={{ fontWeight: 600, color: '#8b7d97' }}>All clear! No upcoming events.</div>
                </div>
            ) : (
                <div>
                    {items.map(item => <TimelineItem key={item.id} item={item} />)}
                </div>
            )}
        </div>
    )
}
