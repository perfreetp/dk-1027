import React from 'react';
import { useStore } from '../store/useStore';
import {
  Building2,
  TrendingUp,
  Star,
  AlertTriangle,
  FileCheck,
  Clock,
  MessageSquare,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { monthlyRevenue, categoryDistribution } from '../data/mockData';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard: React.FC = () => {
  const { stats, licenses, rectifications, reviews } = useStore();

  const upcomingExpirations = licenses.filter(l => l.status === 'expiring').slice(0, 3);
  const pendingTasks = rectifications.filter(r => r.status !== 'completed').slice(0, 3);
  const pendingComplaints = reviews.filter(r => r.type === 'complaint' && r.status === 'pending').slice(0, 3);

  const revenueChartData = {
    labels: monthlyRevenue.map(m => m.month),
    datasets: [
      {
        label: '月度营收(元)',
        data: monthlyRevenue.map(m => m.revenue / 10000),
        backgroundColor: 'rgba(30, 144, 255, 0.6)',
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

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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

  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { padding: 20, usePointStyle: true },
      },
    },
  };

  const statCards = [
    {
      title: '商户总数',
      value: stats.totalMerchants,
      icon: Building2,
      color: 'bg-blue-500',
      subtext: `${stats.operatingMerchants} 家营业中`,
      trend: { value: '+2', label: '本月新增', positive: true },
    },
    {
      title: '平均评分',
      value: stats.averageRating,
      icon: Star,
      color: 'bg-yellow-500',
      subtext: '基于游客评价',
      trend: { value: '+0.2', label: '较上月', positive: true },
    },
    {
      title: '待整改任务',
      value: stats.pendingRectifications,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      subtext: '需处理的整改项',
      trend: { value: '-1', label: '较上周', positive: false },
    },
    {
      title: '证照到期',
      value: stats.expiredLicenses,
      icon: FileCheck,
      color: 'bg-red-500',
      subtext: `${stats.upcomingLicenseExpirations} 项即将到期`,
      trend: null,
    },
    {
      title: '待处理投诉',
      value: stats.pendingComplaints,
      icon: MessageSquare,
      color: 'bg-purple-500',
      subtext: '游客投诉待处理',
      trend: null,
    },
    {
      title: '本月营收',
      value: (stats.revenueThisMonth / 10000).toFixed(1),
      icon: DollarSign,
      color: 'bg-green-500',
      subtext: '万元',
      trend: { value: '-2.3%', label: '较上月', positive: false },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">经营总览</h1>
          <p className="text-gray-500 mt-1">实时监控西湖景区商户经营状况</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-800">{card.value}</span>
                    {card.title === '本月营收' && <span className="text-sm text-gray-500">万</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{card.subtext}</p>
                </div>
                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              {card.trend && (
                <div className={`mt-3 flex items-center gap-1 text-sm ${card.trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {card.trend.positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span>{card.trend.value}</span>
                  <span className="text-gray-400">{card.trend.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">月度营收趋势</h2>
          <div className="h-64">
            <Bar data={revenueChartData} options={revenueOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">商户分类分布</h2>
          <div className="h-64">
            <Doughnut data={categoryChartData} options={categoryOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">证照到期提醒</h2>
            <span className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">查看全部</span>
          </div>
          <div className="space-y-3">
            {upcomingExpirations.length > 0 ? (
              upcomingExpirations.map((license) => (
                <div key={license.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{license.merchantName}</p>
                    <p className="text-xs text-gray-500">{license.type}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-orange-200 text-orange-700 rounded-full">
                    即将到期
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">暂无即将到期证照</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">待处理整改</h2>
            <span className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">查看全部</span>
          </div>
          <div className="space-y-3">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.merchantName}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'pending' ? 'bg-yellow-200 text-yellow-700' :
                    task.status === 'processing' ? 'bg-blue-200 text-blue-700' :
                    'bg-purple-200 text-purple-700'
                  }`}>
                    {task.status === 'pending' ? '待处理' :
                     task.status === 'processing' ? '处理中' : '待复查'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">暂无待处理整改任务</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">待处理投诉</h2>
            <span className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">查看全部</span>
          </div>
          <div className="space-y-3">
            {pendingComplaints.length > 0 ? (
              pendingComplaints.map((complaint) => (
                <div key={complaint.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{complaint.merchantName}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{complaint.content}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-red-200 text-red-700 rounded-full">
                    待处理
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">暂无待处理投诉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;