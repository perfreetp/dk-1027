import React from 'react';
import {
  LayoutDashboard,
  Building2,
  FileCheck,
  Tag,
  ClipboardCheck,
  MessageSquare,
  CheckCircle,
  BarChart3,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const menuItems = [
  { id: 'dashboard', label: '经营总览', icon: LayoutDashboard, path: '/' },
  { id: 'merchants', label: '商户档案', icon: Building2, path: '/merchants' },
  { id: 'licenses', label: '证照管理', icon: FileCheck, path: '/licenses' },
  { id: 'prices', label: '价格公示', icon: Tag, path: '/prices' },
  { id: 'inspections', label: '服务检查', icon: ClipboardCheck, path: '/inspections' },
  { id: 'reviews', label: '游客评价', icon: MessageSquare, path: '/reviews' },
  { id: 'rectifications', label: '整改跟踪', icon: CheckCircle, path: '/rectifications' },
  { id: 'reports', label: '数据报表', icon: BarChart3, path: '/reports' },
  { id: 'risk-comparison', label: '风险对比', icon: AlertTriangle, path: '/risk-comparison' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col transition-all duration-300`}
    >
      <div className="p-4 border-b border-blue-600">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">西湖监管</h1>
              <p className="text-xs text-blue-200">商户管理平台</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-blue-600">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;