import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Plus, Search, Filter, ChevronRight, Activity, Calendar } from 'lucide-react';
import { apiClient as api } from '../../lib/api-client';
import { RiskAssessment } from '../../types';

export function RiskListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: res, isLoading } = useQuery({
    queryKey: ['risk-assessments', statusFilter],
    queryFn: async () => {
      const response = await api.get<{ data: RiskAssessment[] }>('/risk-assessments');
      return response.data;
    },
  });

  const assessments = res?.data || [];
  
  // Filter locally since API doesn't support query params yet
  const filteredAssessments = statusFilter 
    ? assessments.filter(a => a.status === statusFilter)
    : assessments;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">Nháp</span>;
      case 'SUBMITTED': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Chờ duyệt</span>;
      case 'APPROVED': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Đã duyệt</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Từ chối</span>;
      case 'CLOSED': return <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-medium">Đã đóng</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-red-500" /> Đánh giá Rủi ro
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Quản lý các đợt đánh giá rủi ro hệ thống và mức độ an toàn thông tin
          </p>
        </div>
        <button
          onClick={() => alert("Tính năng tạo đợt đánh giá chưa khả dụng")}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Đợt đánh giá mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{assessments.length}</div>
            <div className="text-sm text-gray-500">Tổng đợt đánh giá</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {assessments.filter(a => a.status === 'SUBMITTED').length}
            </div>
            <div className="text-sm text-gray-500">Chờ phê duyệt</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {assessments.filter(a => a.status === 'APPROVED' && (!a.targetDate || new Date(a.targetDate) >= new Date())).length}
            </div>
            <div className="text-sm text-gray-500">Đang thực thi</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-slate-800/20">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo mã, tiêu đề..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Filter size={16} /> Trạng thái:
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Tất cả</option>
              <option value="DRAFT">Nháp</option>
              <option value="SUBMITTED">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="CLOSED">Đã đóng</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="p-4 font-medium">Phiên đánh giá</th>
                <th className="p-4 font-medium">Phạm vi</th>
                <th className="p-4 font-medium">Bắt đầu</th>
                <th className="p-4 font-medium">Mục tiêu</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Không có đợt đánh giá nào.</td>
                </tr>
              ) : (
                filteredAssessments.map((a) => (
                  <tr 
                    key={a.id} 
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/risks/${a.id}`)}
                  >
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {a.title}
                      <div className="text-xs text-gray-500 font-normal mt-0.5">{a.assessmentNo}</div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {a.scope}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {new Date(a.startDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {a.targetDate ? new Date(a.targetDate).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(a.status)}
                    </td>
                    <td className="p-4 text-gray-400">
                      <ChevronRight size={18} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
