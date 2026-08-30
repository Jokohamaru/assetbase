import React, { useState } from 'react';
import { 
  LayoutDashboard, Box, UserRound, AlertTriangle, Wrench, CircleDollarSign,
  CalendarDays, RotateCcw, ArrowUpRight, Plus, PackageCheck, ChevronRight
} from 'lucide-react';

export function DashboardPage() {
  const [activeView, setActiveView] = useState<'all' | 'inUse' | 'attention' | 'overdue'>('all');

  const metrics = [
    { key: 'all', label: 'Tổng tài sản', value: 1245, Icon: Box, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    { key: 'inUse', label: 'Đang sử dụng', value: 856, Icon: UserRound, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    { key: 'attention', label: 'Bảo trì / Hỏng', value: 42, Icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    { key: 'overdue', label: 'Quá hạn trả', value: 12, Icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tổng quan tài sản</h1>
          <p className="text-sm text-gray-500 mt-1">Chào mừng bạn quay lại. Đây là tình hình tài sản và các công việc cần chú ý hôm nay.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
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
                isActive ? `ring-2 ring-indigo-600 ${border} bg-white shadow-md` : 'border-gray-200 bg-white shadow-sm hover:border-gray-300'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('vi-VN')}</p>
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
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">Tài sản cần chú ý</h2>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Xem tất cả</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-medium">Mã tài sản</th>
                    <th className="px-6 py-3 font-medium">Tên tài sản</th>
                    <th className="px-6 py-3 font-medium">Trạng thái</th>
                    <th className="px-6 py-3 font-medium">Người sử dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 font-medium text-indigo-600">LPT-00{i}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">MacBook Pro 14 M3</p>
                        <p className="text-xs text-gray-500 mt-0.5">Laptop</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Bảo trì
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">Nguyễn Văn A</td>
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
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Hoạt động gần đây</h2>
            </div>
            <div className="p-0">
              <ul className="divide-y divide-gray-100">
                {[
                  { icon: Plus, title: 'Nhập kho', desc: '5 laptop mới', time: '10 phút trước', color: 'text-emerald-600 bg-emerald-100' },
                  { icon: ArrowUpRight, title: 'Cấp phát', desc: 'Màn hình Dell cho Trần B', time: '1 giờ trước', color: 'text-blue-600 bg-blue-100' },
                  { icon: RotateCcw, title: 'Thu hồi', desc: 'Chuột quang từ Lê C', time: '3 giờ trước', color: 'text-amber-600 bg-amber-100' },
                ].map((item, i) => (
                  <li key={i} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4">
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                      <item.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button className="w-full text-sm font-medium text-gray-600 hover:text-gray-900 flex justify-center items-center gap-1">
                Xem toàn bộ lịch sử <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
