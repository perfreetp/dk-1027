import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { BarChart3, Download, Calendar, TrendingUp, Building2, Star, AlertTriangle, FileCheck } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { monthlyRevenue, categoryDistribution, ratingDistribution, inspectionStats } from '../data/mockData';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Reports: React.FC = () => {
  const { merchants, licenses, inspections, reviews, rectifications } = useStore();
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-06-30');

  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const avgMonthlyRevenue = (totalRevenue / monthlyRevenue.length).toFixed(0);
  const rectificationRate = rectifications.length > 0
    ? ((rectifications.filter(r => r.status === 'completed').length / rectifications.length) * 100).toFixed(0)
    : '0';

  const revenueChartData = {
    labels: monthlyRevenue.map(m => m.month),
    datasets: [
      {
        label: '月度营收(万元)',
        data: monthlyRevenue.map(m => m.revenue / 10000),
        backgroundColor: 'rgba(30, 144, 255, 0.7)',
        borderColor: 'rgba(30, 144, 255, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const categoryChartData = {
    labels: categoryDistribution.map(c => c.category),
    datasets: [
      {
        data: categoryDistribution.map(c => c.count),
        backgroundColor: [
          'rgba(30, 144, 255, 0.8)',
          'rgba(34, 139, 34, 0.8)',
          'rgba(255, 215, 0, 0.8)',
          'rgba(147, 112, 219, 0.8)',
        ],
        borderColor: [
          'rgba(30, 144, 255, 1)',
          'rgba(34, 139, 34, 1)',
          'rgba(255, 215, 0, 1)',
          'rgba(147, 112, 219, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const ratingChartData = {
    labels: ratingDistribution.map(r => `${r.rating}星`),
    datasets: [
      {
        data: ratingDistribution.map(r => r.count),
        backgroundColor: [
          'rgba(255, 215, 0, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(255, 152, 0, 0.8)',
          'rgba(255, 87, 34, 0.8)',
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
        data: [inspectionStats.pass, inspectionStats.partial, inspectionStats.fail],
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
      merchants: merchants.length,
      licenses: licenses.length,
      inspections: inspections.length,
      reviews: reviews.length,
      rectifications: rectifications.length,
      avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0',
      rectificationRate: `${rectificationRate}%`,
      totalRevenue: `${(totalRevenue / 10000).toFixed(0)}万元`,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `监管台账_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statsCards = [
    {
      title: '商户总数',
      value: merchants.length,
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      title: '证照总数',
      value: licenses.length,
      icon: FileCheck,
      color: 'bg-green-500',
    },
    {
      title: '检查次数',
      value: inspections.length,
      icon: AlertTriangle,
      color: 'bg-orange-500',
    },
    {
      title: '游客评价',
      value: reviews.length,
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
      value: `${(totalRevenue / 10000).toFixed(0)}万`,
      icon: BarChart3,
      color: 'bg-cyan-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">数据报表</h1>
          <p className="text-gray-500 mt-1">汇总分析商户经营数据，导出监管台账</p>
        </div>
        <div className="flex items-center gap-4">
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
              <p className="text-xl font-bold text-gray-800">{(totalRevenue / 10000).toFixed(0)} 万元</p>
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
              <p className="text-xl font-bold text-green-700">{inspectionStats.pass}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600">部分合格</p>
              <p className="text-xl font-bold text-yellow-700">{inspectionStats.partial}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">不合格</p>
              <p className="text-xl font-bold text-red-700">{inspectionStats.fail}</p>
            </div>
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
              {merchants.map((merchant) => {
                const merchantLicenses = licenses.filter(l => l.merchantId === merchant.id);
                const merchantInspections = inspections.filter(i => i.merchantId === merchant.id);
                const merchantReviews = reviews.filter(r => r.merchantId === merchant.id);
                const merchantRectifications = rectifications.filter(r => r.merchantId === merchant.id);
                
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
    </div>
  );
};

export default Reports;