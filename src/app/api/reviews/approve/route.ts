import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, response } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    if (response === undefined || response === null) {
      return NextResponse.json({ error: 'response is required' }, { status: 400 });
    }

    // Update status to resolved and save the selected response
    const updatedReview = await db.updateReviewStatus(reviewId, 'resolved', response);

    if (!updatedReview) {
      return NextResponse.json({ error: 'Review not found or failed to update' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      reviewId,
      review: updatedReview,
    });
  } catch (error: any) {
    console.error('API /api/reviews/approve error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
