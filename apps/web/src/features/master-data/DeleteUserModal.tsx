import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useDeleteUser } from '../../hooks/useMasterData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function DeleteUserModal({ isOpen, onClose, user }: Props) {
  const [error, setError] = useState('');
  const deleteMutation = useDeleteUser();

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    try {
      setError('');
      await deleteMutation.mutateAsync(user.id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} /> Xác nhận xóa
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Bạn có chắc chắn muốn xóa nhân viên <strong className="text-gray-900 dark:text-white">{user.fullName}</strong> ({user.employeeCode}) không?
          </p>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/50 mb-4">
              {error}
            </div>
          )}

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm rounded-lg border border-amber-200 dark:border-amber-900/50">
            <strong>Lưu ý:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Nhân viên không thể bị xóa nếu vẫn còn đang giữ thiết bị (cần thu hồi trước).</li>
              <li>Tài khoản đăng nhập của nhân viên sẽ bị vô hiệu hóa hoàn toàn.</li>
              <li>Lịch sử bàn giao liên quan đến nhân viên này vẫn được giữ lại trên hệ thống.</li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {deleteMutation.isPending ? 'Đang xử lý...' : 'Xóa nhân viên'}
          </button>
        </div>
      </div>
    </div>
  );
}
