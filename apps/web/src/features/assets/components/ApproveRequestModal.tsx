import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { useApproveAssetRequest } from '../../../hooks/useAssetRequests';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
}

export function ApproveRequestModal({ isOpen, onClose, requestId }: Props) {
  const mutation = useApproveAssetRequest();

  if (!isOpen || !requestId) return null;

  const handleApprove = () => {
    mutation.mutate(requestId, {
      onSuccess: () => onClose(),
      onError: (err: any) => alert(err.response?.data?.error || 'Có lỗi xảy ra')
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Duyệt Yêu Cầu</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500"><X size={20}/></button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600">Bạn có chắc chắn muốn duyệt yêu cầu này? Sau khi duyệt, bạn có thể tiến hành cấp phát thiết bị.</p>
        </div>
        <div className="flex justify-end p-4 border-t gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100">Hủy</button>
          <button 
            onClick={handleApprove} 
            disabled={mutation.isPending}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Xác nhận Duyệt
          </button>
        </div>
      </div>
    </div>
  );
}
