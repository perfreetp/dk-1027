import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, MessageSquare, Star, AlertCircle, CheckCircle, Reply, Calendar, User } from 'lucide-react';
import { Review } from '../types';

type ReviewType = 'all' | 'review' | 'complaint';
type ReviewStatus = 'all' | 'pending' | 'processed' | 'resolved';

const ReviewManagement: React.FC = () => {
  const { reviews, updateReview } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReviewType>('all');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>('all');
  const [replyModal, setReplyModal] = useState<{ review: Review | null; reply: string }>({ review: null, reply: '' });

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || review.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalReviews = reviews.length;
  const complaintsCount = reviews.filter(r => r.type === 'complaint').length;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const handleReply = () => {
    if (replyModal.review && replyModal.reply.trim()) {
      updateReview(replyModal.review.id, {
        reply: replyModal.reply,
        status: 'resolved',
      });
      setReplyModal({ review: null, reply: '' });
    }
  };

  const handleProcess = (reviewId: string) => {
    updateReview(reviewId, { status: 'processed' });
  };

  const handleResolve = (reviewId: string) => {
    updateReview(reviewId, { status: 'resolved' });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'review':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1"><MessageSquare className="w-3 h-3" />评价</span>;
      case 'complaint':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" />投诉</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">待处理</span>;
      case 'processed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">处理中</span>;
      case 'resolved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />已解决</span>;
      default:
        return null;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">游客评价</h1>
          <p className="text-gray-500 mt-1">管理游客评价和投诉，提升服务质量</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalReviews}</p>
              <p className="text-sm text-gray-500">评价总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{complaintsCount}</p>
              <p className="text-sm text-gray-500">投诉数量</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{avgRating}</p>
              <p className="text-sm text-gray-500">平均评分</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
              <p className="text-sm text-gray-500">待处理</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索商户名称、评价内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ReviewType)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部类型</option>
              <option value="review">评价</option>
              <option value="complaint">投诉</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReviewStatus)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="pending">待处理</option>
              <option value="processed">处理中</option>
              <option value="resolved">已解决</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review: Review) => (
          <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-800">{review.reviewer}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {review.reviewDate}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-medium text-gray-800">{review.merchantName}</span>
                  {getTypeBadge(review.type)}
                  {getStatusBadge(review.status)}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500">({review.rating}分)</span>
                </div>
                <p className="text-gray-600 mb-4">{review.content}</p>
                {review.reply && (
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm font-medium text-blue-800 mb-1">回复:</p>
                    <p className="text-sm text-blue-600">{review.reply}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {review.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleProcess(review.id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      处理中
                    </button>
                    <button
                      onClick={() => setReplyModal({ review, reply: '' })}
                      className="px-4 py-2 border border-blue-600 text-blue-600 text-sm rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                    >
                      <Reply className="w-4 h-4" />
                      回复
                    </button>
                  </>
                )}
                {review.status === 'processed' && (
                  <>
                    <button
                      onClick={() => handleResolve(review.id)}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      标记完成
                    </button>
                    <button
                      onClick={() => setReplyModal({ review, reply: review.reply || '' })}
                      className="px-4 py-2 border border-blue-600 text-blue-600 text-sm rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                    >
                      <Reply className="w-4 h-4" />
                      回复
                    </button>
                  </>
                )}
                {review.status === 'resolved' && (
                  <span className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg">已解决</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredReviews.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无评价数据</p>
          </div>
        )}
      </div>

      {replyModal.review && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">回复评价</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">商户: {replyModal.review.merchantName}</p>
              <p className="text-sm text-gray-600 mt-1">{replyModal.review.content}</p>
            </div>
            <textarea
              value={replyModal.reply}
              onChange={(e) => setReplyModal({ ...replyModal, reply: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="请输入回复内容..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setReplyModal({ review: null, reply: '' })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReply}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                发送回复
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;