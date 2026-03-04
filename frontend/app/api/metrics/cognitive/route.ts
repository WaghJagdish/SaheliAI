import { NextResponse } from 'next/server'

export async function GET() {
  const cognitive = { score: 78, history: [75, 76, 78] }
  return NextResponse.json({ cognitive })
}
