import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, ChevronRight, Building2, Star, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { apiClient as api } from '../../lib/api-client';
import { Vendor } from '../../types';

export function VendorListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: res, isLoading } = useQuery({
    queryKey: ['vendors', statusFilter],
    queryFn: async () => {
      const url = statusFilter ? `/vendors?status=${statusFilter}` : '/vendors';
      const response = await api.get<{ data: Vendor[] }>(url);
      return response.data;
    },
  });

  const vendors = res?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><CheckCircle2 size={12}/> Đang hợp tác</span>;
      case 'INACTIVE': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><XCircle size={12}/> Ngừng hợp tác</span>;
      case 'WARNING': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><AlertTriangle size={12}/> Chú ý</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">{status}</span>;
    }
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={14} 
            className={star <= score ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
          />
        ))}
        <span className="ml-2 text-xs text-gray-500">{score > 0 ? `${score}/5` : 'Chưa đánh giá'}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="text-primary" /> Nhà cung cấp
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Quản lý thông tin, hợp đồng và đánh giá chất lượng đối tác
          </p>
        </div>
        <button
          onClick={() => alert("Tính năng thêm đối tác chưa khả dụng")}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Thêm đối tác
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-slate-800/20">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên, mã, email..." 
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
              <option value="ACTIVE">Đang hợp tác</option>
              <option value="WARNING">Chú ý</option>
              <option value="INACTIVE">Ngừng hợp tác</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="p-4 font-medium">Tên / Mã đối tác</th>
                <th className="p-4 font-medium">Lĩnh vực</th>
                <th className="p-4 font-medium">Liên hệ</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Đánh giá</th>
                <th className="p-4 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Không có đối tác nào.</td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr 
                    key={vendor.id} 
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/vendors/${vendor.id}`)}
                  >
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {vendor.name}
                      <div className="text-xs text-gray-500 font-normal mt-0.5">{vendor.code}</div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {vendor.category}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                      <div className="font-medium text-gray-800 dark:text-gray-200">{vendor.contact}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{vendor.email || vendor.phone || '-'}</div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(vendor.status)}
                    </td>
                    <td className="p-4">
                      {renderStars(vendor.score)}
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
