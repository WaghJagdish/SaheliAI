import { NextResponse } from 'next/server'

export async function GET() {
  const dashboard = { users: 124, active_today: 12 }
  return NextResponse.json({ dashboard })
}
