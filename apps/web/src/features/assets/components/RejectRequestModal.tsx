import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useRejectAssetRequest } from '../../../hooks/useAssetRequests';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
}

export function RejectRequestModal({ isOpen, onClose, requestId }: Props) {
  const mutation = useRejectAssetRequest();
  const [reason, setReason] = useState('');

  if (!isOpen || !requestId) return null;

  const handleReject = () => {
    if (!reason.trim()) return;
    mutation.mutate({ id: requestId, reason }, {
      onSuccess: () => {
        setReason('');
        onClose();
      },
      onError: (err: any) => alert(err.response?.data?.error || 'Có lỗi xảy ra')
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Từ chối Yêu Cầu</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500"><X size={20}/></button>
        </div>
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối <span className="text-red-500">*</span></label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Nhập lý do..."
          />
        </div>
        <div className="flex justify-end p-4 border-t gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100">Hủy</button>
          <button 
            onClick={handleReject} 
            disabled={mutation.isPending || !reason.trim()}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
}
