import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, Plus, CheckCircle, Clock, AlertTriangle, Calendar, User, CheckSquare, XSquare } from 'lucide-react';
import { Rectification } from '../types';

type RectificationStatus = 'all' | 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected';

const RectificationManagement: React.FC = () => {
  const { rectifications, merchants, addRectification, updateRectification } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RectificationStatus>('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    merchantId: '',
    title: '',
    description: '',
    deadline: '',
    assignee: '',
    status: 'pending' as const,
  });
  const [viewDetail, setViewDetail] = useState<Rectification | null>(null);

  const filteredRectifications = rectifications.filter((rect) => {
    const matchesSearch = rect.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rect.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rect.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = rectifications.filter(r => r.status === 'pending').length;
  const processingCount = rectifications.filter(r => r.status === 'processing').length;
  const completedCount = rectifications.filter(r => r.status === 'completed').length;
  const totalCount = rectifications.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const merchant = merchants.find(m => m.id === formData.merchantId);
    addRectification({
      ...formData,
      merchantName: merchant?.name || '',
      createdAt: new Date().toISOString().split('T')[0],
    });
    setShowModal(false);
    setFormData({
      merchantId: '',
      title: '',
      description: '',
      deadline: '',
      assignee: '',
      status: 'pending',
    });
  };

  const handleStart = (rectId: string) => {
    updateRectification(rectId, { status: 'processing' });
  };

  const handleSubmitReview = (rectId: string) => {
    updateRectification(rectId, { status: 'reviewing' });
  };

  const handleComplete = (rectId: string) => {
    updateRectification(rectId, { status: 'completed', completedAt: new Date().toISOString().split('T')[0] });
  };

  const handleReject = (rectId: string) => {
    updateRectification(rectId, { status: 'rejected' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1"><Clock className="w-3 h-3" />待处理</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">处理中</span>;
      case 'reviewing':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">待复查</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />已完成</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">已驳回</span>;
      default:
        return null;
    }
  };

  const getProgress = (status: string) => {
    switch (status) {
      case 'pending': return { percent: 0, label: '待处理' };
      case 'processing': return { percent: 33, label: '处理中' };
      case 'reviewing': return { percent: 66, label: '待复查' };
      case 'completed': return { percent: 100, label: '已完成' };
      case 'rejected': return { percent: 0, label: '已驳回' };
      default: return { percent: 0, label: '未知' };
    }
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date() && !['completed', 'rejected'].includes(statusFilter);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">整改跟踪</h1>
          <p className="text-gray-500 mt-1">跟踪整改任务进度，确保问题及时解决</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>下发整改任务</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
              <p className="text-sm text-gray-500">整改任务总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
              <p className="text-sm text-gray-500">待处理</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{processingCount}</p>
              <p className="text-sm text-gray-500">处理中</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{completedCount}</p>
              <p className="text-sm text-gray-500">已完成</p>
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
              placeholder="搜索商户名称、任务标题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RectificationStatus)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="processing">处理中</option>
            <option value="reviewing">待复查</option>
            <option value="completed">已完成</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRectifications.map((rect: Rectification) => {
          const progress = getProgress(rect.status);
          return (
            <div key={rect.id} className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${
              rect.status === 'completed' ? 'border-green-500' :
              rect.status === 'rejected' ? 'border-red-500' :
              isOverdue(rect.deadline) ? 'border-orange-500' : 'border-blue-500'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{rect.title}</h3>
                    {isOverdue(rect.deadline) && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">已逾期</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{rect.merchantName}</p>
                </div>
                {getStatusBadge(rect.status)}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{rect.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {rect.assignee}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  截止: {rect.deadline}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>进度</span>
                  <span>{progress.percent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      rect.status === 'completed' ? 'bg-green-500' :
                      rect.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {rect.status === 'pending' && (
                  <button
                    onClick={() => handleStart(rect.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    开始处理
                  </button>
                )}
                {rect.status === 'processing' && (
                  <button
                    onClick={() => handleSubmitReview(rect.id)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    提交复查
                  </button>
                )}
                {rect.status === 'reviewing' && (
                  <>
                    <button
                      onClick={() => handleComplete(rect.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      确认通过
                    </button>
                    <button
                      onClick={() => handleReject(rect.id)}
                      className="px-4 py-2 border border-red-600 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <XSquare className="w-4 h-4" />
                      驳回
                    </button>
                  </>
                )}
                {rect.status === 'completed' && (
                  <button
                    onClick={() => setViewDetail(rect)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    查看详情
                  </button>
                )}
                {rect.status === 'rejected' && (
                  <button
                    onClick={() => handleStart(rect.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    重新处理
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filteredRectifications.length === 0 && (
          <div className="col-span-2 bg-white rounded-xl p-12 text-center shadow-sm">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无整改任务</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">下发整改任务</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商户名称</label>
                <select
                  value={formData.merchantId}
                  onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择商户</option>
                  {merchants.map((merchant) => (
                    <option key={merchant.id} value={merchant.id}>
                      {merchant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">整改标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入整改标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">整改内容</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="请详细描述整改要求..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">负责人</label>
                  <input
                    type="text"
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="负责人姓名"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  下发任务
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">整改详情</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">任务标题</p>
                <p className="font-medium text-gray-800">{viewDetail.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">商户名称</p>
                <p className="font-medium text-gray-800">{viewDetail.merchantName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">整改内容</p>
                <p className="text-gray-800">{viewDetail.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">负责人</p>
                  <p className="font-medium text-gray-800">{viewDetail.assignee}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">截止日期</p>
                  <p className="font-medium text-gray-800">{viewDetail.deadline}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">创建时间</p>
                  <p className="font-medium text-gray-800">{viewDetail.createdAt}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">完成时间</p>
                  <p className="font-medium text-gray-800">{viewDetail.completedAt || '未完成'}</p>
                </div>
              </div>
              {viewDetail.remark && (
                <div>
                  <p className="text-sm text-gray-500">备注</p>
                  <p className="text-gray-800">{viewDetail.remark}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setViewDetail(null)}
              className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RectificationManagement;