import React, { useState } from 'react';
import { X, AlertTriangle, ArrowRight } from 'lucide-react';
import { useDeleteCategory, useCategories } from '../../hooks/useMasterData';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: any;
}

export function DeleteCategoryModal({ isOpen, onClose, category }: DeleteCategoryModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);
  const [replacementCategoryId, setReplacementCategoryId] = useState('');

  const deleteCategory = useDeleteCategory();
  const { data: categories = [] } = useCategories();

  if (!isOpen || !category) return null;

  const handleClose = () => {
    setError(null);
    setIsConflict(false);
    setReplacementCategoryId('');
    onClose();
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteCategory.mutateAsync({
        id: category.id,
        replacementCategoryId: isConflict ? replacementCategoryId : undefined,
      });
      handleClose();
    } catch (err: any) {
      if (err.response?.data?.error?.message === 'CATEGORY_IN_USE') {
        setIsConflict(true);
      } else {
        setError(err.response?.data?.error?.message || 'Có lỗi xảy ra khi xóa nhóm tài sản.');
      }
    }
  };

  const availableReplacements = categories.filter((c: any) => c.id !== category.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors">
            {isConflict ? 'Xử lý dữ liệu liên kết' : 'Xác nhận xóa'}
          </h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {!isConflict ? (
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-red-100 text-red-600 rounded-full shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  Bạn có chắc chắn muốn xóa nhóm tài sản <span className="font-bold text-gray-900 dark:text-white">"{category.name}"</span>?
                </p>
                <p className="text-sm text-gray-500 mt-1">Hành động này không thể hoàn tác.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-full shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Nhóm tài sản này đang có thiết bị sử dụng!
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Vui lòng chọn một nhóm tài sản khác để chuyển các thiết bị sang trước khi xóa.</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
                <div className="flex-1 font-medium text-gray-700 dark:text-gray-300">{category.name}</div>
                <ArrowRight size={20} className="text-gray-400 shrink-0" />
                <select
                  value={replacementCategoryId}
                  onChange={(e) => setReplacementCategoryId(e.target.value)}
                  className="flex-1 block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm appearance-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                >
                  <option value="">-- Chọn nhóm thay thế --</option>
                  {availableReplacements.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800 transition-colors">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteCategory.isPending || (isConflict && !replacementCategoryId)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
          >
            {deleteCategory.isPending ? 'Đang xử lý...' : (isConflict ? 'Chuyển và Xóa' : 'Xóa')}
          </button>
        </div>
      </div>
    </div>
  );
}
