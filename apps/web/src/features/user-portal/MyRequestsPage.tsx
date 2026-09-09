import React, { useState } from 'react';
import { ClipboardList, Plus, Eye, XCircle } from 'lucide-react';
import { useMyAssetRequests, useCancelAssetRequest, type AssetRequest } from '../../hooks/useAssetRequests';
import { CreateAssetRequestModal } from './components/CreateAssetRequestModal';
import { UserIncidentDetailModal } from './components/UserIncidentDetailModal';

const STATUS_TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ duyệt' },
  { id: 'APPROVED', label: 'Đã duyệt' },
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

export function MyRequestsPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  
  const { data, isLoading } = useMyAssetRequests(1, 100); 
  const cancelMutation = useCancelAssetRequest();

  const requests = data?.data || [];
  
  const filteredRequests = requests.filter(req => {
    if (activeTab === 'ALL') return true;
    return req.status === activeTab;
  });

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

  const handleCancel = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn hủy yêu cầu này?')) {
      cancelMutation.mutate(id, {
        onError: (err: any) => alert(err.response?.data?.error || 'Có lỗi xảy ra')
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Yêu cầu cấp phát</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý các yêu cầu xin cấp phát thiết bị của bạn
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo yêu cầu mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
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
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có yêu cầu nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'ALL' ? 'Bạn chưa tạo yêu cầu cấp phát thiết bị nào.' : `Không có yêu cầu nào ở trạng thái "${STATUS_TABS.find(t => t.id === activeTab)?.label}".`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã YC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại thiết bị</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mục đích</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((req) => (
                    <tr 
                      key={req.id} 
                      onClick={() => setSelectedIncidentId(req.id)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {req.requestNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.assetCategory}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {req.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncidentId(req.id);
                          }}
                          className="text-blue-600 hover:text-blue-900 mx-2"
                          title="Xem chi tiết & Chat"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {req.status === 'PENDING' && (
                          <button
                            onClick={(e) => handleCancel(e, req.id)}
                            className="text-red-600 hover:text-red-900 mx-2"
                            title="Hủy yêu cầu"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
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

      <CreateAssetRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedIncidentId && (
        <UserIncidentDetailModal
          incidentId={selectedIncidentId}
          onClose={() => setSelectedIncidentId(null)}
        />
      )}
    </div>
  );
}
