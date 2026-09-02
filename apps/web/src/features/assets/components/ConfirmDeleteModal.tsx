import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Asset } from '../../../types';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  asset: Asset | null;
  isDeleting: boolean;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, asset, isDeleting }: ConfirmDeleteModalProps) {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 mx-auto">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          
          <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Xóa thiết bị
          </h3>
          
          <div className="text-center text-gray-500 dark:text-gray-400 mb-6">
            <p>Bạn có chắc chắn muốn xóa thiết bị <strong>{asset.name}</strong> ({asset.assetTag}) không?</p>
            <p className="mt-2 text-sm text-red-500">Hành động này không thể hoàn tác, thiết bị sẽ bị ẩn khỏi danh sách hiện tại nhưng lịch sử hoạt động vẫn sẽ được lưu trữ.</p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa thiết bị'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
