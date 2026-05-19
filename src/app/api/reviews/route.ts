import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isGeminiConfigured, isOpenAiConfigured } from '@/lib/ai';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId') || undefined;

    const reviews = await db.getReviews(placeId);

    const hasGoogleKey = !!process.env.GOOGLE_PLACES_API_KEY && 
                         process.env.GOOGLE_PLACES_API_KEY !== 'your-google-places-api-key' && 
                         process.env.GOOGLE_PLACES_API_KEY !== '';

    return NextResponse.json({
      success: true,
      count: reviews.length,
      dbSource: isSupabaseConfigured ? 'Supabase' : 'Local DB (JSON)',
      apiKeysStatus: {
        gemini: isGeminiConfigured,
        openai: isOpenAiConfigured,
        google: hasGoogleKey,
      },
      reviews,
    });
  } catch (error: any) {
    console.error('API /api/reviews error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
