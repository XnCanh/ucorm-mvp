'use client';

import React, { useState, useEffect } from 'react';
import { Star, Sparkles, Send, CheckCircle2, User, RefreshCw, Edit3, Languages, Loader2 } from 'lucide-react';
import { Review } from '@/lib/db';

interface AIResponsePanelProps {
  review: Review | null;
  onGenerateAI: (reviewId: string) => Promise<void>;
  onApprove: (reviewId: string, response: string) => Promise<void>;
  isGenerating: boolean;
  isApproving: boolean;
}

type TabType = 'standard' | 'friendly' | 'constructive';

export default function AIResponsePanel({
  review,
  onGenerateAI,
  onApprove,
  isGenerating,
  isApproving,
}: AIResponsePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('standard');
  const [editedResponse, setEditedResponse] = useState('');
  
  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  // Update editedResponse when review or active tab changes
  useEffect(() => {
    if (review?.ai_responses) {
      setEditedResponse(review.ai_responses[activeTab] || '');
    } else {
      setEditedResponse('');
    }
    // Reset translation when review changes
    setTranslatedText('');
  }, [review, activeTab]);

  if (!review) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[500px]">
        <div className="h-16 w-16 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-center mb-4 text-indigo-400/80 animate-bounce">
          <Sparkles className="h-8 w-8" />
        </div>
        <h3 className="text-base font-semibold text-gray-200">Bàn Làm Việc AI ORM</h3>
        <p className="text-xs text-gray-500 max-w-[280px] mt-1.5 leading-relaxed">
          Chọn một đánh giá từ danh sách bên trái để phân tích sắc thái và tự động tạo gợi ý trả lời bằng AI.
        </p>
      </div>
    );
  }

  // Format publish time or show relative date
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  const hasAIResponses = !!review.ai_responses;
  const isResolved = review.status === 'resolved';

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleApproveSubmit = () => {
    onApprove(review.id, editedResponse);
  };

  const handleTranslate = async () => {
    if (!review?.text || isTranslating) return;
    try {
      setIsTranslating(true);
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: review.text }),
      });
      const data = await res.json();
      if (data.success) {
        setTranslatedText(data.translation);
      }
    } catch (err) {
      console.error('Translation failed', err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Review Details Header */}
      <div className="p-5 border-b border-gray-800 bg-gray-950/20">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-850 flex items-center justify-center text-gray-400 border border-gray-800 shrink-0">
            {review.author_photo_url ? (
              <img
                src={review.author_photo_url}
                alt={review.author_name}
                className="h-12 w-12 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="h-5 w-5 text-gray-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate">{review.author_name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {/* Rating */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.25)]'
                        : 'text-gray-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-gray-500">•</span>
              <span className="text-xs text-gray-400">{formatTime(review.publish_time)}</span>
            </div>
          </div>

          <div>
            {isResolved ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Đã Duyệt
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                <ClockIcon className="h-3.5 w-3.5" />
                Chờ Xử Lý
              </span>
            )}
          </div>
        </div>

        {/* Customer Review Text */}
        <div className="mt-4 bg-gray-900/40 border border-gray-850 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              Nội dung đánh giá:
            </p>
            {review.text && (
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="text-xs flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
              >
                {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                {translatedText ? 'Dịch lại' : 'Dịch sang Tiếng Việt'}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-200 leading-relaxed italic whitespace-pre-wrap">
            "{translatedText || review.text || '(Khách hàng không viết nội dung đánh giá)'}"
          </p>
          {translatedText && (
            <p className="text-[10px] text-indigo-400 mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Đã dịch bằng AI
            </p>
          )}
        </div>
      </div>

      {/* Main Action Workstation */}
      <div className="flex-1 p-5 overflow-y-auto min-h-[300px]">
        {/* Scenario 1: Generating loading states */}
        {isGenerating ? (
          <div className="space-y-4 py-8">
            <div className="flex items-center justify-center gap-2 text-indigo-400 text-sm font-semibold animate-pulse">
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
              <span>AI đang phân tích & viết nháp 3 phản hồi...</span>
            </div>
            <div className="space-y-3 mt-4">
              <div className="h-10 bg-gray-900/60 border border-gray-850 rounded-lg shimmer"></div>
              <div className="h-36 bg-gray-900/60 border border-gray-850 rounded-xl shimmer p-4 space-y-2">
                <div className="h-3 w-3/4 bg-gray-800 rounded"></div>
                <div className="h-3 w-5/6 bg-gray-800 rounded"></div>
                <div className="h-3 w-2/3 bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        ) : isResolved ? (
          /* Scenario 2: Already Resolved */
          <div className="space-y-4">
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.02)]">
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Phản hồi đã duyệt thành công:
              </p>
              <div className="bg-gray-900/80 border border-gray-850 p-4 rounded-lg text-sm text-gray-300 leading-relaxed font-sans whitespace-pre-line">
                {review.selected_response}
              </div>
            </div>
          </div>
        ) : hasAIResponses ? (
          /* Scenario 3: AI responses ready, pending approval */
          <div className="space-y-4">
            {/* Tabs Selector */}
            <div className="flex bg-gray-900/60 p-1 rounded-xl border border-gray-850">
              <button
                onClick={() => handleTabChange('standard')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'standard'
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Tiêu chuẩn 💼
              </button>
              <button
                onClick={() => handleTabChange('friendly')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'friendly'
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Thân thiện 😊
              </button>
              <button
                onClick={() => handleTabChange('constructive')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'constructive'
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Khắc phục 🛠️
              </button>
            </div>

            {/* Editable Response Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  <Edit3 className="h-3 w-3" />
                  Bạn có thể chỉnh sửa lại phản hồi này trước khi duyệt:
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-extrabold border ${
                  activeTab === 'standard' 
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                    : activeTab === 'friendly' 
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {activeTab}
                </span>
              </div>
              <textarea
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
                rows={6}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 leading-relaxed font-sans placeholder:text-gray-600"
                placeholder="Câu phản hồi từ AI..."
              />
            </div>

            {/* Approve Button */}
            <button
              onClick={handleApproveSubmit}
              disabled={isApproving || !editedResponse.trim()}
              className="w-full ai-gradient-bg hover:opacity-95 text-white font-bold text-sm py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(99,102,241,0.25)] disabled:opacity-50 disabled:cursor-not-allowed hover-glow mt-4"
            >
              {isApproving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Đang ghi nhận vào Database...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Duyệt Câu Trả Lời (Approve & Resolve)
                </>
              )}
            </button>
          </div>
        ) : (
          /* Scenario 4: Review selected, but no AI responses yet */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.15)] animate-pulse">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-gray-200">Chưa Tạo Phản Hồi AI</h4>
            <p className="text-xs text-gray-500 max-w-[240px] mt-1.5 leading-relaxed">
              Nhấn nút bên dưới để gọi AI (Gemini/OpenAI) tự động viết nháp 3 phong cách trả lời cho review này.
            </p>
            <button
              onClick={() => onGenerateAI(review.id)}
              disabled={isGenerating}
              className="mt-5 bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg hover-glow border border-indigo-500/30"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Tạo Phản Hồi AI (Generate AI)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Small missing helper icon
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
