import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Save } from 'lucide-react';
import { Merchant } from '../types';

interface FormData {
  name: string;
  category: string;
  address: string;
  contact: string;
  phone: string;
  status: 'operating' | 'closed' | 'suspended';
  contractStartDate: string;
  contractEndDate: string;
  rentAmount: string;
  rentStatus: 'paid' | 'overdue' | 'pending';
  starLevel: '1' | '2' | '3' | '4' | '5';
  isBlacklisted: boolean;
  businessHours: string;
  holidayStatus: 'closed' | 'open' | 'partial';
}

const initialFormData: FormData = {
  name: '',
  category: '',
  address: '',
  contact: '',
  phone: '',
  status: 'operating',
  contractStartDate: '',
  contractEndDate: '',
  rentAmount: '',
  rentStatus: 'paid',
  starLevel: '3',
  isBlacklisted: false,
  businessHours: '',
  holidayStatus: 'open',
};

const MerchantForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { merchants, addMerchant, updateMerchant } = useStore();
  
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      const existingMerchant = merchants.find((m) => m.id === id);
      if (existingMerchant) {
        setFormData({
          name: existingMerchant.name,
          category: existingMerchant.category,
          address: existingMerchant.address,
          contact: existingMerchant.contact,
          phone: existingMerchant.phone,
          status: existingMerchant.status,
          contractStartDate: existingMerchant.contractStartDate,
          contractEndDate: existingMerchant.contractEndDate,
          rentAmount: existingMerchant.rentAmount.toString(),
          rentStatus: existingMerchant.rentStatus,
          starLevel: existingMerchant.starLevel,
          isBlacklisted: existingMerchant.isBlacklisted,
          businessHours: existingMerchant.businessHours,
          holidayStatus: existingMerchant.holidayStatus,
        });
      }
    }
  }, [id, merchants]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入商户名称';
    if (!formData.category.trim()) newErrors.category = '请选择商户类别';
    if (!formData.address.trim()) newErrors.address = '请输入经营地址';
    if (!formData.contact.trim()) newErrors.contact = '请输入联系人';
    if (!formData.phone.trim()) newErrors.phone = '请输入联系电话';
    if (!formData.contractStartDate) newErrors.contractStartDate = '请选择合同开始日期';
    if (!formData.contractEndDate) newErrors.contractEndDate = '请选择合同到期日期';
    if (!formData.rentAmount) newErrors.rentAmount = '请输入租金金额';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const merchantData: Omit<Merchant, 'id'> = {
      ...formData,
      rentAmount: parseFloat(formData.rentAmount),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (id) {
      updateMerchant(id, merchantData);
    } else {
      addMerchant(merchantData);
    }

    navigate('/merchants');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isEdit = !!id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/merchants')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回列表</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-6">
          {isEdit ? '编辑商户' : '新增商户'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商户名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入商户名称"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商户类别 <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">请选择类别</option>
                <option value="餐饮">餐饮</option>
                <option value="零售">零售</option>
                <option value="服务">服务</option>
                <option value="文化">文化</option>
                <option value="其他">其他</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                经营地址 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入经营地址"
              />
              {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contact ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入联系人"
              />
              {errors.contact && <p className="mt-1 text-sm text-red-500">{errors.contact}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系电话 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入联系电话"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">营业时间</label>
              <input
                type="text"
                name="businessHours"
                value={formData.businessHours}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: 09:00-21:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">经营状态</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="operating">营业中</option>
                <option value="closed">已关闭</option>
                <option value="suspended">已暂停</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">节假日营业</label>
              <select
                name="holidayStatus"
                value={formData.holidayStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">正常营业</option>
                <option value="partial">部分时段营业</option>
                <option value="closed">休息</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                合同开始日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="contractStartDate"
                value={formData.contractStartDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contractStartDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.contractStartDate && <p className="mt-1 text-sm text-red-500">{errors.contractStartDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                合同到期日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="contractEndDate"
                value={formData.contractEndDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contractEndDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.contractEndDate && <p className="mt-1 text-sm text-red-500">{errors.contractEndDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                租金金额(元/月) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.rentAmount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入租金金额"
              />
              {errors.rentAmount && <p className="mt-1 text-sm text-red-500">{errors.rentAmount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">租金状态</label>
              <select
                name="rentStatus"
                value={formData.rentStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="paid">已缴纳</option>
                <option value="pending">待缴纳</option>
                <option value="overdue">已逾期</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">星级评分</label>
              <select
                name="starLevel"
                value={formData.starLevel}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">★ 1星</option>
                <option value="2">★★ 2星</option>
                <option value="3">★★★ 3星</option>
                <option value="4">★★★★ 4星</option>
                <option value="5">★★★★★ 5星</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isBlacklisted"
                checked={formData.isBlacklisted}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">加入黑名单</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/merchants')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isEdit ? '保存修改' : '创建商户'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantForm;