import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Search, Plus, CheckCircle, Clock, AlertTriangle, Calendar, User, CheckSquare, XSquare, FileText, Upload, Link, Paperclip, X } from 'lucide-react';
import { Rectification, Inspection, Review } from '../types';

type RectificationStatus = 'all' | 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected';

const RectificationManagement: React.FC = () => {
  const { rectifications, merchants, inspections, reviews, addRectification, updateRectification, createRectificationFromInspection, createRectificationFromComplaint } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RectificationStatus>('all');
  const [showModal, setShowModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCreateFromSourceModal, setShowCreateFromSourceModal] = useState(false);
  const [selectedRectification, setSelectedRectification] = useState<Rectification | null>(null);
  const [selectedSourceType, setSelectedSourceType] = useState<'inspection' | 'complaint'>('inspection');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitNote, setSubmitNote] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    merchantId: '',
    title: '',
    description: '',
    deadline: '',
    assignee: '',
  });

  const filteredRectifications = rectifications.filter((rect) => {
    const matchesSearch = rect.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rect.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rect.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = rectifications.filter(r => r.status === 'pending').length;
  const processingCount = rectifications.filter(r => r.status === 'processing').length;
  const reviewingCount = rectifications.filter(r => r.status === 'reviewing').length;
  const completedCount = rectifications.filter(r => r.status === 'completed').length;
  const totalCount = rectifications.length;

  const getSourceInfo = (rect: Rectification) => {
    if (rect.sourceType === 'inspection' && rect.sourceId) {
      return inspections.find(i => i.id === rect.sourceId);
    }
    if (rect.sourceType === 'complaint' && rect.sourceId) {
      return reviews.find(r => r.id === rect.sourceId);
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const merchant = merchants.find(m => m.id === formData.merchantId);
    addRectification({
      ...formData,
      merchantName: merchant?.name || '',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      sourceType: 'manual',
    });
    setShowModal(false);
    setFormData({
      merchantId: '',
      title: '',
      description: '',
      deadline: '',
      assignee: '',
    });
  };

  const handleStart = (rectId: string) => {
    updateRectification(rectId, { status: 'processing' });
  };

  const handleSubmitReview = (rectId: string, note: string, attachments: string[]) => {
    updateRectification(rectId, { 
      status: 'reviewing', 
      rectificationNote: note,
      attachmentUrls: attachments.length > 0 ? attachments : undefined 
    });
    setShowSubmitModal(false);
    setSelectedRectification(null);
    setSubmitNote('');
    setSelectedFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(f => f.name);
      setSelectedFiles(prev => [...prev, ...fileNames]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleComplete = (rectId: string) => {
    updateRectification(rectId, { status: 'completed', completedAt: new Date().toISOString().split('T')[0] });
  };

  const handleReject = (rectId: string) => {
    updateRectification(rectId, { status: 'rejected', rejectionReason });
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedRectification(null);
  };

  const handleCreateFromSource = (sourceId: string) => {
    if (selectedSourceType === 'inspection') {
      createRectificationFromInspection(sourceId);
    } else {
      createRectificationFromComplaint(sourceId);
    }
    setShowCreateFromSourceModal(false);
  };

  const isOverdue = (deadline: string, status: string) => {
    return new Date(deadline) < new Date() && !['completed', 'rejected'].includes(status);
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

  const getSourceBadge = (sourceType?: string) => {
    switch (sourceType) {
      case 'inspection':
        return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">检查发现</span>;
      case 'complaint':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">投诉转办</span>;
      case 'manual':
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">手动创建</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">整改跟踪</h1>
          <p className="text-gray-500 mt-1">跟踪整改任务进度，确保问题及时解决</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateFromSourceModal(true)}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Link className="w-4 h-4" />
            <span>从检查/投诉生成</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>下发整改任务</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{reviewingCount}</p>
              <p className="text-sm text-gray-500">待复查</p>
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
          const sourceInfo = getSourceInfo(rect);
          const overdue = isOverdue(rect.deadline, rect.status);
          
          return (
            <div key={rect.id} className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${
              rect.status === 'completed' ? 'border-green-500' :
              rect.status === 'rejected' ? 'border-red-500' :
              overdue ? 'border-orange-500' : 'border-blue-500'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-gray-800">{rect.title}</h3>
                  {getSourceBadge(rect.sourceType)}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(rect.status)}
                  {overdue && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">已逾期</span>
                  )}
                </div>
              </div>

              {sourceInfo && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">来源：{rect.sourceType === 'inspection' ? '检查记录' : '游客投诉'}</p>
                  <p className="text-sm text-gray-700">
                    {rect.sourceType === 'inspection' 
                      ? `检查类型: ${(sourceInfo as Inspection).type === 'food' ? '食品安全' : (sourceInfo as Inspection).type === 'fire' ? '消防安全' : '日常巡检'}`
                      : `投诉人: ${(sourceInfo as Review).reviewer}`
                    }
                  </p>
                </div>
              )}

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{rect.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {rect.assignee || '未分配'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  截止: {rect.deadline}
                </span>
              </div>

              {rect.rectificationNote && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">整改说明</p>
                  <p className="text-sm text-blue-800">{rect.rectificationNote}</p>
                </div>
              )}

              {rect.attachmentUrls && rect.attachmentUrls.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    附件文件
                  </p>
                  <div className="space-y-1">
                    {rect.attachmentUrls.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rect.rejectionReason && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 mb-1">驳回原因</p>
                  <p className="text-sm text-red-800">{rect.rejectionReason}</p>
                </div>
              )}

              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>进度</span>
                  <span>{progress.percent}% - {progress.label}</span>
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
                    onClick={() => {
                      setSelectedRectification(rect);
                      setShowSubmitModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    提交整改
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
                      onClick={() => {
                        setSelectedRectification(rect);
                        setShowRejectModal(true);
                      }}
                      className="px-4 py-2 border border-red-600 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <XSquare className="w-4 h-4" />
                      驳回
                    </button>
                  </>
                )}
                {rect.status === 'completed' && (
                  <span className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg text-center">
                    已完成
                  </span>
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

      {showSubmitModal && selectedRectification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">提交整改说明</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">整改说明</label>
                <textarea
                  value={submitNote}
                  onChange={(e) => setSubmitNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="请详细描述整改措施和结果..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">上传附件</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                />
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">点击或拖拽上传整改相关图片或文件</p>
                  <p className="text-xs text-gray-400 mt-1">支持多文件上传</p>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">{file}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedRectification(null);
                    setSubmitNote('');
                    setSelectedFiles([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleSubmitReview(selectedRectification.id, submitNote, selectedFiles)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  提交复查
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedRectification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">驳回整改</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleReject(selectedRectification.id);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">驳回原因</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="请说明驳回原因..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRectification(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  确认驳回
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateFromSourceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">从检查/投诉生成整改任务</h3>
              <button
                onClick={() => setShowCreateFromSourceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setSelectedSourceType('inspection')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  selectedSourceType === 'inspection' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                检查发现问题
              </button>
              <button
                onClick={() => setSelectedSourceType('complaint')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  selectedSourceType === 'complaint' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                游客投诉
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {selectedSourceType === 'inspection' ? (
                <div className="space-y-2">
                  {inspections
                    .filter(i => i.issues.length > 0 && !rectifications.some(r => r.sourceType === 'inspection' && r.sourceId === i.id))
                    .map((inspection) => (
                    <div key={inspection.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{inspection.merchantName}</p>
                        <p className="text-sm text-gray-500">{inspection.type === 'food' ? '食品安全检查' : inspection.type === 'fire' ? '消防安全检查' : '日常巡检'} - {inspection.inspectionDate}</p>
                        <p className="text-sm text-red-600 mt-1">问题: {inspection.issues.join(', ')}</p>
                      </div>
                      <button
                        onClick={() => handleCreateFromSource(inspection.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        生成整改
                      </button>
                    </div>
                  ))}
                  {inspections.filter(i => i.issues.length > 0 && !rectifications.some(r => r.sourceType === 'inspection' && r.sourceId === i.id)).length === 0 && (
                    <p className="text-center text-gray-500 py-4">暂无待整改的检查问题</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {reviews
                    .filter(r => r.type === 'complaint' && !r.rectificationId)
                    .map((review) => (
                    <div key={review.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{review.merchantName}</p>
                        <p className="text-sm text-gray-500">投诉人: {review.reviewer} - {review.reviewDate}</p>
                        <p className="text-sm text-red-600 mt-1">{review.content}</p>
                      </div>
                      <button
                        onClick={() => handleCreateFromSource(review.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        转整改
                      </button>
                    </div>
                  ))}
                  {reviews.filter(r => r.type === 'complaint' && !r.rectificationId).length === 0 && (
                    <p className="text-center text-gray-500 py-4">暂无待处理的投诉</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RectificationManagement;
