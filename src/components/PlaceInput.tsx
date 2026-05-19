'use client';

import React, { useState } from 'react';
import { Search, Loader2, Sparkles, HelpCircle, Info } from 'lucide-react';

interface PlaceInputProps {
  onFetch: (placeId: string) => Promise<void>;
  isLoading: boolean;
  hasGoogleKey?: boolean;
}

const SAMPLE_PLACES = [
  { name: 'JW Marriott Hanoi', id: 'ChIJaX7Ng4WrNTERg4EHmg6z020' },
  { name: 'Caravelle Saigon', id: 'ChIJW8j8H_EtdTERR_Zq6HqP_Lg' },
  { name: 'InterContinental Danang', id: 'ChIJL-m6_n0YQTER03j6Rmgm5-o' },
];

export default function PlaceInput({ onFetch, isLoading, hasGoogleKey = false }: PlaceInputProps) {
  const [placeId, setPlaceId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeId.trim()) {
      setError('Vui lòng nhập Google Place ID');
      return;
    }
    setError('');
    onFetch(placeId.trim());
  };

  const handleQuickSelect = (id: string) => {
    setPlaceId(id);
    setError('');
    onFetch(id);
  };

  return (
    <div className="glass-panel p-5 rounded-2xl max-w-7xl mx-auto px-6 mb-6">
      <div className="flex flex-col gap-4">
        {/* Title & Help */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
            <h2 className="text-sm font-semibold text-gray-200">
              Nhập Địa Điểm Quản Trị
            </h2>
          </div>
          <a
            href="https://developers.google.com/maps/documentation/places/web-service/place-id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="h-3 w-3" />
            Lấy Place ID ở đâu?
          </a>
        </div>

        {/* Input & Action */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={placeId}
              onChange={(e) => {
                setPlaceId(e.target.value);
                if (e.target.value) setError('');
              }}
              placeholder="Nhập Google Maps Place ID (ví dụ: ChIJaX7Ng4WrNTERg4EHmg6z020)"
              className={`w-full bg-gray-900/60 border ${
                error ? 'border-red-500/50 focus:border-red-500' : 'border-gray-800 focus:border-indigo-500/50'
              } text-white pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-gray-600`}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="ai-gradient-bg hover:opacity-95 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(99,102,241,0.2)] disabled:opacity-50 disabled:cursor-not-allowed hover-glow"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang Tải Review...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Đồng Bộ Đánh Giá
              </>
            )}
          </button>
        </form>

        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

        {/* Fallback Warning Note */}
        {!hasGoogleKey && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-300 leading-relaxed">
              <strong className="font-semibold text-blue-400">Chế độ Demo (Sample Data):</strong> Hệ thống nhận thấy chưa cấu hình khóa Google Places API. Để đảm bảo trải nghiệm đánh giá không bị gián đoạn, khi bấm đồng bộ, hệ thống sẽ tự động tạo dữ liệu mẫu (Sample Data) chân thực vào cơ sở dữ liệu để test luồng AI.
            </p>
          </div>
        )}

        {/* Quick Demo Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 font-medium">Chọn nhanh demo:</span>
          {SAMPLE_PLACES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleQuickSelect(p.id)}
              disabled={isLoading}
              className="text-xs bg-gray-900 hover:bg-indigo-500/10 hover:text-indigo-400 text-gray-400 border border-gray-800 hover:border-indigo-500/30 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
