// lib/demoData.ts — Client-side demo data for frontend-only operation
// Used as SWR fallback when backend is not running

import type { Person, BirthdayEvent, Medicine, Prescription, SchoolEvent, Child, Reminder, CognitiveMetrics, DashboardMetrics, ActivityLog } from './types'

// Relations counted as "family members" on the dashboard
export const FAMILY_RELATIONS = ['Mother', 'Father', 'Husband', 'Wife', 'Sister', 'Brother', 'Son', 'Daughter', 'Mother-in-law', 'Father-in-law', 'Grandmother', 'Grandfather']
export const isFamilyMember = (relation: string) => FAMILY_RELATIONS.includes(relation)

export const DEMO_PERSONS: (Person & { days_until_birthday: number })[] = [
    { id: 'p1', name: 'Lakshmi Devi', relation: 'Mother', birthday: '1960-03-18', gift_budget: 5000, phone: '+919876543210', days_until_birthday: 17 },
    { id: 'p2', name: 'Rajesh Kumar', relation: 'Father', birthday: '1958-08-12', gift_budget: 4000, phone: '+919876543211', days_until_birthday: 163 },
    { id: 'p3', name: 'Vikram Sharma', relation: 'Husband', birthday: '1985-04-05', gift_budget: 8000, phone: '+919876543212', days_until_birthday: 35 },
    { id: 'p4', name: 'Meera Sharma', relation: 'Sister', birthday: '1990-11-20', gift_budget: 3000, phone: '+919876543213', days_until_birthday: 264 },
    { id: 'p5', name: 'Rohan Verma', relation: 'Friend', birthday: '1987-03-04', gift_budget: 2000, phone: '+919876543214', days_until_birthday: 3 },
]

export const DEMO_BIRTHDAYS: BirthdayEvent[] = [
    { id: 'p5', person_name: 'Rohan Verma', relation: 'Friend', days_until: 3, birthday: 'March 4', gift_budget: 2000, has_suggestions: false },
    { id: 'p1', person_name: 'Lakshmi Devi', relation: 'Mother', days_until: 17, birthday: 'March 18', gift_budget: 5000, has_suggestions: false },
    { id: 'p3', person_name: 'Vikram Sharma', relation: 'Husband', days_until: 35, birthday: 'April 5', gift_budget: 8000, has_suggestions: false },
]

export const DEMO_MEDICINES: Medicine[] = [
    {
        id: 'm1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', schedule_times: ['08:00', '21:00'],
        pills_remaining: 24, total_pills: 60, prescribed_for: 'Lakshmi Devi (Mother)',
        start_date: '2026-02-01', end_date: '2026-03-03', is_active: true,
        today_status: [{ time: '08:00', status: 'taken' }, { time: '21:00', status: 'pending' }],
    },
    {
        id: 'm2', name: 'Vitamin D3', dosage: '60000 IU', frequency: 'Once weekly', schedule_times: ['08:00'],
        pills_remaining: 8, total_pills: 13, prescribed_for: 'Priya (Self)',
        start_date: '2026-01-05', end_date: '2026-04-05', is_active: true, today_status: [],
    },
    {
        id: 'm3', name: 'Atorvastatin', dosage: '10mg', frequency: 'Once daily at night', schedule_times: ['21:00'],
        pills_remaining: 5, total_pills: 30, prescribed_for: 'Lakshmi Devi (Mother)',
        start_date: '2026-02-01', end_date: '2026-03-03', is_active: true, refill_needed: true,
        today_status: [{ time: '21:00', status: 'pending' }],
    },
]

export const DEMO_PRESCRIPTIONS: Prescription[] = [
    { id: 'rx1', doctor_name: 'Dr. Ramesh Sharma', prescribed_for: 'Lakshmi Devi (Mother)', prescription_date: '2026-02-01', medicine_count: 2, processed: true },
    { id: 'rx2', doctor_name: 'Dr. Anita Kaur', prescribed_for: 'Priya (Self)', prescription_date: '2026-01-05', medicine_count: 1, processed: true },
]

export const DEMO_CHILDREN: Child[] = [
    { id: 'c1', name: 'Arjun Sharma', class_name: 'Class 5', school_name: "St. Mary's International School", section: 'B' },
]

export const DEMO_EVENTS: SchoolEvent[] = [
    {
        id: 'e1', event_name: 'Annual Sports Day', event_date: '2026-03-15', deadline_date: '2026-03-10',
        fee_amount: 250, fee_paid: false, special_instructions: 'Send P.E. kit and sports shoes',
        child_name: 'Arjun Sharma', days_until: 14, days_until_deadline: 9, action_required: true,
        whatsapp_reply_draft: "Respected Ma'am, Thank you for informing about the Annual Sports Day. Arjun will be prepared. Warm regards, Priya Sharma",
    },
    {
        id: 'e2', event_name: 'Parent-Teacher Meeting', event_date: '2026-03-20', deadline_date: '2026-03-18',
        fee_amount: undefined, fee_paid: false, special_instructions: 'Bring previous term report card',
        child_name: 'Arjun Sharma', days_until: 19, days_until_deadline: 17, action_required: true,
        whatsapp_reply_draft: "Respected Sir/Ma'am, Thank you for the reminder about PTM on March 20th. We will be present. Regards, Priya Sharma",
    },
]

export const DEMO_REMINDERS: Reminder[] = [
    { id: 'r1', type: 'birthday', title: "Rohan Verma's Birthday — 3 days away", body: 'Consider ordering a gift. Budget: ₹2,000. AI gift suggestions ready.', status: 'pending', trigger_at: '2026-03-04T08:00:00+05:30', entity_type: 'person', priority: 'high' },
    { id: 'r2', type: 'medicine', title: 'Atorvastatin — Refill needed', body: 'Lakshmi Devi (Mother) has only 5 pills remaining. Refill by March 6.', status: 'pending', trigger_at: '2026-03-01T08:00:00+05:30', entity_type: 'medicine', priority: 'high' },
    { id: 'r3', type: 'school_event', title: 'Sports Day — Fee due in 9 days', body: "Arjun's Annual Sports Day. ₹250 to be paid by March 10.", status: 'pending', trigger_at: '2026-03-05T08:00:00+05:30', entity_type: 'school_event', priority: 'medium' },
    { id: 'r4', type: 'medicine', title: 'Metformin — Evening dose pending', body: 'Lakshmi Devi (Mother) — 500mg after dinner', status: 'pending', trigger_at: '2026-03-01T21:00:00+05:30', entity_type: 'medicine', priority: 'medium' },
]

export const DEMO_DASHBOARD: DashboardMetrics = {
    cognitive: { total_minutes: 247, reminders_count: 34, tasks_handled: 18, messages_drafted: 9, breakdown: [] },
    // 4 family members — Friend (Rohan Verma) is excluded from family count
    family: { total_persons: 4, upcoming_birthdays_30days: 2, next_birthday_days: 17 },
    health: { active_medicines: 3, refills_needed: 1, prescriptions_processed: 2 },
    school: { active_events: 2, fees_pending: 1, circulars_processed: 2 },
    reminders: { total_pending: 4, high_priority: 2 },
}

export const DEMO_ACTIVITY: ActivityLog[] = [
    { agent: 'health', action: 'prescription_ocr_processed', summary: 'Metformin 500mg + Vitamin D3 extracted from Dr. Sharma\'s prescription', minutes_saved: 15, timestamp: '2026-03-01T10:23:00+05:30' },
    { agent: 'relationship', action: 'gift_suggestion_generated', summary: '3 gift ideas generated for Rohan Verma\'s birthday (₹2000 budget)', minutes_saved: 12, timestamp: '2026-03-01T09:15:00+05:30' },
    { agent: 'school', action: 'circular_parsed', summary: 'Annual Sports Day details extracted — deadline March 10, ₹250 fee', minutes_saved: 10, timestamp: '2026-02-28T14:30:00+05:30' },
    { agent: 'relationship', action: 'whatsapp_draft_generated', summary: 'Birthday message drafted for Meera Sharma (Sister)', minutes_saved: 5, timestamp: '2026-02-27T08:00:00+05:30' },
    { agent: 'health', action: 'refill_alert_sent', summary: 'Atorvastatin 10mg — 5 days remaining. Refill by March 6.', minutes_saved: 6, timestamp: '2026-02-26T08:00:00+05:30' },
]
