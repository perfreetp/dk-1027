import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Star, Phone, MapPin, Clock, AlertCircle, Calendar, FileCheck, Tag, Award, User } from 'lucide-react';

const MerchantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { merchants, licenses, prices, inspections, reviews } = useStore();

  const merchant = merchants.find((m) => m.id === id);
  const merchantLicenses = licenses.filter((l) => l.merchantId === id);
  const merchantPrices = prices.filter((p) => p.merchantId === id);
  const merchantInspections = inspections.filter((i) => i.merchantId === id);
  const merchantReviews = reviews.filter((r) => r.merchantId === id);

  if (!merchant) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">商户不存在</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operating':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">营业中</span>;
      case 'closed':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">已关闭</span>;
      case 'suspended':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">已暂停</span>;
      default:
        return null;
    }
  };

  const getRentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="text-green-600 font-medium">已缴纳</span>;
      case 'pending':
        return <span className="text-yellow-600 font-medium">待缴纳</span>;
      case 'overdue':
        return <span className="text-red-600 font-medium">已逾期</span>;
      default:
        return null;
    }
  };

  const getLicenseStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">有效</span>;
      case 'expiring':
        return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">即将到期</span>;
      case 'expired':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">已过期</span>;
      default:
        return null;
    }
  };

  const getInspectionResultBadge = (result: string) => {
    switch (result) {
      case 'pass':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">合格</span>;
      case 'partial':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">部分合格</span>;
      case 'fail':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">不合格</span>;
      default:
        return null;
    }
  };

  const renderStars = (level: string) => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < parseInt(level) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const avgRating = merchantReviews.length > 0
    ? (merchantReviews.reduce((sum, r) => sum + r.rating, 0) / merchantReviews.length).toFixed(1)
    : '暂无';

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
        <div className="flex-1" />
        <button
          onClick={() => navigate(`/merchants/${id}/edit`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          编辑商户
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{merchant.name}</h1>
              {getStatusBadge(merchant.status)}
              {merchant.isBlacklisted && (
                <span className="flex items-center gap-1 px-3 py-1 bg-red-500/30 text-red-200 text-sm rounded-full">
                  <AlertCircle className="w-4 h-4" />
                  黑名单商户
                </span>
              )}
            </div>
            <p className="text-blue-100">{merchant.category}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-200">商户星级</span>
            {renderStars(merchant.starLevel)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              基本信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">商户ID</p>
                <p className="font-medium text-gray-800">{merchant.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">联系人</p>
                <p className="font-medium text-gray-800">{merchant.contact}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">联系电话</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {merchant.phone}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">经营地址</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {merchant.address}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">营业时间</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {merchant.businessHours}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">节假日营业</p>
                <p className={`font-medium ${
                  merchant.holidayStatus === 'open' ? 'text-green-600' :
                  merchant.holidayStatus === 'partial' ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {merchant.holidayStatus === 'open' ? '正常营业' :
                   merchant.holidayStatus === 'partial' ? '部分时段营业' : '休息'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              合同信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">合同开始日期</p>
                <p className="font-medium text-gray-800">{merchant.contractStartDate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">合同到期日期</p>
                <p className="font-medium text-gray-800">{merchant.contractEndDate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">租金金额</p>
                <p className="font-medium text-gray-800">¥{merchant.rentAmount.toLocaleString()}/月</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">租金状态</p>
                {getRentStatusBadge(merchant.rentStatus)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              证照信息
            </h2>
            {merchantLicenses.length > 0 ? (
              <div className="space-y-3">
                {merchantLicenses.map((license) => (
                  <div key={license.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{license.type}</p>
                      <p className="text-sm text-gray-500">编号: {license.number}</p>
                      <p className="text-xs text-gray-400">到期时间: {license.expireDate}</p>
                    </div>
                    {getLicenseStatusBadge(license.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">暂无证照信息</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              价格备案
            </h2>
            {merchantPrices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">商品名称</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">原价</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">现价</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">单位</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {merchantPrices.map((price) => (
                      <tr key={price.id}>
                        <td className="px-4 py-3 text-sm text-gray-800">{price.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">¥{price.originalPrice}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">¥{price.currentPrice}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{price.unit}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            price.status === 'approved' ? 'bg-green-100 text-green-700' :
                            price.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {price.status === 'approved' ? '已审核' :
                             price.status === 'pending' ? '待审核' : '已拒绝'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">暂无价格备案信息</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              游客评价
            </h2>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-blue-600">{avgRating}</p>
              {avgRating !== '暂无' && renderStars(avgRating)}
              <p className="text-sm text-gray-500 mt-1">{merchantReviews.length} 条评价</p>
            </div>
            {merchantReviews.slice(0, 3).map((review) => (
              <div key={review.id} className="p-3 bg-gray-50 rounded-lg mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">{review.reviewer}</span>
                  <span className="text-xs text-gray-400">{review.reviewDate}</span>
                </div>
                <p className="text-sm text-gray-600">{review.content}</p>
                {review.reply && (
                  <div className="mt-2 p-2 bg-white rounded text-xs text-blue-600">
                    回复: {review.reply}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">检查记录</h2>
            {merchantInspections.length > 0 ? (
              <div className="space-y-3">
                {merchantInspections.map((inspection) => (
                  <div key={inspection.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">
                        {inspection.type === 'food' ? '食品安全检查' :
                         inspection.type === 'fire' ? '消防安全检查' : '日常巡检'}
                      </span>
                      {getInspectionResultBadge(inspection.result)}
                    </div>
                    <p className="text-xs text-gray-500">检查时间: {inspection.inspectionDate}</p>
                    <p className="text-xs text-gray-500">检查人: {inspection.inspector}</p>
                    {inspection.issues.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-red-600 mb-1">发现问题:</p>
                        {inspection.issues.map((issue, index) => (
                          <p key={index} className="text-xs text-gray-600">- {issue}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">暂无检查记录</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDetail;