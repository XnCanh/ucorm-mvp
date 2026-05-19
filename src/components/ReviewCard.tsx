'use client';

import React from 'react';
import { Star, CheckCircle, Clock } from 'lucide-react';
import { Review } from '@/lib/db';

interface ReviewCardProps {
  review: Review;
  isActive: boolean;
  onClick: () => void;
}

export default function ReviewCard({ review, isActive, onClick }: ReviewCardProps) {
  // Format publish time or show relative date
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return timeStr;
    }
  };

  // Helper to generate initials for avatar placeholder
  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'U';
  };

  return (
    <div
      onClick={onClick}
      className={`glass-card p-4 rounded-xl cursor-pointer ${
        isActive ? 'glass-card-active' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        {review.author_photo_url ? (
          <img
            src={review.author_photo_url}
            alt={review.author_name}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-gray-800 shrink-0"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback to initials if image load fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
            {getInitials(review.author_name)}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <h4 className="text-sm font-semibold text-white truncate pr-1">
              {review.author_name}
            </h4>
            <span className="text-[10px] text-gray-500 shrink-0">
              {formatTime(review.publish_time)}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < review.rating
                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.2)]'
                    : 'text-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Text Snippet */}
          <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
            {review.text || <em className="text-gray-600">(Không có nội dung đánh giá)</em>}
          </p>

          {/* Footer Status */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-900">
            {review.status === 'resolved' ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <CheckCircle className="h-3 w-3" />
                Đã phản hồi
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                <Clock className="h-3 w-3" />
                Chờ xử lý
              </span>
            )}
            
            {review.ai_responses && (
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                AI Ready
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
