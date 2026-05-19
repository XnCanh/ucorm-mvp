'use client';

import React, { useState } from 'react';
import { Filter, Star, Info } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { Review } from '@/lib/db';

interface ReviewListProps {
  reviews: Review[];
  activeId: string | null;
  onSelect: (review: Review) => void;
}

type StatusFilter = 'all' | 'pending' | 'resolved';

export default function ReviewList({ reviews, activeId, onSelect }: ReviewListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  const countPending = reviews.filter((r) => r.status === 'pending').length;
  const countResolved = reviews.filter((r) => r.status === 'resolved').length;

  // Filter logic
  const filteredReviews = reviews.filter((r) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && r.status === 'pending') ||
      (statusFilter === 'resolved' && r.status === 'resolved');

    const matchesRating = ratingFilter === 'all' || r.rating === ratingFilter;

    return matchesStatus && matchesRating;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search Filter Section */}
      <div className="p-4 border-b border-gray-800 bg-gray-950/20">
        {/* Status Tabs */}
        <div className="flex bg-gray-900/60 p-1 rounded-xl border border-gray-800/80 mb-3">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Tất cả ({reviews.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Chưa trả lời ({countPending})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              statusFilter === 'resolved'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Đã trả lời ({countResolved})
          </button>
        </div>

        {/* Rating Select Filter */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
            <Filter className="h-3 w-3" />
            Lọc theo số sao
          </span>
          <select
            value={ratingFilter}
            onChange={(e) =>
              setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="bg-gray-900 border border-gray-850 text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            <option value="all">Tất cả số sao</option>
            <option value="5">5 sao ⭐⭐⭐⭐⭐</option>
            <option value="4">4 sao ⭐⭐⭐⭐</option>
            <option value="3">3 sao ⭐⭐⭐</option>
            <option value="2">2 sao ⭐⭐</option>
            <option value="1">1 sao ⭐</option>
          </select>
        </div>
      </div>

      {/* Review Cards list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[600px] min-h-[400px]">
        {filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="p-3 bg-gray-900/60 rounded-full border border-gray-800 text-gray-500 mb-3.5">
              <Info className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-gray-400">Không tìm thấy đánh giá</p>
            <p className="text-xs text-gray-600 mt-1 max-w-[200px]">
              Không có review nào khớp với bộ lọc bạn chọn.
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isActive={activeId === review.id}
              onClick={() => onSelect(review)}
            />
          ))
        )}
      </div>
    </div>
  );
}
