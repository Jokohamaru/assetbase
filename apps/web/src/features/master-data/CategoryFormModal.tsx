import React, { useState } from 'react';
import { X, Hash, Type } from 'lucide-react';
import { useCreateCategory } from '../../hooks/useMasterData';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryFormModal({ isOpen, onClose }: CategoryFormModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
  });
  const [error, setError] = useState<string | null>(null);

  const createCategory = useCreateCategory();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createCategory.mutateAsync(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Có lỗi xảy ra khi tạo nhóm tài sản.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors">Thêm Nhóm tài sản mới</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Mã danh mục *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                placeholder="VD: LAPTOP"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Tên danh mục *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Type size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                placeholder="VD: Máy tính xách tay"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 transition-colors mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createCategory.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
            >
              {createCategory.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
