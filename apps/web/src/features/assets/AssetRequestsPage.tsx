import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Eye, Package, Clock } from 'lucide-react';
import { useAdminAssetRequests, type AssetRequest } from '../../hooks/useAssetRequests';
import { ApproveRequestModal } from './components/ApproveRequestModal';
import { RejectRequestModal } from './components/RejectRequestModal';
import { FulfillRequestModal } from './components/FulfillRequestModal';
import { AssetRequestDetailModal } from '../user-portal/components/AssetRequestDetailModal';

const STATUS_TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ duyệt' },
  { id: 'APPROVED', label: 'Đã duyệt (Chờ cấp)' },
  { id: 'FULFILLED', label: 'Đã cấp' },
  { id: 'REJECTED', label: 'Từ chối' },
  { id: 'CANCELLED', label: 'Đã hủy' }
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function AssetRequestsPage() {
  const [activeTab, setActiveTab] = useState('PENDING');
  
  // Modals state
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [fulfillRequest, setFulfillRequest] = useState<AssetRequest | null>(null);
  const [detailRequest, setDetailRequest] = useState<AssetRequest | null>(null);

  const statusParam = activeTab === 'ALL' ? undefined : activeTab;
  const { data, isLoading } = useAdminAssetRequests(statusParam, 1, 100);

  const requests = data?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Chờ duyệt</span>;
      case 'APPROVED': return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Đã duyệt</span>;
      case 'REJECTED': return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Từ chối</span>;
      case 'FULFILLED': return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Đã cấp phát</span>;
      case 'CANCELLED': return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Đã hủy</span>;
      default: return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yêu cầu cấp phát</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý và xét duyệt các yêu cầu cấp phát thiết bị từ nhân viên</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px px-6 space-x-6 overflow-x-auto">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có yêu cầu nào</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã YC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người yêu cầu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại thiết bị</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.requestNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.requestedByName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.assetCategory}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(req.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => setDetailRequest(req)} className="text-blue-600 hover:text-blue-900 mx-2" title="Chi tiết"><Eye className="w-5 h-5" /></button>
                        
                        {req.status === 'PENDING' && (
                          <>
                            <button onClick={() => setApproveId(req.id)} className="text-green-600 hover:text-green-900 mx-2" title="Duyệt"><CheckCircle className="w-5 h-5" /></button>
                            <button onClick={() => setRejectId(req.id)} className="text-red-600 hover:text-red-900 mx-2" title="Từ chối"><XCircle className="w-5 h-5" /></button>
                          </>
                        )}

                        {req.status === 'APPROVED' && (
                          <button onClick={() => setFulfillRequest(req)} className="text-indigo-600 hover:text-indigo-900 mx-2" title="Cấp phát thiết bị"><Package className="w-5 h-5" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ApproveRequestModal isOpen={!!approveId} onClose={() => setApproveId(null)} requestId={approveId} />
      <RejectRequestModal isOpen={!!rejectId} onClose={() => setRejectId(null)} requestId={rejectId} />
      <FulfillRequestModal isOpen={!!fulfillRequest} onClose={() => setFulfillRequest(null)} request={fulfillRequest} />
      <AssetRequestDetailModal isOpen={!!detailRequest} onClose={() => setDetailRequest(null)} request={detailRequest} />
    </div>
  );
}
