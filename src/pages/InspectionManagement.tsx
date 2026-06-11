import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, Plus, ClipboardCheck, Flame, Utensils, CheckCircle, AlertTriangle, Calendar, User } from 'lucide-react';
import { Inspection } from '../types';

type InspectionType = 'all' | 'food' | 'fire' | 'daily';

const InspectionManagement: React.FC = () => {
  const { inspections, merchants, addInspection } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<InspectionType>('all');
  const [showModal, setShowModal] = useState(false);
  interface FormData {
    merchantId: string;
    type: 'food' | 'fire' | 'daily';
    inspectionDate: string;
    inspector: string;
    result: 'pass' | 'partial' | 'fail';
    issues: string;
    nextInspectionDate: string;
  }

  const [formData, setFormData] = useState<FormData>({
    merchantId: '',
    type: 'food',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspector: '',
    result: 'pass',
    issues: '',
    nextInspectionDate: '',
  });

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch = inspection.merchantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || inspection.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const foodCount = inspections.filter(i => i.type === 'food').length;
  const fireCount = inspections.filter(i => i.type === 'fire').length;
  const passCount = inspections.filter(i => i.result === 'pass').length;
  const failCount = inspections.filter(i => i.result === 'fail' || i.result === 'partial').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const merchant = merchants.find(m => m.id === formData.merchantId);
    addInspection({
      ...formData,
      merchantName: merchant?.name || '',
      issues: formData.issues.split('\n').filter(Boolean),
    });
    setShowModal(false);
    setFormData({
      merchantId: '',
      type: 'food',
      inspectionDate: new Date().toISOString().split('T')[0],
      inspector: '',
      result: 'pass',
      issues: '',
      nextInspectionDate: '',
    });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'food':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><Utensils className="w-3 h-3" />食品安全</span>;
      case 'fire':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1"><Flame className="w-3 h-3" />消防安全</span>;
      case 'daily':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">日常巡检</span>;
      default:
        return null;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'pass':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />合格</span>;
      case 'partial':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" />部分合格</span>;
      case 'fail':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">不合格</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">服务检查</h1>
          <p className="text-gray-500 mt-1">记录食品、消防检查及日常巡检情况</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新增检查记录</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Utensils className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{foodCount}</p>
              <p className="text-sm text-gray-500">食品检查</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{fireCount}</p>
              <p className="text-sm text-gray-500">消防检查</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{passCount}</p>
              <p className="text-sm text-gray-500">检查合格</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{failCount}</p>
              <p className="text-sm text-gray-500">存在问题</p>
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
              placeholder="搜索商户名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as InspectionType)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部类型</option>
            <option value="food">食品安全</option>
            <option value="fire">消防安全</option>
            <option value="daily">日常巡检</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商户名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检查类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检查日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检查人</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检查结果</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发现问题</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">下次检查</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInspections.map((inspection: Inspection) => (
              <tr key={inspection.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{inspection.merchantName}</p>
                </td>
                <td className="px-6 py-4">
                  {getTypeBadge(inspection.type)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {inspection.inspectionDate}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    {inspection.inspector}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getResultBadge(inspection.result)}
                </td>
                <td className="px-6 py-4">
                  {inspection.issues.length > 0 ? (
                    <div className="max-w-xs">
                      {inspection.issues.slice(0, 2).map((issue, index) => (
                        <p key={index} className="text-sm text-red-600 truncate">{issue}</p>
                      ))}
                      {inspection.issues.length > 2 && (
                        <p className="text-xs text-gray-400">+{inspection.issues.length - 2} 更多</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-green-600">无问题</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {inspection.nextInspectionDate ? (
                    <p className="text-sm text-gray-600">{inspection.nextInspectionDate}</p>
                  ) : (
                    <span className="text-sm text-gray-400">未设置</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredInspections.length === 0 && (
          <div className="text-center py-12">
            <ClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无检查记录</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">新增检查记录</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">检查类型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as FormData['type'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="food">食品安全检查</option>
                  <option value="fire">消防安全检查</option>
                  <option value="daily">日常巡检</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">检查日期</label>
                  <input
                    type="date"
                    value={formData.inspectionDate}
                    onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">检查人</label>
                  <input
                    type="text"
                    value={formData.inspector}
                    onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="检查人姓名"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">检查结果</label>
                <select
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value as FormData['result'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pass">合格</option>
                  <option value="partial">部分合格</option>
                  <option value="fail">不合格</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">发现问题 (每行一个问题)</label>
                <textarea
                  value={formData.issues}
                  onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="如有问题，请每行输入一个问题描述..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">下次检查日期</label>
                <input
                  type="date"
                  value={formData.nextInspectionDate}
                  onChange={(e) => setFormData({ ...formData, nextInspectionDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  保存记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionManagement;