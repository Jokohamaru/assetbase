import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, ChevronRight, Key, Globe, Shield, CreditCard } from 'lucide-react';
import { apiClient as api } from '../../lib/api-client';
import { DigitalEntitlement } from '../../types';

export function DigitalListPage() {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState('');

  const { data: res, isLoading } = useQuery({
    queryKey: ['entitlements', typeFilter],
    queryFn: async () => {
      const url = typeFilter ? `/entitlements?type=${typeFilter}` : '/entitlements';
      const response = await api.get<{ data: DigitalEntitlement[] }>(url);
      return response.data;
    },
  });

  const entitlements = res?.data || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SOFTWARE': return <CreditCard size={18} className="text-blue-500" />;
      case 'SSL': return <Shield size={18} className="text-green-500" />;
      case 'DOMAIN': return <Globe size={18} className="text-purple-500" />;
      default: return <Key size={18} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SOFTWARE': return 'Phần mềm';
      case 'SSL': return 'Chứng chỉ SSL';
      case 'DOMAIN': return 'Tên miền';
      default: return 'Khác';
    }
  };

  const getStatusBadge = (entitlement: DigitalEntitlement) => {
    if (!entitlement.expiryDate) {
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Vĩnh viễn</span>;
    }
    
    const expiry = new Date(entitlement.expiryDate);
    const now = new Date();
    const daysLeft = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Đã hết hạn</span>;
    }
    if (daysLeft <= 30) {
      return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">Sắp hết hạn ({daysLeft} ngày)</span>;
    }
    
    return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Đang hoạt động</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="text-primary" /> Tài sản số (Phần mềm/SSL/Domain)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Quản lý bản quyền phần mềm, chứng chỉ SSL, và tên miền
          </p>
        </div>
        <button
          onClick={() => alert("Tính năng thêm tài sản số chưa khả dụng")}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Thêm tài sản
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-slate-800/20">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên, mã, domain..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Filter size={16} /> Loại:
            </div>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Tất cả</option>
              <option value="SOFTWARE">Phần mềm</option>
              <option value="SSL">Chứng chỉ SSL</option>
              <option value="DOMAIN">Tên miền</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="p-4 font-medium">Tên / Mã</th>
                <th className="p-4 font-medium">Loại</th>
                <th className="p-4 font-medium">Định danh (Domain/Issuer)</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Số lượng</th>
                <th className="p-4 font-medium">Hạn sử dụng</th>
                <th className="p-4 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : entitlements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Không có tài sản số nào.</td>
                </tr>
              ) : (
                entitlements.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/entitlements/${item.id}`)}
                  >
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {item.name}
                      <div className="text-xs text-gray-500 font-normal mt-0.5">{item.code}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span>{getTypeLabel(item.type)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                      {item.type === 'DOMAIN' && item.domainName}
                      {item.type === 'SSL' && (item.commonName || item.domainName)}
                      {item.type === 'SOFTWARE' && item.productName}
                      <div className="text-xs text-gray-400 mt-0.5">
                        {item.issuer || item.registrar || item.subscriptionIdentifier}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(item)}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {item.totalQuantity}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : '-'}
                      {item.autoRenew && <span className="ml-2 text-xs text-indigo-500 font-medium">(Auto-renew)</span>}
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
