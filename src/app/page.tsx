'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Info, AlertTriangle, CheckCircle, RefreshCcw, Wand2, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import StatsOverview from '@/components/StatsOverview';
import PlaceInput from '@/components/PlaceInput';
import ReviewList from '@/components/ReviewList';
import AIResponsePanel from '@/components/AIResponsePanel';
import { Review } from '@/lib/db';

export default function Dashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('all');
  
  // Status flags
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  
  // Envs status
  const [dbSource, setDbSource] = useState<'Supabase' | 'Local DB (JSON)'>('Local DB (JSON)');
  const [apiKeysStatus, setApiKeysStatus] = useState({
    gemini: false,
    openai: false,
    google: false,
  });

  // Notification Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'warning' | 'info';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  // Show dynamic toast helper
  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Load reviews from API
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success) {
        const allReviews = data.reviews || [];
        setReviews(allReviews);
        setDbSource(data.dbSource || 'Local DB (JSON)');
        setApiKeysStatus(data.apiKeysStatus || { gemini: false, openai: false, google: false });
        
        // Set active review to the first review overall
        if (allReviews.length > 0) {
          setActiveReview(allReviews[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load initial reviews:', err);
      showToast('Không thể kết nối đến máy chủ API', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Handler: Sync reviews via Place ID
  const handleSyncPlaceReviews = async (placeId: string) => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/places/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId }),
      });
      const data = await res.json();

      if (data.success) {
        const newReviews = data.reviews || [];
        
        // Merge new reviews with existing ones, overwriting duplicates
        setReviews(prev => {
          const filteredPrev = prev.filter(r => r.place_id !== placeId);
          return [...newReviews, ...filteredPrev];
        });
        
        setSelectedPlaceId(placeId);
        
        // Refresh system source info if any changed
        if (data.source === 'google-api') {
          showToast(`Đồng bộ thành công 5 đánh giá thực tế từ Google Maps!`, 'success');
        } else {
          showToast(`Không có khóa Google Maps. Đã đồng bộ 5 đánh giá mẫu đặc thù!`, 'info');
        }

        // Auto select first review from new sync list
        if (newReviews.length > 0) {
          setActiveReview(newReviews[0]);
        }
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi đồng bộ đánh giá', 'warning');
      }
    } catch (err) {
      console.error('Failed to sync reviews:', err);
      showToast('Lỗi mạng, không thể gửi yêu cầu đồng bộ', 'warning');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handler: Call AI reply generation
  const handleGenerateAI = async (reviewId: string) => {
    try {
      setIsGeneratingAI(true);
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });
      const data = await res.json();

      if (data.success && data.review) {
        // Update specific review inside list
        const updatedList = reviews.map((r) =>
          r.id === reviewId ? data.review : r
        );
        setReviews(updatedList);
        setActiveReview(data.review);
        showToast('Sinh 3 gợi ý trả lời thành công bằng AI!', 'success');
      } else {
        showToast(data.error || 'AI gặp sự cố khi xử lý dữ liệu', 'warning');
      }
    } catch (err) {
      console.error('Failed to generate AI response:', err);
      showToast('Lỗi mạng, không thể kết nối đến AI engine', 'warning');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Handler: Bulk Generate AI
  const handleBulkGenerateAI = async () => {
    const displayed = selectedPlaceId ? reviews.filter(r => r.place_id === selectedPlaceId) : reviews;
    const targets = displayed.filter(r => r.status === 'pending' && !r.ai_responses);
    if (targets.length === 0) {
      showToast('Tuyệt vời! Tất cả đánh giá đã có phản hồi AI.', 'success');
      return;
    }
    
    setIsBulkGenerating(true);
    showToast(`Đang tự động chạy ngầm AI cho ${targets.length} đánh giá...`, 'info');
    
    let currentReviews = [...reviews];
    
    for (const target of targets) {
      try {
        const res = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewId: target.id }),
        });
        const data = await res.json();
        if (data.success && data.review) {
           currentReviews = currentReviews.map(r => r.id === target.id ? data.review : r);
           setReviews([...currentReviews]);
           if (activeReview?.id === target.id) {
             setActiveReview(data.review);
           }
        }
      } catch (err) {
        console.error('Bulk generate error:', err);
      }
    }
    setIsBulkGenerating(false);
    showToast(`Đã hoàn tất tạo AI hàng loạt!`, 'success');
  };

  // Handler: Approve and Resolve review
  const handleApproveResponse = async (reviewId: string, approvedResponse: string) => {
    try {
      setIsApproving(true);
      const res = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, response: approvedResponse }),
      });
      const data = await res.json();

      if (data.success && data.review) {
        // Update specific review inside list
        const updatedList = reviews.map((r) =>
          r.id === reviewId ? data.review : r
        );
        setReviews(updatedList);
        setActiveReview(data.review);
        showToast('Đã duyệt câu trả lời! Trạng thái: Đã phản hồi (Resolved)', 'success');
      } else {
        showToast(data.error || 'Không thể cập nhật trạng thái duyệt', 'warning');
      }
    } catch (err) {
      console.error('Failed to approve review:', err);
      showToast('Lỗi mạng, không thể lưu trạng thái duyệt', 'warning');
    } finally {
      setIsApproving(false);
    }
  };

  const placeFilteredReviews = selectedPlaceId 
    ? reviews.filter(r => r.place_id === selectedPlaceId) 
    : reviews;

  const displayedReviews = placeFilteredReviews.filter(
    r => filterStatus === 'all' || r.status === filterStatus
  );

  return (
    <div className="flex-1 flex flex-col relative min-h-screen">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-20 right-6 z-[100] animate-bounce">
          <div className={`glass-panel px-4 py-3.5 rounded-xl border flex items-center gap-2.5 shadow-2xl ${
            toast.type === 'success'
              ? 'border-emerald-500/30 text-emerald-400'
              : toast.type === 'warning'
              ? 'border-red-500/30 text-red-400'
              : 'border-indigo-500/30 text-indigo-400'
          }`}>
            {toast.type === 'success' && <CheckCircle className="h-4.5 w-4.5" />}
            {toast.type === 'warning' && <AlertTriangle className="h-4.5 w-4.5" />}
            {toast.type === 'info' && <Info className="h-4.5 w-4.5" />}
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Badges */}
      <Header dbSource={dbSource} apiKeysStatus={apiKeysStatus} />

      <main className="flex-1 py-6 space-y-6">
        {/* Sync Input Panel */}
        <PlaceInput onFetch={handleSyncPlaceReviews} isLoading={isSyncing} hasGoogleKey={apiKeysStatus.google} />

        {/* Stats Overview */}
        <StatsOverview 
          reviews={placeFilteredReviews} 
          activeFilter={filterStatus}
          onFilterChange={(status) => {
            setFilterStatus(status);
            if (status === 'all') {
              setSelectedPlaceId(''); // Reset place filter on click Total
            }
          }}
          hasSelectedPlace={selectedPlaceId !== ''}
        />

        {/* Main Work Space Section */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {isLoading ? (
            /* Main workspace loading skeleton */
            <div className="col-span-12 glass-panel p-8 text-center rounded-2xl flex flex-col items-center justify-center py-20">
              <RefreshCcw className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-sm text-gray-400 font-semibold animate-pulse">
                Đang khởi tạo kết nối & tải dữ liệu...
              </p>
            </div>
          ) : displayedReviews.length === 0 ? (
            /* Main workspace onboarding initial screen */
            <div className="col-span-12 glass-panel p-8 text-center rounded-2xl flex flex-col items-center justify-center py-16 max-w-4xl mx-auto">
              <div className="p-4 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Bắt đầu Trải nghiệm AI ORM</h3>
              <p className="text-sm text-gray-400 max-w-lg mt-2 leading-relaxed">
                Chào mừng bạn đến với <strong>AI-Powered ORM</strong>! Chưa có đánh giá nào cho địa điểm này. Vui lòng nhấn nút <strong>Đồng Bộ Đánh Giá</strong> ở trên để lấy 5 review thực tế và kích hoạt luồng AI phản hồi thông minh nhé!
              </p>
            </div>
          ) : (
            /* Core Product Panels (Left: Review List, Right: AI Workspace) */
            <>
              {/* Left Column - Reviews Listing */}
              <div className="lg:col-span-5 glass-panel rounded-2xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 bg-gray-950/40 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-300">
                    Hộp Thư Đánh Giá
                  </h3>
                  <button
                    onClick={handleBulkGenerateAI}
                    disabled={isBulkGenerating || displayedReviews.filter(r => r.status === 'pending' && !r.ai_responses).length === 0}
                    className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded font-bold flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBulkGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                    Tự động tạo AI
                  </button>
                </div>
                <ReviewList
                  reviews={displayedReviews}
                  activeId={activeReview ? activeReview.id : null}
                  onSelect={(r) => setActiveReview(r)}
                />
              </div>

              {/* Right Column - Workstation Panel */}
              <div className="lg:col-span-7 h-full">
                <AIResponsePanel
                  review={activeReview}
                  onGenerateAI={handleGenerateAI}
                  onApprove={handleApproveResponse}
                  isGenerating={isGeneratingAI}
                  isApproving={isApproving}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 mt-12 border-t border-gray-900 text-center">
        <p className="text-xs text-gray-500">
          AI-Powered ORM Proof of Concept &bull; Product Owner: UCTalent Labs
        </p>
      </footer>
    </div>
  );
}
