import React, { useState } from 'react';
import { 
  LayoutDashboard, Box, UserRound, AlertTriangle, Wrench, CircleDollarSign,
  CalendarDays, RotateCcw, ArrowUpRight, Plus, PackageCheck, ChevronRight
} from 'lucide-react';
import { useDashboardMetrics } from '../../hooks/useDashboard';

export function DashboardPage() {
  const [activeView, setActiveView] = useState<'all' | 'inUse' | 'attention' | 'overdue'>('all');
  
  const { data: metricsData } = useDashboardMetrics();

  const metrics = [
    { key: 'all', label: 'Tổng tài sản', value: metricsData?.totalAssets || 0, Icon: Box, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/50', border: 'border-blue-200 dark:border-blue-800' },
    { key: 'inUse', label: 'Đang sử dụng', value: metricsData?.inUseAssets || 0, Icon: UserRound, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/50', border: 'border-emerald-200 dark:border-emerald-800' },
    { key: 'attention', label: 'Bảo trì / Hỏng', value: metricsData?.attentionAssets || 0, Icon: Wrench, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/50', border: 'border-amber-200 dark:border-amber-800' },
    { key: 'overdue', label: 'Quá hạn trả', value: metricsData?.overdueAssets || 0, Icon: AlertTriangle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/50', border: 'border-rose-200 dark:border-rose-800' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Tổng quan tài sản</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Chào mừng bạn quay lại. Đây là tình hình tài sản và các công việc cần chú ý hôm nay.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <CalendarDays size={16} />
          {new Date().toLocaleDateString('vi-VN')}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ key, label, value, Icon, color, bg, border }) => {
          const isActive = activeView === key;
          return (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={`flex items-center justify-between p-5 rounded-xl border text-left transition-all ${
                isActive ? `ring-2 ring-indigo-600 dark:ring-indigo-500 ${border} bg-white dark:bg-gray-900 shadow-md` : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors">{value.toLocaleString('vi-VN')}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} ${color}`}>
                <Icon size={24} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area - Asset List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 transition-colors">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tài sản cần chú ý</h2>
              <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Xem tất cả</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 transition-colors">
                  <tr>
                    <th className="px-6 py-3 font-medium">Mã tài sản</th>
                    <th className="px-6 py-3 font-medium">Tên tài sản</th>
                    <th className="px-6 py-3 font-medium">Trạng thái</th>
                    <th className="px-6 py-3 font-medium">Người sử dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">LPT-00{i}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 transition-colors">MacBook Pro 14 M3</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 transition-colors">Laptop</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400 transition-colors">
                          Bảo trì
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 transition-colors">Nguyễn Văn A</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between transition-colors">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Hoạt động gần đây</h2>
            </div>
            <div className="p-0">
              <ul className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
                {[
                  { icon: Plus, title: 'Nhập kho', desc: '5 laptop mới', time: '10 phút trước', color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/50' },
                  { icon: ArrowUpRight, title: 'Cấp phát', desc: 'Màn hình Dell cho Trần B', time: '1 giờ trước', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50' },
                  { icon: RotateCcw, title: 'Thu hồi', desc: 'Chuột quang từ Lê C', time: '3 giờ trước', color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/50' },
                ].map((item, i) => (
                  <li key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex gap-4">
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${item.color}`}>
                      <item.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors">{item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 transition-colors">{item.desc}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 transition-colors">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 transition-colors">
              <button className="w-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex justify-center items-center gap-1">
                Xem toàn bộ lịch sử <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
