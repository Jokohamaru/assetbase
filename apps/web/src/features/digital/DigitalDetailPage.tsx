import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Key, Plus, FileText, User, RefreshCw, Calendar, Link } from 'lucide-react';
import { apiClient as api } from '../../lib/api-client';
import { DigitalEntitlement } from '../../types';

export function DigitalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'assignments' | 'renewals'>('info');

  const { data: entitlementRes, isLoading } = useQuery({
    queryKey: ['entitlement', id],
    queryFn: async () => {
      const response = await api.get<{ data: DigitalEntitlement }>(`/entitlements/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const entitlement = entitlementRes?.data;

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Đang tải thông tin chi tiết...</div>;
  }

  if (!entitlement) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy tài sản số.</div>;
  }

  const getStatusBadge = () => {
    if (!entitlement.expiryDate) {
      return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Vĩnh viễn</span>;
    }
    const expiry = new Date(entitlement.expiryDate);
    const now = new Date();
    const daysLeft = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Đã hết hạn</span>;
    if (daysLeft <= 30) return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">Sắp hết hạn</span>;
    return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Đang hoạt động</span>;
  };

  const getAssignedQuantity = () => {
    if (!entitlement.assignments) return 0;
    return entitlement.assignments
      .filter(a => a.status === 'ACTIVE')
      .reduce((sum, a) => sum + a.quantity, 0);
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/entitlements')}
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Key size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{entitlement.name}</h1>
              {getStatusBadge()}
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">{entitlement.code}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors text-sm">
            Chỉnh sửa
          </button>
          <button className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors text-sm flex items-center gap-2">
            <RefreshCw size={16} /> Gia hạn
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700 overflow-x-auto pb-[1px]">
        {[
          { id: 'info', icon: <FileText size={16} />, label: 'Thông tin chung' },
          { id: 'assignments', icon: <User size={16} />, label: 'Cấp phát' },
          { id: 'renewals', icon: <RefreshCw size={16} />, label: 'Lịch sử gia hạn' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Chi tiết tài sản số</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Phân loại</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{entitlement.type}</div>
                </div>
                {entitlement.productName && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Tên sản phẩm</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{entitlement.productName} {entitlement.edition}</div>
                  </div>
                )}
                {entitlement.domainName && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Tên miền</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{entitlement.domainName}</div>
                  </div>
                )}
                {entitlement.issuer && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Nhà phát hành (Issuer/Registrar)</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{entitlement.issuer || entitlement.registrar}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500 mb-1">Metric cấp phép</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{entitlement.licenseMetric || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">URL Quản lý</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {entitlement.managementUrl ? (
                      <a href={entitlement.managementUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                        Link <Link size={14} />
                      </a>
                    ) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thông tin mua & Gia hạn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Ngày mua / Bắt đầu</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {entitlement.startDate ? new Date(entitlement.startDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Ngày hết hạn</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {entitlement.expiryDate ? new Date(entitlement.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Chi phí mua mới</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {entitlement.purchaseCost ? `${Number(entitlement.purchaseCost).toLocaleString('vi-VN')} ${entitlement.currency}` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Chi phí gia hạn (dự kiến)</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {entitlement.renewalCost ? `${Number(entitlement.renewalCost).toLocaleString('vi-VN')} ${entitlement.currency}` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Số hợp đồng (PO)</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{entitlement.contractNo || entitlement.purchaseOrderNo || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Tự động gia hạn</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {entitlement.autoRenew ? `Có (mỗi ${entitlement.renewalPeriodMonths} tháng)` : 'Không'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sử dụng</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Tổng số lượng</span>
                  <span className="font-medium">{entitlement.totalQuantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Đã cấp phát</span>
                  <span className="font-medium text-indigo-600">{getAssignedQuantity()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Còn trống</span>
                  <span className="font-medium text-green-600">{entitlement.totalQuantity - getAssignedQuantity()}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 dark:bg-slate-700">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (getAssignedQuantity() / entitlement.totalQuantity) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {entitlement.notes && (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Ghi chú</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{entitlement.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Lịch sử cấp phát</h3>
            <button className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition-colors">
              <Plus size={16} /> Cấp phát mới
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="p-4 font-medium">Đối tượng nhận</th>
                  <th className="p-4 font-medium">Số lượng</th>
                  <th className="p-4 font-medium">Ngày cấp</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium">Ghi chú</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {!entitlement.assignments || entitlement.assignments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">Chưa có dữ liệu cấp phát.</td>
                  </tr>
                ) : (
                  entitlement.assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-medium text-gray-900 dark:text-white">
                        {assignment.personId ? 'Nhân sự' : assignment.assetId ? 'Tài sản IT' : assignment.departmentId ? 'Phòng ban' : 'Khác'}
                        <div className="text-xs text-gray-500 font-normal mt-0.5">
                          ID: {assignment.personId || assignment.assetId || assignment.departmentId || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">{assignment.quantity}</td>
                      <td className="p-4 text-gray-600">{new Date(assignment.assignedAt).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4">
                        {assignment.status === 'ACTIVE' 
                          ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Đang sử dụng</span>
                          : <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">Đã thu hồi</span>
                        }
                      </td>
                      <td className="p-4 text-gray-600 truncate max-w-[200px]">{assignment.assignmentNote || '-'}</td>
                      <td className="p-4 text-right">
                        {assignment.status === 'ACTIVE' && (
                          <button className="text-red-600 hover:text-red-800 text-sm font-medium">Thu hồi</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'renewals' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Lịch sử gia hạn</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="p-4 font-medium">Ngày thực hiện</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium">Hạn cũ</th>
                  <th className="p-4 font-medium text-green-600">Hạn mới</th>
                  <th className="p-4 font-medium">Chi phí thực tế</th>
                  <th className="p-4 font-medium">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {!entitlement.renewals || entitlement.renewals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">Chưa có dữ liệu gia hạn.</td>
                  </tr>
                ) : (
                  entitlement.renewals.map((renewal) => (
                    <tr key={renewal.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-medium text-gray-900 dark:text-white">{new Date(renewal.renewalDate).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4">
                        {renewal.status === 'COMPLETED' 
                          ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Hoàn thành</span>
                          : <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Đang xử lý</span>
                        }
                      </td>
                      <td className="p-4 text-gray-600">{new Date(renewal.previousExpiryDate).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 text-green-600 font-medium">{new Date(renewal.newExpiryDate).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 text-gray-600">
                        {renewal.amount ? `${Number(renewal.amount).toLocaleString('vi-VN')} ${renewal.currency}` : '-'}
                      </td>
                      <td className="p-4 text-gray-600 truncate max-w-[200px]">{renewal.notes || renewal.purchaseOrderNo || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
