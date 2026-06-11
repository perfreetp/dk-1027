import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  ArrowLeft, Star, Phone, MapPin, Clock, AlertCircle, Calendar, FileCheck, Tag, Award, User, 
  AlertTriangle, TrendingUp, TrendingDown, DollarSign, Users, CheckCircle, XCircle, 
  Edit, Activity, FileText, Paperclip, ChevronDown, ChevronUp, Filter, X
} from 'lucide-react';

type TimelineFilter = 'all' | 'license' | 'inspection' | 'review' | 'rectification' | 'business';

const MerchantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { merchants, licenses, prices, inspections, reviews, rectifications, businessData } = useStore();
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('all');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const merchant = merchants.find((m) => m.id === id);

  const merchantLicenses = licenses.filter((l) => l.merchantId === id);
  const merchantPrices = prices.filter((p) => p.merchantId === id);
  const merchantInspections = inspections.filter((i) => i.merchantId === id);
  const merchantReviews = reviews.filter((r) => r.merchantId === id);
  const merchantRectifications = rectifications.filter((r) => r.merchantId === id);
  const merchantBusinessData = businessData.filter((b) => b.merchantId === id);

  if (!merchant) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">商户不存在或已被删除</p>
        <button
          onClick={() => navigate('/merchants')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回商户列表
        </button>
      </div>
    );
  }

  const timelineEvents = useMemo(() => {
    const events: Array<{
      id: string;
      date: string;
      type: string;
      title: string;
      description: string;
      status?: string;
      icon: React.ReactNode;
      color: string;
      data?: any;
    }> = [];

    merchantLicenses.forEach(l => {
      events.push({
        id: `license-${l.id}`,
        date: l.issueDate,
        type: 'license',
        title: `${l.type} 发证`,
        description: `证照编号: ${l.number}, 有效期至 ${l.expireDate}`,
        status: l.status,
        icon: <FileCheck className="w-4 h-4" />,
        color: l.status === 'expired' ? 'red' : l.status === 'expiring' ? 'orange' : 'green',
        data: l,
      });
    });

    merchantInspections.forEach(i => {
      events.push({
        id: `inspection-${i.id}`,
        date: i.inspectionDate,
        type: 'inspection',
        title: `${i.type === 'food' ? '食品安全检查' : i.type === 'fire' ? '消防安全检查' : '日常巡检'}`,
        description: i.issues.length > 0 ? `发现问题: ${i.issues.join(', ')}` : '检查合格',
        status: i.result,
        icon: <Activity className="w-4 h-4" />,
        color: i.result === 'fail' ? 'red' : i.result === 'partial' ? 'orange' : 'green',
        data: i,
      });
    });

    merchantReviews.forEach(r => {
      events.push({
        id: `review-${r.id}`,
        date: r.reviewDate,
        type: 'review',
        title: r.type === 'complaint' ? '游客投诉' : '游客评价',
        description: `${r.reviewer}: ${r.content}`,
        status: r.status,
        icon: r.type === 'complaint' ? <AlertTriangle className="w-4 h-4" /> : <Star className="w-4 h-4" />,
        color: r.type === 'complaint' ? 'red' : r.rating >= 4 ? 'green' : r.rating >= 3 ? 'blue' : 'orange',
        data: r,
      });
    });

    merchantRectifications.forEach(r => {
      events.push({
        id: `rectification-${r.id}`,
        date: r.createdAt,
        type: 'rectification',
        title: `整改任务: ${r.title}`,
        description: r.description,
        status: r.status,
        icon: <AlertTriangle className="w-4 h-4" />,
        color: r.status === 'completed' ? 'green' : r.status === 'rejected' ? 'red' : 'orange',
        data: r,
      });
      if (r.completedAt) {
        events.push({
          id: `rectification-complete-${r.id}`,
          date: r.completedAt,
          type: 'rectification',
          title: `整改完成: ${r.title}`,
          description: r.remark || '整改已通过复查',
          status: 'completed',
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'green',
          data: r,
        });
      }
    });

    merchantBusinessData.forEach(b => {
      events.push({
        id: `business-${b.id}`,
        date: b.month.replace('-', '') + '01',
        type: 'business',
        title: `${b.month.replace('-', '年')}月 经营数据`,
        description: `营业额: ¥${b.revenue.toLocaleString()}, 客流量: ${b.customerCount.toLocaleString()}人`,
        status: b.rentStatus,
        icon: <DollarSign className="w-4 h-4" />,
        color: b.rentStatus === 'paid' ? 'green' : b.rentStatus === 'partial' ? 'orange' : 'red',
        data: b,
      });
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [merchantLicenses, merchantInspections, merchantReviews, merchantRectifications, merchantBusinessData]);

  const filteredTimelineEvents = useMemo(() => {
    if (timelineFilter === 'all') return timelineEvents;
    return timelineEvents.filter(e => e.type === timelineFilter);
  }, [timelineEvents, timelineFilter]);

  const risks = useMemo(() => {
    const riskList: Array<{ level: 'high' | 'medium' | 'low'; title: string; description: string }> = [];
    
    const expiredLicenses = merchantLicenses.filter(l => l.status === 'expired');
    if (expiredLicenses.length > 0) {
      riskList.push({ level: 'high', title: '证照过期', description: `${expiredLicenses.length}个证照已过期，需立即处理` });
    }
    
    const expiringLicenses = merchantLicenses.filter(l => l.status === 'expiring');
    if (expiringLicenses.length > 0) {
      riskList.push({ level: 'medium', title: '证照即将到期', description: `${expiringLicenses.length}个证照即将到期` });
    }
    
    const pendingRectifications = merchantRectifications.filter(r => r.status !== 'completed');
    if (pendingRectifications.length > 0) {
      riskList.push({ level: 'high', title: '待完成整改', description: `${pendingRectifications.length}个整改任务待处理` });
    }
    
    const pendingComplaints = merchantReviews.filter(r => r.type === 'complaint' && r.status !== 'resolved');
    if (pendingComplaints.length > 0) {
      riskList.push({ level: 'medium', title: '待处理投诉', description: `${pendingComplaints.length}条投诉待处理` });
    }
    
    const overdueRent = merchantBusinessData.filter(b => b.rentStatus === 'unpaid');
    if (overdueRent.length > 0) {
      riskList.push({ level: 'high', title: '租金欠缴', description: `${overdueRent.length}个月租金未缴纳` });
    }
    
    const failedInspections = merchantInspections.filter(i => i.result === 'fail');
    if (failedInspections.length > 0) {
      riskList.push({ level: 'high', title: '检查不合格', description: `${failedInspections.length}次检查不合格` });
    }
    
    if (merchant.isBlacklisted) {
      riskList.push({ level: 'high', title: '黑名单商户', description: '该商户已被列入黑名单' });
    }
    
    return riskList;
  }, [merchantLicenses, merchantRectifications, merchantReviews, merchantBusinessData, merchantInspections, merchant]);

  const pendingTasks = useMemo(() => {
    const tasks: Array<{ title: string; deadline?: string; type: string }> = [];
    
    merchantLicenses.filter(l => l.status === 'expiring').forEach(l => {
      const days = Math.ceil((new Date(l.expireDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (days <= 30) {
        tasks.push({ title: `办理${l.type}续期`, deadline: l.expireDate, type: 'license' });
      }
    });
    
    merchantRectifications.filter(r => r.status !== 'completed').forEach(r => {
      tasks.push({ title: r.title, deadline: r.deadline, type: 'rectification' });
    });
    
    merchantReviews.filter(r => r.type === 'complaint' && r.status !== 'resolved').forEach(r => {
      tasks.push({ title: `处理${r.reviewer}的投诉`, deadline: r.reviewDate, type: 'complaint' });
    });
    
    return tasks;
  }, [merchantLicenses, merchantRectifications, merchantReviews]);

  const businessTrend = useMemo(() => {
    const sortedData = merchantBusinessData.sort((a, b) => a.month.localeCompare(b.month));
    if (sortedData.length < 2) return null;
    
    const latest = sortedData[sortedData.length - 1];
    const previous = sortedData[sortedData.length - 2];
    
    const revenueChange = previous.revenue > 0 ? ((latest.revenue - previous.revenue) / previous.revenue * 100).toFixed(1) : '0';
    const customerChange = previous.customerCount > 0 ? ((latest.customerCount - previous.customerCount) / previous.customerCount * 100).toFixed(1) : '0';
    
    return {
      revenueChange: parseFloat(revenueChange),
      customerChange: parseFloat(customerChange),
      latestRevenue: latest.revenue,
      latestCustomers: latest.customerCount,
    };
  }, [merchantBusinessData]);

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
      case 'partial':
        return <span className="text-yellow-600 font-medium">部分缴纳</span>;
      case 'unpaid':
        return <span className="text-red-600 font-medium">未缴纳</span>;
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

  const getRectificationStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">待处理</span>;
      case 'processing':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">处理中</span>;
      case 'reviewing':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">待复查</span>;
      case 'completed':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">已完成</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">已驳回</span>;
      default:
        return null;
    }
  };

  const renderStars = (level: string | number) => {
    const num = typeof level === 'string' ? parseFloat(level) : level;
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < Math.round(num) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const renderEventDetail = (event: any) => {
    const data = event.data;
    const isExpanded = expandedEvent === event.id;
    
    return (
      <div key={event.id} className="relative pl-10">
        <div className={`absolute left-2 w-4 h-4 rounded-full ${
          event.color === 'green' ? 'bg-green-500' :
          event.color === 'red' ? 'bg-red-500' :
          event.color === 'orange' ? 'bg-orange-500' :
          'bg-blue-500'
        }`} />
        <div className={`p-4 rounded-lg ${
          event.color === 'green' ? 'bg-green-50' :
          event.color === 'red' ? 'bg-red-50' :
          event.color === 'orange' ? 'bg-orange-50' :
          'bg-blue-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`${
                event.color === 'green' ? 'text-green-600' :
                event.color === 'red' ? 'text-red-600' :
                event.color === 'orange' ? 'text-orange-600' :
                'text-blue-600'
              }`}>{event.icon}</span>
              <span className="font-medium text-gray-800">{event.title}</span>
              <span className="text-xs text-gray-400 px-2 py-0.5 bg-white rounded">
                {event.type === 'license' ? '证照' :
                 event.type === 'inspection' ? '检查' :
                 event.type === 'review' ? '评价' :
                 event.type === 'rectification' ? '整改' : '经营'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{event.date}</span>
              <button
                onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                className="p-1 hover:bg-white rounded transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600">{event.description}</p>
          
          {isExpanded && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              {event.type === 'license' && data && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">证照类型</span>
                    <span className="text-sm font-medium text-gray-800">{data.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">证照编号</span>
                    <span className="text-sm font-medium text-gray-800">{data.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">发证日期</span>
                    <span className="text-sm font-medium text-gray-800">{data.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">到期日期</span>
                    <span className="text-sm font-medium text-gray-800">{data.expireDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">状态</span>
                    {getLicenseStatusBadge(data.status)}
                  </div>
                </div>
              )}
              
              {event.type === 'inspection' && data && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">检查类型</span>
                    <span className="text-sm font-medium text-gray-800">
                      {data.type === 'food' ? '食品安全检查' : data.type === 'fire' ? '消防安全检查' : '日常巡检'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">检查日期</span>
                    <span className="text-sm font-medium text-gray-800">{data.inspectionDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">检查人员</span>
                    <span className="text-sm font-medium text-gray-800">{data.inspector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">检查结果</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      data.result === 'pass' ? 'bg-green-100 text-green-700' :
                      data.result === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {data.result === 'pass' ? '合格' : data.result === 'partial' ? '部分合格' : '不合格'}
                    </span>
                  </div>
                  {data.issues && data.issues.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500 mb-1 block">发现问题</span>
                      <ul className="text-sm text-gray-800 list-disc list-inside">
                        {data.issues.map((issue: string, idx: number) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {event.type === 'review' && data && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">类型</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      data.type === 'complaint' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {data.type === 'complaint' ? '投诉' : '评价'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">评价人</span>
                    <span className="text-sm font-medium text-gray-800">{data.reviewer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">评分</span>
                    {renderStars(data.rating)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">日期</span>
                    <span className="text-sm font-medium text-gray-800">{data.reviewDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">状态</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      data.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      data.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {data.status === 'pending' ? '待处理' : data.status === 'processed' ? '处理中' : '已解决'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 mb-1 block">内容</span>
                    <p className="text-sm text-gray-800">{data.content}</p>
                  </div>
                  {data.reply && (
                    <div>
                      <span className="text-sm text-gray-500 mb-1 block">回复</span>
                      <p className="text-sm text-blue-600">{data.reply}</p>
                    </div>
                  )}
                  {data.rectificationId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">关联整改</span>
                      <span className="text-xs text-purple-600">已转整改任务</span>
                    </div>
                  )}
                </div>
              )}
              
              {event.type === 'rectification' && data && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">任务标题</span>
                    <span className="text-sm font-medium text-gray-800">{data.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">创建日期</span>
                    <span className="text-sm font-medium text-gray-800">{data.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">截止日期</span>
                    <span className="text-sm font-medium text-gray-800">{data.deadline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">状态</span>
                    {getRectificationStatusBadge(data.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">来源</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      data.sourceType === 'inspection' ? 'bg-orange-100 text-orange-700' :
                      data.sourceType === 'complaint' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {data.sourceType === 'inspection' ? '检查发现' : data.sourceType === 'complaint' ? '投诉转化' : '手动创建'}
                    </span>
                  </div>
                  {data.assignee && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">负责人</span>
                      <span className="text-sm font-medium text-gray-800">{data.assignee}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-500 mb-1 block">问题描述</span>
                    <p className="text-sm text-gray-800">{data.description}</p>
                  </div>
                  {data.rectificationNote && (
                    <div>
                      <span className="text-sm text-gray-500 mb-1 block">整改说明</span>
                      <p className="text-sm text-green-600">{data.rectificationNote}</p>
                    </div>
                  )}
                  {data.attachmentUrls && data.attachmentUrls.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500 mb-1 block">附件</span>
                      <div className="flex flex-wrap gap-2">
                        {data.attachmentUrls.map((url: string, idx: number) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            {url}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.rejectionReason && (
                    <div>
                      <span className="text-sm text-gray-500 mb-1 block">驳回原因</span>
                      <p className="text-sm text-red-600">{data.rejectionReason}</p>
                    </div>
                  )}
                  {data.remark && (
                    <div>
                      <span className="text-sm text-gray-500 mb-1 block">备注</span>
                      <p className="text-sm text-gray-800">{data.remark}</p>
                    </div>
                  )}
                </div>
              )}
              
              {event.type === 'business' && data && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">月份</span>
                    <span className="text-sm font-medium text-gray-800">{data.month}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">营业额</span>
                    <span className="text-sm font-medium text-gray-800">¥{data.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">客流量</span>
                    <span className="text-sm font-medium text-gray-800">{data.customerCount.toLocaleString()}人</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">租金缴纳</span>
                    <span className="text-sm font-medium text-gray-800">¥{data.rentPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">租金状态</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      data.rentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                      data.rentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {data.rentStatus === 'paid' ? '已缴纳' : data.rentStatus === 'partial' ? '部分缴纳' : '未缴纳'}
                    </span>
                  </div>
                  {data.notes && (
                    <div>
                      <span className="text-sm text-gray-500 mb-1 block">备注</span>
                      <p className="text-sm text-gray-800">{data.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {data?.attachmentUrls && data.attachmentUrls.length > 0 && !isExpanded && (
            <div className="mt-2 flex items-center gap-2">
              <Paperclip className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{data.attachmentUrls.length}个附件</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const avgRating = merchantReviews.length > 0
    ? (merchantReviews.reduce((sum, r) => sum + r.rating, 0) / merchantReviews.length).toFixed(1)
    : '暂无';

  const filterOptions: Array<{ value: TimelineFilter; label: string; icon: React.ReactNode }> = [
    { value: 'all', label: '全部', icon: <Filter className="w-4 h-4" /> },
    { value: 'license', label: '证照', icon: <FileCheck className="w-4 h-4" /> },
    { value: 'inspection', label: '检查', icon: <Activity className="w-4 h-4" /> },
    { value: 'review', label: '评价', icon: <Star className="w-4 h-4" /> },
    { value: 'rectification', label: '整改', icon: <AlertTriangle className="w-4 h-4" /> },
    { value: 'business', label: '经营', icon: <DollarSign className="w-4 h-4" /> },
  ];

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
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
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

      {risks.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            风险提示 ({risks.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {risks.map((risk, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                risk.level === 'high' ? 'bg-red-50 border-red-200' :
                risk.level === 'medium' ? 'bg-orange-50 border-orange-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className={`w-4 h-4 ${
                    risk.level === 'high' ? 'text-red-600' :
                    risk.level === 'medium' ? 'text-orange-600' :
                    'text-blue-600'
                  }`} />
                  <span className={`font-medium ${
                    risk.level === 'high' ? 'text-red-700' :
                    risk.level === 'medium' ? 'text-orange-700' :
                    'text-blue-700'
                  }`}>{risk.title}</span>
                </div>
                <p className={`text-sm ${
                  risk.level === 'high' ? 'text-red-600' :
                  risk.level === 'medium' ? 'text-orange-600' :
                  'text-blue-600'
                }`}>{risk.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingTasks.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            待办事项 ({pendingTasks.length})
          </h2>
          <div className="space-y-3">
            {pendingTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    task.type === 'license' ? 'bg-orange-100' :
                    task.type === 'rectification' ? 'bg-red-100' :
                    'bg-yellow-100'
                  }`}>
                    {task.type === 'license' ? <FileCheck className="w-4 h-4 text-orange-600" /> :
                     task.type === 'rectification' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                     <AlertCircle className="w-4 h-4 text-yellow-600" />}
                  </div>
                  <span className="font-medium text-gray-800">{task.title}</span>
                </div>
                {task.deadline && (
                  <span className="text-sm text-gray-500">截止: {task.deadline}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {businessTrend && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            经营变化趋势
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">最新营业额</p>
              <p className="text-xl font-bold text-gray-800">¥{businessTrend.latestRevenue.toLocaleString()}</p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                businessTrend.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {businessTrend.revenueChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{businessTrend.revenueChange >= 0 ? '+' : ''}{businessTrend.revenueChange}%</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">最新客流量</p>
              <p className="text-xl font-bold text-gray-800">{businessTrend.latestCustomers.toLocaleString()}人</p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                businessTrend.customerChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {businessTrend.customerChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{businessTrend.customerChange >= 0 ? '+' : ''}{businessTrend.customerChange}%</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">平均评分</p>
              <p className="text-xl font-bold text-gray-800">{avgRating}</p>
              <div className="flex items-center gap-1 mt-2">
                {avgRating !== '暂无' && renderStars(avgRating)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">租金状态</p>
              <div className="mt-2">{getRentStatusBadge(merchant.rentStatus)}</div>
              <p className="text-sm text-gray-500 mt-2">¥{merchant.rentAmount.toLocaleString()}/月</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                经营画像时间线 ({filteredTimelineEvents.length})
              </h2>
              <div className="flex items-center gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimelineFilter(option.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      timelineFilter === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {filteredTimelineEvents.length > 0 ? (
              <div className="relative max-h-96 overflow-y-auto">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-4">
                  {filteredTimelineEvents.map((event) => renderEventDetail(event))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">暂无{timelineFilter !== 'all' ? filterOptions.find(f => f.value === timelineFilter)?.label : ''}记录</p>
            )}
          </div>

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
                <p className="text-sm text-gray-500">商户类别</p>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">{merchant.category}</span>
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
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              证照信息 ({merchantLicenses.length})
            </h2>
            {merchantLicenses.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {merchantLicenses.map((license) => (
                  <div key={license.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{license.type}</p>
                      <p className="text-sm text-gray-500">编号: {license.number}</p>
                      <p className="text-xs text-gray-400">到期: {license.expireDate}</p>
                    </div>
                    {getLicenseStatusBadge(license.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4">暂无证照信息</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              价格备案 ({merchantPrices.length})
            </h2>
            {merchantPrices.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {merchantPrices.map((price) => (
                  <div key={price.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-800">{price.productName}</span>
                    <span className="text-sm font-medium text-gray-800">¥{price.currentPrice}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4">暂无价格备案</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              整改任务 ({merchantRectifications.length})
            </h2>
            {merchantRectifications.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {merchantRectifications.map((rect) => (
                  <div key={rect.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800 truncate max-w-[120px]">{rect.title}</span>
                      {getRectificationStatusBadge(rect.status)}
                    </div>
                    <p className="text-xs text-gray-500">截止: {rect.deadline}</p>
                    {rect.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1 truncate">驳回: {rect.rejectionReason}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4">暂无整改任务</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              经营数据 ({merchantBusinessData.length}月)
            </h2>
            {merchantBusinessData.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {merchantBusinessData.slice().sort((a, b) => b.month.localeCompare(a.month)).slice(0, 6).map((data) => (
                  <div key={data.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{data.month}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">¥{data.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{data.customerCount.toLocaleString()}人</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4">暂无经营数据</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDetail;