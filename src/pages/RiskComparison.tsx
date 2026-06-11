import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  AlertTriangle, FileCheck, Star, TrendingUp, TrendingDown, DollarSign, 
  CheckCircle, XCircle, Clock, Plus, X, Building2, Users, Calendar
} from 'lucide-react';

const RiskComparison: React.FC = () => {
  const { merchants, licenses, reviews, rectifications, businessData } = useStore();
  const [selectedMerchantIds, setSelectedMerchantIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedMerchants = useMemo(() => {
    return merchants.filter(m => selectedMerchantIds.includes(m.id));
  }, [merchants, selectedMerchantIds]);

  const merchantRiskData = useMemo(() => {
    return selectedMerchants.map(merchant => {
      const merchantLicenses = licenses.filter(l => l.merchantId === merchant.id);
      const merchantReviews = reviews.filter(r => r.merchantId === merchant.id);
      const merchantRectifications = rectifications.filter(r => r.merchantId === merchant.id);
      const merchantBusinessData = businessData.filter(b => b.merchantId === merchant.id);

      const expiredLicenses = merchantLicenses.filter(l => l.status === 'expired');
      const expiringLicenses = merchantLicenses.filter(l => l.status === 'expiring');
      const pendingRectifications = merchantRectifications.filter(r => r.status !== 'completed');
      const overdueRectifications = merchantRectifications.filter(r => {
        if (r.status === 'completed') return false;
        return new Date(r.deadline) < new Date();
      });
      const pendingComplaints = merchantReviews.filter(r => r.type === 'complaint' && r.status !== 'resolved');
      
      const sortedBusinessData = merchantBusinessData.sort((a, b) => b.month.localeCompare(a.month));
      const latestBusiness = sortedBusinessData[0];
      const previousBusiness = sortedBusinessData[1];
      
      const revenueChange = latestBusiness && previousBusiness && previousBusiness.revenue > 0
        ? ((latestBusiness.revenue - previousBusiness.revenue) / previousBusiness.revenue * 100).toFixed(1)
        : null;
      const customerChange = latestBusiness && previousBusiness && previousBusiness.customerCount > 0
        ? ((latestBusiness.customerCount - previousBusiness.customerCount) / previousBusiness.customerCount * 100).toFixed(1)
        : null;

      const avgRating = merchantReviews.length > 0
        ? (merchantReviews.reduce((sum, r) => sum + r.rating, 0) / merchantReviews.length).toFixed(1)
        : null;

      const riskScore = 
        expiredLicenses.length * 30 +
        expiringLicenses.length * 10 +
        overdueRectifications.length * 25 +
        pendingRectifications.length * 15 +
        pendingComplaints.length * 10 +
        (merchant.isBlacklisted ? 50 : 0);

      return {
        merchant,
        expiredLicenses: expiredLicenses.length,
        expiringLicenses: expiringLicenses.length,
        pendingRectifications: pendingRectifications.length,
        overdueRectifications: overdueRectifications.length,
        pendingComplaints: pendingComplaints.length,
        latestRevenue: latestBusiness?.revenue || 0,
        revenueChange: revenueChange ? parseFloat(revenueChange) : null,
        latestCustomers: latestBusiness?.customerCount || 0,
        customerChange: customerChange ? parseFloat(customerChange) : null,
        avgRating: avgRating ? parseFloat(avgRating) : null,
        starLevel: parseInt(merchant.starLevel),
        riskScore,
        isBlacklisted: merchant.isBlacklisted,
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [selectedMerchants, licenses, reviews, rectifications, businessData]);

  const addMerchant = (id: string) => {
    if (!selectedMerchantIds.includes(id)) {
      setSelectedMerchantIds([...selectedMerchantIds, id]);
    }
    setShowAddModal(false);
  };

  const removeMerchant = (id: string) => {
    setSelectedMerchantIds(selectedMerchantIds.filter(mId => mId !== id));
  };

  const getRiskLevel = (score: number) => {
    if (score >= 50) return { level: 'high', label: '高风险', color: 'red' };
    if (score >= 20) return { level: 'medium', label: '中风险', color: 'orange' };
    return { level: 'low', label: '低风险', color: 'green' };
  };

  const availableMerchants = merchants.filter(m => !selectedMerchantIds.includes(m.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">商户风险对比</h1>
          <p className="text-gray-500 mt-1">多商户风险指标对比分析，优先处理高风险商户</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加商户</span>
        </button>
      </div>

      {selectedMerchantIds.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">请选择商户进行风险对比分析</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            选择商户
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">已选择商户:</span>
              {selectedMerchants.map((merchant) => (
                <div
                  key={merchant.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg"
                >
                  <span className="font-medium">{merchant.name}</span>
                  <span className="text-xs text-blue-500">({merchant.category})</span>
                  <button
                    onClick={() => removeMerchant(merchant.id)}
                    className="p-0.5 hover:bg-blue-100 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                风险排名 (按风险评分排序)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">排名</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">商户名称</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类别</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">风险等级</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">风险评分</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">过期证照</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">即将到期</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">逾期整改</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">待处理整改</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">待处理投诉</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">营收变化</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">星级</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {merchantRiskData.map((data, index) => {
                    const risk = getRiskLevel(data.riskScore);
                    return (
                      <tr key={data.merchant.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-red-100 text-red-700' :
                            index === 1 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-800">{data.merchant.name}</p>
                          {data.isBlacklisted && (
                            <span className="text-xs text-red-600">黑名单商户</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">{data.merchant.category}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            risk.color === 'red' ? 'bg-red-100 text-red-700' :
                            risk.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {risk.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`font-bold ${
                            data.riskScore >= 50 ? 'text-red-600' :
                            data.riskScore >= 20 ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {data.riskScore}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            data.expiredLicenses > 0 ? 'bg-red-100 text-red-700 font-medium' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {data.expiredLicenses}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            data.expiringLicenses > 0 ? 'bg-orange-100 text-orange-700 font-medium' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {data.expiringLicenses}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            data.overdueRectifications > 0 ? 'bg-red-100 text-red-700 font-medium' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {data.overdueRectifications}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            data.pendingRectifications > 0 ? 'bg-yellow-100 text-yellow-700 font-medium' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {data.pendingRectifications}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            data.pendingComplaints > 0 ? 'bg-orange-100 text-orange-700 font-medium' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {data.pendingComplaints}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {data.revenueChange !== null ? (
                            <div className={`flex items-center gap-1 ${
                              data.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {data.revenueChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              <span className="font-medium">{data.revenueChange >= 0 ? '+' : ''}{data.revenueChange}%</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">无数据</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <Star className={`w-4 h-4 ${data.starLevel >= 1 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            <span className="font-medium text-gray-800">{data.starLevel}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {merchantRiskData.map((data) => {
              const risk = getRiskLevel(data.riskScore);
              return (
                <div key={data.merchant.id} className={`bg-white rounded-xl p-4 shadow-sm border-2 ${
                  risk.color === 'red' ? 'border-red-200' :
                  risk.color === 'orange' ? 'border-orange-200' :
                  'border-green-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{data.merchant.name}</h3>
                      <p className="text-sm text-gray-500">{data.merchant.category}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      risk.color === 'red' ? 'bg-red-100 text-red-700' :
                      risk.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {risk.label}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <FileCheck className="w-4 h-4" />
                        过期证照
                      </span>
                      <span className={`font-medium ${data.expiredLicenses > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {data.expiredLicenses}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        即将到期
                      </span>
                      <span className={`font-medium ${data.expiringLicenses > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                        {data.expiringLicenses}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        逾期整改
                      </span>
                      <span className={`font-medium ${data.overdueRectifications > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {data.overdueRectifications}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        待处理投诉
                      </span>
                      <span className={`font-medium ${data.pendingComplaints > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                        {data.pendingComplaints}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        营收变化
                      </span>
                      {data.revenueChange !== null ? (
                        <span className={`font-medium flex items-center gap-1 ${
                          data.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {data.revenueChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {data.revenueChange >= 0 ? '+' : ''}{data.revenueChange}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">无数据</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        星级评分
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < data.starLevel ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">风险评分</span>
                      <span className={`text-lg font-bold ${
                        data.riskScore >= 50 ? 'text-red-600' :
                        data.riskScore >= 20 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {data.riskScore}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">选择商户</h3>
            {availableMerchants.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableMerchants.map((merchant) => (
                  <button
                    key={merchant.id}
                    onClick={() => addMerchant(merchant.id)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{merchant.name}</p>
                      <p className="text-sm text-gray-500">{merchant.category}</p>
                    </div>
                    <Plus className="w-4 h-4 text-blue-600" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">所有商户已添加</p>
            )}
            <div className="mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskComparison;