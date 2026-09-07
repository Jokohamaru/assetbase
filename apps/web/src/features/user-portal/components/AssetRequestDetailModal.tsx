import React from 'react';
import { X, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { AssetRequest } from '../../../hooks/useAssetRequests';

interface AssetRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AssetRequest | null;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function AssetRequestDetailModal({ isOpen, onClose, request }: AssetRequestDetailModalProps) {
  if (!isOpen || !request) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Chờ duyệt</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" /> Đã duyệt</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Từ chối</span>;
      case 'FULFILLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Đã cấp phát</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" /> Đã hủy</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Chi Tiết Yêu Cầu: {request.requestNo}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {request.status === 'REJECTED' && request.rejectionReason && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <span className="font-bold">Lý do từ chối: </span>
                    {request.rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {request.status === 'FULFILLED' && request.fulfilledAt && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Thiết bị đã được cấp phát vào ngày {formatDate(request.fulfilledAt)}.
                    Bạn có thể xem chi tiết trong mục "Tài sản của tôi".
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Loại thiết bị</h4>
              <p className="mt-1 text-sm text-gray-900">{request.assetCategory}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Trạng thái</h4>
              <div className="mt-1">{getStatusBadge(request.status)}</div>
            </div>
            <div className="col-span-2">
              <h4 className="text-sm font-medium text-gray-500">Mục đích</h4>
              <p className="mt-1 text-sm text-gray-900">{request.purpose}</p>
            </div>
            <div className="col-span-2">
              <h4 className="text-sm font-medium text-gray-500">Mô tả chi tiết</h4>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{request.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Ngày tạo</h4>
              <p className="mt-1 text-sm text-gray-900">{formatDate(request.createdAt)}</p>
            </div>
            {request.approvedAt && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Ngày duyệt</h4>
                <p className="mt-1 text-sm text-gray-900">{formatDate(request.approvedAt)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
