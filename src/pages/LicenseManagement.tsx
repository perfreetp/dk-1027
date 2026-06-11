import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, Plus, AlertTriangle, FileCheck, Calendar, Download, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { License } from '../types';

type LicenseStatus = 'all' | 'valid' | 'expiring' | 'expired';

const LicenseManagement: React.FC = () => {
  const { licenses, merchants, addLicense, updateLicense, deleteLicense } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LicenseStatus>('all');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  interface FormData {
    merchantId: string;
    type: string;
    number: string;
    issueDate: string;
    expireDate: string;
    status: 'valid' | 'expiring' | 'expired';
  }

  const [formData, setFormData] = useState<FormData>({
    merchantId: '',
    type: '',
    number: '',
    issueDate: '',
    expireDate: '',
    status: 'valid',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch = license.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || license.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const upcomingExpirations = licenses.filter(l => l.status === 'expiring').length;
  const expiredCount = licenses.filter(l => l.status === 'expired').length;

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
      status: 'valid',
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
      status: license.status,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">有效</span>;
      case 'expiring':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">即将到期</span>;
      case 'expired':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">已过期</span>;
      default:
        return null;
    }
  };

  const getDaysUntilExpiration = (expireDate: string) => {
    const today = new Date();
    const expire = new Date(expireDate);
    const diffTime = expire.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">证照管理</h1>
          <p className="text-gray-500 mt-1">管理商户证照信息，监控证照有效期</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新增证照</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
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
              <Calendar className="w-6 h-6 text-red-600" />
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
              placeholder="搜索商户名称、证照类型..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LicenseStatus)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="valid">有效</option>
              <option value="expiring">即将到期</option>
              <option value="expired">已过期</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商户名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">证照类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">证照编号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">颁发日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">到期日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLicenses.map((license: License) => {
              const daysLeft = getDaysUntilExpiration(license.expireDate);
              return (
                <tr key={license.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{license.merchantName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">{license.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 font-mono">{license.number}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{license.issueDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-600">{license.expireDate}</p>
                      {license.status === 'expiring' && (
                        <p className="text-xs text-orange-600">剩余 {daysLeft} 天</p>
                      )}
                      {license.status === 'expired' && (
                        <p className="text-xs text-red-600">已过期 {Math.abs(daysLeft)} 天</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(license.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="查看详情">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(license)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setDeleteId(license.id); setShowModal(true); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="下载">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredLicenses.length === 0 && (
          <div className="text-center py-12">
            <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无证照数据</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            {deleteId ? (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">确认删除</h3>
                <p className="text-gray-600 mb-6">确定要删除该证照吗？此操作不可撤销。</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowModal(false); setDeleteId(null); }}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">所属商户</label>
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
                      placeholder="例如: 营业执照"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">颁发日期</label>
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
                      onClick={() => { setShowModal(false); setEditingId(null); }}
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