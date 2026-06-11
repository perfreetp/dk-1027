import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { BarChart3, Download, Calendar, TrendingUp, Building2, Star, AlertTriangle, FileCheck, Plus, Edit, Trash2 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { BusinessData } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Reports: React.FC = () => {
  const { merchants, licenses, inspections, reviews, rectifications, businessData, addBusinessData, updateBusinessData, deleteBusinessData } = useStore();
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showBusinessDataModal, setShowBusinessDataModal] = useState(false);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [editingBusinessDataId, setEditingBusinessDataId] = useState<string | null>(null);

  interface FormData {
    merchantId: string;
    month: string;
    revenue: string;
    customerCount: string;
    rentPaid: string;
    rentStatus: 'paid' | 'partial' | 'unpaid';
    notes: string;
  }

  const [formData, setFormData] = useState<FormData>({
    merchantId: '',
    month: '',
    revenue: '',
    customerCount: '',
    rentPaid: '',
    rentStatus: 'paid',
    notes: '',
  });

  const categories = useMemo(() => {
    const cats = new Set<string>();
    merchants.forEach(m => cats.add(m.category));
    return Array.from(cats);
  }, [merchants]);

  const filteredMerchants = useMemo(() => {
    return merchants.filter(m => {
      if (categoryFilter === 'all') return true;
      return m.category === categoryFilter;
    });
  }, [merchants, categoryFilter]);

  const filteredMerchantIds = useMemo(() => {
    return filteredMerchants.map(m => m.id);
  }, [filteredMerchants]);

  const filteredLicenses = useMemo(() => {
    return licenses.filter(l => filteredMerchantIds.includes(l.merchantId));
  }, [licenses, filteredMerchantIds]);

  const filteredInspections = useMemo(() => {
    return inspections.filter(i => {
      if (!filteredMerchantIds.includes(i.merchantId)) return false;
      const inspectionDate = new Date(i.inspectionDate);
      return inspectionDate >= new Date(startDate) && inspectionDate <= new Date(endDate);
    });
  }, [inspections, filteredMerchantIds, startDate, endDate]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      if (!filteredMerchantIds.includes(r.merchantId)) return false;
      const reviewDate = new Date(r.reviewDate);
      return reviewDate >= new Date(startDate) && reviewDate <= new Date(endDate);
    });
  }, [reviews, filteredMerchantIds, startDate, endDate]);

  const filteredRectifications = useMemo(() => {
    return rectifications.filter(r => {
      if (!filteredMerchantIds.includes(r.merchantId)) return false;
      const createdAt = new Date(r.createdAt);
      return createdAt >= new Date(startDate) && createdAt <= new Date(endDate);
    });
  }, [rectifications, filteredMerchantIds, startDate, endDate]);

  const filteredBusinessData = useMemo(() => {
    return businessData.filter(b => {
      if (!filteredMerchantIds.includes(b.merchantId)) return false;
      const monthStart = new Date(b.month + '-01');
      return monthStart >= new Date(startDate) && monthStart <= new Date(endDate);
    });
  }, [businessData, filteredMerchantIds, startDate, endDate]);

  const rectificationRate = filteredRectifications.length > 0
    ? ((filteredRectifications.filter(r => r.status === 'completed').length / filteredRectifications.length) * 100).toFixed(0)
    : '0';

  const totalBusinessRevenue = filteredBusinessData.reduce((sum, b) => sum + b.revenue, 0);
  const totalCustomers = filteredBusinessData.reduce((sum, b) => sum + b.customerCount, 0);
  const totalRentPaid = filteredBusinessData.reduce((sum, b) => sum + b.rentPaid, 0);

  const monthlyRevenueData = useMemo(() => {
    const months: { [key: string]: number } = {};
    filteredBusinessData.forEach(b => {
      if (months[b.month]) {
        months[b.month] += b.revenue;
      } else {
        months[b.month] = b.revenue;
      }
    });
    const sortedMonths = Object.keys(months).sort();
    return sortedMonths.map(month => ({
      month: month.replace('-', '年') + '月',
      revenue: months[month]
    }));
  }, [filteredBusinessData]);

  const avgMonthlyRevenue = monthlyRevenueData.length > 0
    ? (totalBusinessRevenue / monthlyRevenueData.length / 10000).toFixed(1)
    : '0';

  const categoryDistributionData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    filteredMerchants.forEach(m => {
      if (categories[m.category]) {
        categories[m.category]++;
      } else {
        categories[m.category] = 1;
      }
    });
    return Object.entries(categories).map(([category, count]) => ({ category, count }));
  }, [filteredMerchants]);

  const ratingDistributionData = useMemo(() => {
    const ratings: { [key: string]: number } = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    filteredMerchants.forEach(m => {
      ratings[m.starLevel]++;
    });
    return Object.entries(ratings).map(([rating, count]) => ({ rating: parseInt(rating), count }));
  }, [filteredMerchants]);

  const inspectionStatsData = useMemo(() => {
    const stats = { pass: 0, partial: 0, fail: 0 };
    filteredInspections.forEach(i => {
      if (i.result === 'pass') stats.pass++;
      else if (i.result === 'partial') stats.partial++;
      else stats.fail++;
    });
    return stats;
  }, [filteredInspections]);

  const revenueChartData = {
    labels: monthlyRevenueData.length > 0 ? monthlyRevenueData.map(m => m.month) : ['暂无数据'],
    datasets: [
      {
        label: '月度营收(万元)',
        data: monthlyRevenueData.length > 0 ? monthlyRevenueData.map(m => m.revenue / 10000) : [0],
        backgroundColor: 'rgba(30, 144, 255, 0.7)',
        borderColor: 'rgba(30, 144, 255, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const categoryChartData = {
    labels: categoryDistributionData.map(c => c.category),
    datasets: [
      {
        data: categoryDistributionData.map(c => c.count),
        backgroundColor: [
          'rgba(30, 144, 255, 0.8)',
          'rgba(34, 139, 34, 0.8)',
          'rgba(255, 215, 0, 0.8)',
          'rgba(147, 112, 219, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(30, 144, 255, 1)',
          'rgba(34, 139, 34, 1)',
          'rgba(255, 215, 0, 1)',
          'rgba(147, 112, 219, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const ratingChartData = {
    labels: ratingDistributionData.map(r => `${r.rating}星`),
    datasets: [
      {
        data: ratingDistributionData.map(r => r.count),
        backgroundColor: [
          'rgba(255, 215, 0, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(255, 152, 0, 0.8)',
          'rgba(255, 87, 34, 0.8)',
          'rgba(76, 175, 80, 0.8)',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const inspectionChartData = {
    labels: ['合格', '部分合格', '不合格'],
    datasets: [
      {
        data: [inspectionStatsData.pass, inspectionStatsData.partial, inspectionStatsData.fail],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(244, 67, 54, 0.8)',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' as const },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { callback: (value) => `${value}万` },
      },
      x: { grid: { display: false } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { padding: 20, usePointStyle: true },
      },
    },
  };

  const exportData = () => {
    const data = {
      filter: {
        startDate,
        endDate,
        category: categoryFilter === 'all' ? '全部类别' : categoryFilter,
      },
      summary: {
        merchants: filteredMerchants.length,
        licenses: filteredLicenses.length,
        inspections: filteredInspections.length,
        reviews: filteredReviews.length,
        rectifications: filteredRectifications.length,
        avgRating: filteredReviews.length > 0 ? (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length).toFixed(1) : '0',
        rectificationRate: `${rectificationRate}%`,
        totalRevenue: `${(totalBusinessRevenue / 10000).toFixed(0)}万元`,
        totalCustomers: totalCustomers,
        totalRentPaid: `${(totalRentPaid / 10000).toFixed(0)}万元`,
      },
      merchants: filteredMerchants.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        status: m.status,
        starLevel: m.starLevel,
        isBlacklisted: m.isBlacklisted,
      })),
      businessData: filteredBusinessData.map(b => ({
        id: b.id,
        merchantId: b.merchantId,
        merchantName: b.merchantName,
        month: b.month,
        revenue: b.revenue,
        customerCount: b.customerCount,
        rentPaid: b.rentPaid,
        rentStatus: b.rentStatus,
        notes: b.notes,
      })),
      licenses: filteredLicenses.map(l => ({
        id: l.id,
        merchantId: l.merchantId,
        merchantName: l.merchantName,
        type: l.type,
        number: l.number,
        issueDate: l.issueDate,
        expireDate: l.expireDate,
        status: l.status,
      })),
      inspections: filteredInspections.map(i => ({
        id: i.id,
        merchantId: i.merchantId,
        merchantName: i.merchantName,
        type: i.type,
        inspectionDate: i.inspectionDate,
        inspector: i.inspector,
        result: i.result,
        issues: i.issues,
      })),
      reviews: filteredReviews.map(r => ({
        id: r.id,
        merchantId: r.merchantId,
        merchantName: r.merchantName,
        type: r.type,
        content: r.content,
        rating: r.rating,
        reviewer: r.reviewer,
        reviewDate: r.reviewDate,
        status: r.status,
      })),
      rectifications: filteredRectifications.map(r => ({
        id: r.id,
        merchantId: r.merchantId,
        merchantName: r.merchantName,
        title: r.title,
        description: r.description,
        deadline: r.deadline,
        status: r.status,
        assignee: r.assignee,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
      })),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `监管台账_${new Date().toISOString().split('T')[0]}_${categoryFilter === 'all' ? '全部' : categoryFilter}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBusinessDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const merchant = merchants.find(m => m.id === formData.merchantId);
    
    if (editingBusinessDataId) {
      updateBusinessData(editingBusinessDataId, {
        merchantId: formData.merchantId,
        merchantName: merchant?.name || '',
        month: formData.month,
        revenue: parseFloat(formData.revenue),
        customerCount: parseInt(formData.customerCount),
        rentPaid: parseFloat(formData.rentPaid),
        rentStatus: formData.rentStatus,
        notes: formData.notes,
      });
    } else {
      const existingData = businessData.find(
        b => b.merchantId === formData.merchantId && b.month === formData.month
      );
      
      if (existingData) {
        updateBusinessData(existingData.id, {
          revenue: parseFloat(formData.revenue),
          customerCount: parseInt(formData.customerCount),
          rentPaid: parseFloat(formData.rentPaid),
          rentStatus: formData.rentStatus,
          notes: formData.notes,
        });
      } else {
        addBusinessData({
          merchantId: formData.merchantId,
          merchantName: merchant?.name || '',
          month: formData.month,
          revenue: parseFloat(formData.revenue),
          customerCount: parseInt(formData.customerCount),
          rentPaid: parseFloat(formData.rentPaid),
          rentStatus: formData.rentStatus,
          notes: formData.notes,
        });
      }
    }
    
    setShowBusinessDataModal(false);
    setEditingBusinessDataId(null);
    setFormData({
      merchantId: '',
      month: '',
      revenue: '',
      customerCount: '',
      rentPaid: '',
      rentStatus: 'paid',
      notes: '',
    });
  };

  const handleEditBusinessData = (data: BusinessData) => {
    setEditingBusinessDataId(data.id);
    setFormData({
      merchantId: data.merchantId,
      month: data.month,
      revenue: data.revenue.toString(),
      customerCount: data.customerCount.toString(),
      rentPaid: data.rentPaid.toString(),
      rentStatus: data.rentStatus,
      notes: data.notes || '',
    });
    setShowBusinessDataModal(true);
  };

  const handleDeleteBusinessData = (id: string) => {
    deleteBusinessData(id);
  };

  const statsCards = [
    {
      title: '商户总数',
      value: filteredMerchants.length,
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      title: '证照总数',
      value: filteredLicenses.length,
      icon: FileCheck,
      color: 'bg-green-500',
    },
    {
      title: '检查次数',
      value: filteredInspections.length,
      icon: AlertTriangle,
      color: 'bg-orange-500',
    },
    {
      title: '游客评价',
      value: filteredReviews.length,
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      title: '整改完成率',
      value: `${rectificationRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: '累计营收',
      value: `${(totalBusinessRevenue / 10000).toFixed(0)}万`,
      icon: BarChart3,
      color: 'bg-cyan-500',
    },
  ];

  const tableFilteredBusinessData = useMemo(() => {
    return filteredBusinessData.filter(b => {
      if (!selectedMerchantId) return true;
      return b.merchantId === selectedMerchantId;
    });
  }, [filteredBusinessData, selectedMerchantId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">数据报表</h1>
          <p className="text-gray-500 mt-1">汇总分析商户经营数据，导出监管台账</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部类别</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={exportData}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>导出台账</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">月度营收趋势</h2>
          <div className="h-64">
            <Bar data={revenueChartData} options={revenueOptions} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">累计营收</p>
              <p className="text-xl font-bold text-gray-800">{(totalBusinessRevenue / 10000).toFixed(0)} 万元</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">月均营收</p>
              <p className="text-xl font-bold text-gray-800">{avgMonthlyRevenue} 万元</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">商户分类分布</h2>
          <div className="h-64">
            <Doughnut data={categoryChartData} options={doughnutOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">商户星级分布</h2>
          <div className="h-64">
            <Doughnut data={ratingChartData} options={doughnutOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">检查结果统计</h2>
          <div className="h-64">
            <Doughnut data={inspectionChartData} options={doughnutOptions} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">合格</p>
              <p className="text-xl font-bold text-green-700">{inspectionStatsData.pass}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600">部分合格</p>
              <p className="text-xl font-bold text-yellow-700">{inspectionStatsData.partial}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">不合格</p>
              <p className="text-xl font-bold text-red-700">{inspectionStatsData.fail}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">经营数据填报</h2>
          <button
            onClick={() => setShowBusinessDataModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>新增数据</span>
          </button>
        </div>
        <div className="p-4">
          <select
            value={selectedMerchantId}
            onChange={(e) => setSelectedMerchantId(e.target.value)}
            className="mb-4 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部商户</option>
            {merchants.map((merchant) => (
              <option key={merchant.id} value={merchant.id}>
                {merchant.name}
              </option>
            ))}
          </select>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商户名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月份</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">营业额(元)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客流量</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">租金缴纳(元)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">租金状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableFilteredBusinessData.map((data) => (
                  <tr key={data.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{data.merchantName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">{data.month}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-800 font-medium">{data.revenue.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-800">{data.customerCount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-800">{data.rentPaid.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        data.rentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        data.rentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {data.rentStatus === 'paid' ? '已缴纳' : data.rentStatus === 'partial' ? '部分缴纳' : '未缴纳'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">{data.notes || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditBusinessData(data)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBusinessData(data.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tableFilteredBusinessData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">暂无经营数据</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">监管台账汇总</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商户名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类别</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">星级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">证照数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检查次数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评价数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">整改任务</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMerchants.map((merchant) => {
                const merchantLicenses = filteredLicenses.filter(l => l.merchantId === merchant.id);
                const merchantInspections = filteredInspections.filter(i => i.merchantId === merchant.id);
                const merchantReviews = filteredReviews.filter(r => r.merchantId === merchant.id);
                const merchantRectifications = filteredRectifications.filter(r => r.merchantId === merchant.id);
                
                return (
                  <tr key={merchant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{merchant.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">{merchant.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        merchant.status === 'operating' ? 'bg-green-100 text-green-700' :
                        merchant.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {merchant.status === 'operating' ? '营业中' :
                         merchant.status === 'closed' ? '已关闭' : '已暂停'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < parseInt(merchant.starLevel) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{merchantLicenses.length}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{merchantInspections.length}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{merchantReviews.length}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        merchantRectifications.length > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {merchantRectifications.length}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showBusinessDataModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">经营数据填报</h3>
            <form onSubmit={handleBusinessDataSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">月份</label>
                <input
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">营业额(元)</label>
                <input
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入营业额"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客流量</label>
                <input
                  type="number"
                  value={formData.customerCount}
                  onChange={(e) => setFormData({ ...formData, customerCount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入客流量"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">租金缴纳(元)</label>
                <input
                  type="number"
                  value={formData.rentPaid}
                  onChange={(e) => setFormData({ ...formData, rentPaid: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入租金缴纳金额"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">租金状态</label>
                <select
                  value={formData.rentStatus}
                  onChange={(e) => setFormData({ ...formData, rentStatus: e.target.value as 'paid' | 'partial' | 'unpaid' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="paid">已缴纳</option>
                  <option value="partial">部分缴纳</option>
                  <option value="unpaid">未缴纳</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="其他说明..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBusinessDataModal(false);
                    setEditingBusinessDataId(null);
                    setFormData({
                      merchantId: '',
                      month: '',
                      revenue: '',
                      customerCount: '',
                      rentPaid: '',
                      rentStatus: 'paid',
                      notes: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存数据
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
