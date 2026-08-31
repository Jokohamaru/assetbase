import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Plus, ChevronRight, Activity, Calendar } from 'lucide-react';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Đánh giá Rủi ro</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các đợt đánh giá rủi ro hệ thống và mức độ an toàn thông tin
          </p>
        </div>
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

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách đợt đánh giá
            </h2>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="DRAFT">Nháp</option>
                <option value="SUBMITTED">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="CLOSED">Đã đóng</option>
              </select>
              <button
                onClick={() => alert("Tính năng tạo đợt đánh giá chưa khả dụng")}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus size={16} /> Thêm mới
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-medium">Phiên đánh giá</th>
                  <th className="px-6 py-3 font-medium">Phạm vi</th>
                  <th className="px-6 py-3 font-medium">Bắt đầu</th>
                  <th className="px-6 py-3 font-medium">Mục tiêu</th>
                  <th className="px-6 py-3 font-medium">Trạng thái</th>
                  <th className="px-6 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-indigo-600 animate-pulse"></div>
                        <div className="w-4 h-4 rounded-full bg-indigo-600 animate-pulse delay-75"></div>
                        <div className="w-4 h-4 rounded-full bg-indigo-600 animate-pulse delay-150"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredAssessments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Không có đợt đánh giá nào.
                    </td>
                  </tr>
                ) : (
                  filteredAssessments.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/risks/${a.id}`)}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {a.title}
                        <div className="text-xs text-gray-500 font-normal mt-0.5">{a.assessmentNo}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {a.scope}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(a.startDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {a.targetDate ? new Date(a.targetDate).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(a.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
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
    </div>
  );
}
