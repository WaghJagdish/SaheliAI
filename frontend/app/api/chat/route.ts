import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const message = body?.message || ''
  const reply = `Echo: ${message}`
  return NextResponse.json({ reply, minutes_saved: 0.5 })
}
