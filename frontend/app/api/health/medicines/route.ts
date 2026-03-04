import { NextResponse } from 'next/server'

export async function GET() {
  const medicines = [
    { id: 'm1', name: 'Paracetamol', dose: '500mg', schedule: ['08:00', '20:00'] },
    { id: 'm2', name: 'Ibuprofen', dose: '200mg', schedule: ['12:00'] },
  ]
  return NextResponse.json({ medicines })
}
