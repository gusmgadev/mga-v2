import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 })
  }

  const ext = (file.name.split('.').pop() ?? 'png').toLowerCase()
  const fileName = `logo-${Date.now()}.${ext}`
  const logosDir = path.join(process.cwd(), 'public', 'images', 'logos')

  await mkdir(logosDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(logosDir, fileName), buffer)

  return NextResponse.json({ url: `/images/logos/${fileName}` })
}
