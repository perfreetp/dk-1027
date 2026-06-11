import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, Plus, Tag, CheckCircle, XCircle, Clock, Edit, Eye } from 'lucide-react';
import { Price } from '../types';

type PriceStatus = 'all' | 'approved' | 'pending' | 'rejected';

const PriceManagement: React.FC = () => {
  const { prices, merchants, addPrice, updatePrice } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PriceStatus>('all');
  const [showModal, setShowModal] = useState(false);
  interface FormData {
    merchantId: string;
    productName: string;
    originalPrice: string;
    currentPrice: string;
    unit: string;
    effectiveDate: string;
    status: 'pending' | 'approved' | 'rejected';
  }

  const [formData, setFormData] = useState<FormData>({
    merchantId: '',
    productName: '',
    originalPrice: '',
    currentPrice: '',
    unit: '',
    effectiveDate: '',
    status: 'pending',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredPrices = prices.filter((price) => {
    const matchesSearch = price.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      price.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || price.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = prices.filter(p => p.status === 'pending').length;
  const approvedCount = prices.filter(p => p.status === 'approved').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const merchant = merchants.find(m => m.id === formData.merchantId);
    if (editingId) {
      updatePrice(editingId, {
        ...formData,
        originalPrice: parseFloat(formData.originalPrice),
        currentPrice: parseFloat(formData.currentPrice),
        merchantName: merchant?.name || '',
      });
    } else {
      addPrice({
        ...formData,
        originalPrice: parseFloat(formData.originalPrice),
        currentPrice: parseFloat(formData.currentPrice),
        merchantName: merchant?.name || '',
      });
    }
    setShowModal(false);
    setFormData({
      merchantId: '',
      productName: '',
      originalPrice: '',
      currentPrice: '',
      unit: '',
      effectiveDate: '',
      status: 'pending',
    });
    setEditingId(null);
  };

  const handleEdit = (price: Price) => {
    setFormData({
      merchantId: price.merchantId,
      productName: price.productName,
      originalPrice: price.originalPrice.toString(),
      currentPrice: price.currentPrice.toString(),
      unit: price.unit,
      effectiveDate: price.effectiveDate,
      status: price.status,
    });
    setEditingId(price.id);
    setShowModal(true);
  };

  const handleApprove = (priceId: string) => {
    updatePrice(priceId, { status: 'approved' });
  };

  const handleReject = (priceId: string) => {
    updatePrice(priceId, { status: 'rejected' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />已审核</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1"><Clock className="w-3 h-3" />待审核</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" />已拒绝</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">价格公示</h1>
          <p className="text-gray-500 mt-1">管理商户商品价格备案，确保明码标价</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新增价格</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{prices.length}</p>
              <p className="text-sm text-gray-500">价格备案总数</p>
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
              <p className="text-sm text-gray-500">待审核</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{approvedCount}</p>
              <p className="text-sm text-gray-500">已通过</p>
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
              placeholder="搜索商户名称、商品名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PriceStatus)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部状态</option>
            <option value="approved">已审核</option>
            <option value="pending">待审核</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商户名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">原价</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">现价</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">单位</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">生效日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPrices.map((price: Price) => {
              const discount = ((price.originalPrice - price.currentPrice) / price.originalPrice * 100).toFixed(1);
              const hasDiscount = price.currentPrice < price.originalPrice;
              return (
                <tr key={price.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{price.merchantName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800">{price.productName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-400 line-through">¥{price.originalPrice}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">¥{price.currentPrice}</p>
                      {hasDiscount && (
                        <p className="text-xs text-red-600">-{discount}%</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{price.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{price.effectiveDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(price.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="查看详情">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(price)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {price.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(price.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="审核通过"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(price.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="拒绝"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredPrices.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无价格数据</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? '编辑价格' : '新增价格备案'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入商品名称"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">原价</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="原价"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">现价</label>
                  <input
                    type="number"
                    value={formData.currentPrice}
                    onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="现价"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如: 份"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">生效日期</label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  {editingId ? '保存修改' : '提交备案'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceManagement;