import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateReplies } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    // 1. Fetch the review
    const review = await db.getReviewById(reviewId);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // 2. Call AI service to generate replies
    const aiResponses = await generateReplies(
      review.author_name,
      review.rating,
      review.text
    );

    // 3. Update the review with generated responses in the DB
    const updatedReview = await db.upsertReviews([{
      ...review,
      ai_responses: aiResponses,
    }]);

    return NextResponse.json({
      success: true,
      reviewId,
      aiResponses,
      review: updatedReview[0],
    });
  } catch (error: any) {
    console.error('API /api/ai/generate error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
