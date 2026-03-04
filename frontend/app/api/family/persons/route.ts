import { NextResponse } from 'next/server'

export async function GET() {
  const persons = [
    { id: '1', name: 'Asha', age: 34, relation: 'mother' },
    { id: '2', name: 'Ravi', age: 8, relation: 'child' },
  ]
  return NextResponse.json({ persons })
}

export async function POST(request: Request) {
  const body = await request.json()
  const created = { id: String(Date.now()), ...body }
  return NextResponse.json(created, { status: 201 })
}
