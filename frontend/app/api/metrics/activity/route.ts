import { NextResponse } from 'next/server'

export async function GET() {
  const activity = { steps: 4234, active_minutes: 32 }
  return NextResponse.json({ activity })
}
