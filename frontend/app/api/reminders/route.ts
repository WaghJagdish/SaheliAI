import { NextResponse } from 'next/server'

export async function GET() {
  const reminders = [
    { id: 'r1', text: 'Take medicine', time: '2026-03-03T08:00:00Z' },
    { id: 'r2', text: 'Attend school meeting', time: '2026-03-04T14:00:00Z' },
  ]
  return NextResponse.json({ reminders })
}
