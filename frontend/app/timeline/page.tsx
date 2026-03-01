'use client'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'
import type { BirthdayEvent, Medicine, SchoolEvent, ActivityLog } from '@/lib/types'
import { DEMO_BIRTHDAYS, DEMO_MEDICINES, DEMO_EVENTS, DEMO_ACTIVITY } from '@/lib/demoData'

type TimelineItem = {
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

function TimelineCard({ item }: { item: TimelineItem }) {
    const color = item.urgency === 'high' ? '#f43f5e' : item.urgency === 'medium' ? '#f59e0b' : '#6366f1'
    const past = item.daysFrom < 0

    return (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            {/* Date column */}
            <div style={{ width: '80px', textAlign: 'right', flexShrink: 0, paddingTop: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: past ? '#a8a29e' : '#1c1917' }}>
                    {item.date.slice(5).replace('-', '/')}
                </div>
                <div style={{ fontSize: '11px', color: '#a8a29e', marginTop: '2px' }}>
                    {item.daysFrom === 0 ? 'Today' : item.daysFrom < 0 ? `${Math.abs(item.daysFrom)}d ago` : `in ${item.daysFrom}d`}
                </div>
            </div>

            {/* Line + dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div style={{ width: '2px', height: '14px', background: 'rgba(0,0,0,0.05)' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: past ? '#374151' : color, border: `2px solid ${past ? '#1f2937' : color}22`, flexShrink: 0, boxShadow: past ? 'none' : `0 0 10px ${color}55` }} />
                <div style={{ width: '2px', flex: 1, minHeight: '30px', background: 'rgba(0,0,0,0.05)' }} />
            </div>

            {/* Card */}
            <div className="card" style={{ flex: 1, padding: '14px 16px', marginBottom: '8px', opacity: past ? 0.6 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: past ? '#78716c' : '#1c1917', marginBottom: '3px' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: '#78716c' }}>{item.subtitle}</div>
                    </div>
                    {item.badge && !past && <span className={`badge badge-${item.urgency === 'high' ? 'red' : item.urgency === 'medium' ? 'amber' : 'blue'}`}>{item.badge}</span>}
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

    const items: TimelineItem[] = []

        // Birthdays
        ; (birthdaysData?.birthdays || DEMO_BIRTHDAYS).forEach(b => {
            const d = new Date(b.birthday + ' 2026')
            const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
            items.push({
                id: 'b_' + b.id,
                type: 'birthday',
                date: '2026-' + b.birthday.slice(5),
                daysFrom: b.days_until,
                title: `${b.person_name}'s Birthday`,
                subtitle: `${b.relation} · Budget ₹${b.gift_budget?.toLocaleString('en-IN')}`,
                icon: '🎂',
                urgency: b.days_until <= 3 ? 'high' : b.days_until <= 14 ? 'medium' : 'low',
                badge: b.days_until <= 3 ? `${b.days_until}d left` : undefined,
            })
        })

        // Medicine refills
        ; (medData?.medicines || DEMO_MEDICINES).filter(m => m.refill_needed || m.pills_remaining <= 7).forEach(m => {
            items.push({
                id: 'rx_' + m.id,
                type: 'medicine_refill',
                date: m.end_date,
                daysFrom: Math.round((new Date(m.end_date).getTime() - today.getTime()) / 86400000),
                title: `${m.name} Refill Due`,
                subtitle: `${m.prescribed_for} · ${m.pills_remaining} pills remaining`,
                icon: '💊',
                urgency: m.pills_remaining <= 3 ? 'high' : m.pills_remaining <= 7 ? 'medium' : 'low',
                badge: `${m.pills_remaining} left`,
            })
        })

        // School events
        ; (evData?.events || DEMO_EVENTS).forEach(e => {
            items.push({
                id: 'ev_' + e.id,
                type: 'school_event',
                date: e.event_date,
                daysFrom: e.days_until,
                title: e.event_name,
                subtitle: `${e.child_name}${e.fee_amount ? ` · ₹${e.fee_amount} fee` : ''}${e.fee_paid ? ' — Paid ' : ''}`,
                icon: '🏫',
                urgency: (e.days_until_deadline || 99) <= 3 ? 'high' : (e.days_until_deadline || 99) <= 7 ? 'medium' : 'low',
                badge: e.fee_amount && !e.fee_paid ? `₹${e.fee_amount} due` : undefined,
            })
        })

        // Recent activity
        ; (actData?.activities || DEMO_ACTIVITY).slice(0, 3).forEach((a, i) => {
            const d = new Date(a.timestamp)
            const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
            items.push({
                id: 'act_' + i,
                type: 'activity',
                date: d.toISOString().slice(0, 10),
                daysFrom: diff,
                title: a.summary,
                subtitle: `+${a.minutes_saved} minutes saved · ${a.agent} agent`,
                icon: '⚡',
                urgency: 'low',
                badge: `+${a.minutes_saved}min`,
            })
        })

    // Sort by daysFrom
    items.sort((a, b) => a.daysFrom - b.daysFrom)

    return (
        <div style={{ padding: '32px', maxWidth: '800px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1c1917', fontFamily: 'Plus Jakarta Sans', marginBottom: '6px' }}> Unified Timeline
                </h1>
                <p style={{ color: '#78716c', fontSize: '15px' }}>All your upcoming events, reminders, and agent actions — in one view.</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                {([['birthday', '🎂 Birthdays'], ['medicine_refill', '💊 Medicines'], ['school_event', '🏫 School'], ['activity', '⚡ Activity']] as const).map(([type, label]) => {
                    const count = items.filter(i => i.type === type).length
                    return count > 0 ? (
                        <span key={type} className="badge badge-blue" style={{ fontSize: '12px', padding: '5px 12px' }}>
                            {label} ({count})
                        </span>
                    ) : null
                })}
            </div>

            <div>
                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a8a29e' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}></div>
                        <div style={{ fontWeight: 600, color: '#78716c' }}>All clear! No upcoming events.</div>
                    </div>
                ) : (
                    items.map(item => <TimelineCard key={item.id} item={item} />)
                )}
            </div>
        </div>
    )
}
