'use client';

import React from 'react';
import { MessageSquare, AlertCircle, CheckCircle2, Star, Percent } from 'lucide-react';
import { Review } from '@/lib/db';

interface StatsOverviewProps {
  reviews: Review[];
}

export default function StatsOverview({ reviews }: StatsOverviewProps) {
  const total = reviews.length;
  const pending = reviews.filter(r => r.status === 'pending').length;
  const resolved = reviews.filter(r => r.status === 'resolved').length;
  
  // Calculate average rating
  const avgRating = total > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) 
    : '0.0';

  // Calculate percentage resolved
  const resolvedPercent = total > 0 
    ? Math.round((resolved / total) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 md:gap-4 max-w-7xl mx-auto px-6 mb-6">
      {/* Total Card */}
      <div className="glass-card p-4 rounded-xl flex items-center gap-3.5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all duration-300"></div>
        <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400">Tổng Đánh Giá</p>
          <h3 className="text-xl md:text-2xl font-bold text-white mt-0.5">{total}</h3>
        </div>
      </div>

      {/* Pending Card */}
      <div className="glass-card p-4 rounded-xl flex items-center gap-3.5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all duration-300"></div>
        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400">Đang Chờ Xử Lý</p>
          <h3 className="text-xl md:text-2xl font-bold text-white mt-0.5">{pending}</h3>
        </div>
      </div>

      {/* Resolved Card */}
      <div className="glass-card p-4 rounded-xl flex items-center gap-3.5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all duration-300"></div>
        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400">Đã Phản Hồi</p>
          <h3 className="text-xl md:text-2xl font-bold text-white mt-0.5">{resolved}</h3>
        </div>
      </div>

      {/* Average Rating Card */}
      <div className="glass-card p-4 rounded-xl flex items-center gap-3.5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-all duration-300"></div>
        <div className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          <Star className="h-5 w-5 fill-yellow-400/20 text-yellow-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400">Đánh Giá Trung Bình</p>
          <h3 className="text-xl md:text-2xl font-bold text-white mt-0.5 flex items-baseline gap-1">
            {avgRating} <span className="text-xs font-normal text-gray-500">/ 5</span>
          </h3>
        </div>
      </div>

      {/* Conversion Rate Card */}
      <div className="glass-card p-4 rounded-xl flex items-center gap-3.5 col-span-2 lg:col-span-1 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all duration-300"></div>
        <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Percent className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 font-sans">Tỷ Lệ Phản Hồi</p>
          <h3 className="text-xl md:text-2xl font-bold text-white mt-0.5">{resolvedPercent}%</h3>
        </div>
      </div>
    </div>
  );
}
