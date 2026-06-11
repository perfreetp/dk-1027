import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, Plus, AlertTriangle, FileCheck, Calendar, Download, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { License } from '../types';
import { ExpirationFilter } from '../types';

const LicenseManagement: React.FC = () => {
  const { licenses, merchants, addLicense, updateLicense, deleteLicense, updateLicenseStatuses } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expirationFilter, setExpirationFilter] = useState<ExpirationFilter>('all');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  interface FormData {
    merchantId: string;
    type: string;
    number: string;
    issueDate: string;
    expireDate: string;
  }

  const [formData, setFormData] = useState<FormData>({
    merchantId: '',
    type: '',
    number: '',
    issueDate: '',
    expireDate: '',
  });

  useEffect(() => {
    updateLicenseStatuses();
  }, [updateLicenseStatuses]);

  const getDaysUntilExpiration = (expireDate: string): number => {
    const today = new Date();
    const expire = new Date(expireDate);
    const diffTime = expire.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch = license.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || license.status === statusFilter;
    
    let matchesExpiration = true;
    if (expirationFilter !== 'all') {
      const days = getDaysUntilExpiration(license.expireDate);
      if (expirationFilter === '30days') {
        matchesExpiration = days > 0 && days <= 30;
      } else if (expirationFilter === '60days') {
        matchesExpiration = days > 0 && days <= 60;
      }
    }
    
    return matchesSearch && matchesStatus && matchesExpiration;
  });

  const upcomingExpirations = licenses.filter(l => {
    const days = getDaysUntilExpiration(l.expireDate);
    return days > 0 && days <= 60;
  }).length;
  
  const expiredCount = licenses.filter(l => l.status === 'expired').length;
  const validCount = licenses.filter(l => l.status === 'valid').length;
  const expiring30Days = licenses.filter(l => {
    const days = getDaysUntilExpiration(l.expireDate);
    return days > 0 && days <= 30;
  }).length;
  const expiring60Days = licenses.filter(l => {
    const days = getDaysUntilExpiration(l.expireDate);
    return days > 30 && days <= 60;
  }).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const merchant = merchants.find(m => m.id === formData.merchantId);
    if (editingId) {
      updateLicense(editingId, {
        ...formData,
        merchantName: merchant?.name || '',
      });
    } else {
      addLicense({
        ...formData,
        merchantName: merchant?.name || '',
      });
    }
    setShowModal(false);
    setFormData({
      merchantId: '',
      type: '',
      number: '',
      issueDate: '',
      expireDate: '',
    });
    setEditingId(null);
  };

  const handleEdit = (license: License) => {
    setFormData({
      merchantId: license.merchantId,
      type: license.type,
      number: license.number,
      issueDate: license.issueDate,
      expireDate: license.expireDate,
    });
    setEditingId(license.id);
    setShowModal(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteLicense(deleteId);
      setShowModal(false);
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string, expireDate: string) => {
    const days = getDaysUntilExpiration(expireDate);
    switch (status) {
      case 'valid':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><FileCheck className="w-3 h-3" />有效 ({days}天后到期)</span>;
      case 'expiring':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" />即将到期 ({days}天后)</span>;
      case 'expired':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">已过期 ({Math.abs(days)}天前)</span>;
      default:
        return null;
    }
  };

  const exportData = () => {
    const data = licenses.map(l => ({
      id: l.id,
      merchantName: l.merchantName,
      type: l.type,
      number: l.number,
      issueDate: l.issueDate,
      expireDate: l.expireDate,
      status: l.status,
      daysUntilExpiration: getDaysUntilExpiration(l.expireDate),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `证照台账_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">证照管理</h1>
          <p className="text-gray-500 mt-1">管理商户证照信息，实时监控证照有效期</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportData}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>导出台账</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>新增证照</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{licenses.length}</p>
              <p className="text-sm text-gray-500">证照总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{validCount}</p>
              <p className="text-sm text-gray-500">有效证照</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{upcomingExpirations}</p>
              <p className="text-sm text-gray-500">即将到期</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{expiredCount}</p>
              <p className="text-sm text-gray-500">已过期</p>
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
              placeholder="搜索商户名称、证照类型、证照编号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="valid">有效</option>
              <option value="expiring">即将到期</option>
              <option value="expired">已过期</option>
            </select>
            <select
              value={expirationFilter}
              onChange={(e) => setExpirationFilter(e.target.value as ExpirationFilter)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部期限</option>
              <option value="30days">30天内到期</option>
              <option value="60days">60天内到期</option>
            </select>
          </div>
        </div>
      </div>

      {expiring30Days > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">证照到期提醒</span>
          </div>
          <p className="text-sm text-yellow-700">
            有 {expiring30Days} 个证照将在30天内到期，{expiring60Days} 个证照将在31-60天内到期，请及时办理续期手续。
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商户名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">证照类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">证照编号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发证日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">到期日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLicenses.map((license) => (
              <tr key={license.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{license.merchantName}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">{license.type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600 font-mono">{license.number}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">{license.issueDate}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={license.status === 'expired' ? 'text-red-600 font-medium' : 'text-gray-600'}>
                    {license.expireDate}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(license.status, license.expireDate)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(license)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(license.id);
                        setShowModal(true);
                      }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLicenses.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无证照数据</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            {deleteId ? (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">确认删除</h3>
                <p className="text-gray-600 mb-6">确定要删除该证照吗？此操作无法撤销。</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setDeleteId(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    确认删除
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingId ? '编辑证照' : '新增证照'}
                </h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">证照类型</label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如: 营业执照、食品经营许可证"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">证照编号</label>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="请输入证照编号"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">发证日期</label>
                      <input
                        type="date"
                        value={formData.issueDate}
                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">到期日期</label>
                      <input
                        type="date"
                        value={formData.expireDate}
                        onChange={(e) => setFormData({ ...formData, expireDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingId(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingId ? '保存修改' : '创建证照'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseManagement;
