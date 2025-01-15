import { NextResponse } from 'next/server'
import { analyzeImageWithGemini } from '@/lib/gemini'

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 })
    }

    console.log('Received vision request for Gemini Pro Vision. Image URL:', imageUrl)

    const analysis = await analyzeImageWithGemini(imageUrl)

    console.log('Raw Gemini Pro Vision analysis result:', analysis)

    let parsedAnalysis
    try {
      if (typeof analysis === 'string') {
        const cleanedAnalysis = analysis.replace(/^[`json\s]+|[`]+$/g, '')
        parsedAnalysis = cleanedAnalysis
      } else {
        parsedAnalysis = analysis
      }
    } catch (error) {
      console.error('Error parsing Gemini analysis result:', error)
      return NextResponse.json({
        error: 'Failed to parse analysis result from Gemini Pro Vision',
        details: error instanceof Error ? error.message : String(error),
      }, { status: 500 })
    }

    return NextResponse.json({
      content: parsedAnalysis,
      agent: 'vision',
    })

  } catch (error) {
    console.error('Error in vision API with Gemini Pro Vision:', error)
    return NextResponse.json({
      error: 'Failed to process vision request with Gemini Pro Vision',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

export const runtime = 'edge'

