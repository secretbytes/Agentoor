import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename')

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    const blob = await put(filename, file, {
      access: 'public',
    })

    return NextResponse.json(blob)
  } catch (error) {
    console.error('Error in blob storage:', error)
    return NextResponse.json({ error: 'Failed to store file' }, { status: 500 })
  }
}

