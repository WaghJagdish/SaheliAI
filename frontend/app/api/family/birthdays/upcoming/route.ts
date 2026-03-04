import { NextResponse } from 'next/server'

export async function GET() {
  const birthdays = [
    { id: '1', name: 'Ravi', date: '2026-03-10' },
    { id: '2', name: 'Asha', date: '2026-03-21' },
  ]
  return NextResponse.json({ birthdays })
}
