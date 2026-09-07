import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCategories } from '../../../hooks/useMasterData';
import { useCreateAssetRequest } from '../../../hooks/useAssetRequests';

interface CreateAssetRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAssetRequestModal({ isOpen, onClose }: CreateAssetRequestModalProps) {
  const { data: categoriesData } = useCategories();
  const createMutation = useCreateAssetRequest();

  const [assetCategoryId, setAssetCategoryId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetCategoryId || !purpose || !description) return;

    createMutation.mutate({ assetCategoryId, purpose, description }, {
      onSuccess: () => {
        setAssetCategoryId('');
        setPurpose('');
        setDescription('');
        onClose();
      },
      onError: (err: any) => {
        alert(err.response?.data?.error || 'Có lỗi xảy ra');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Tạo Yêu Cầu Cấp Phát</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại thiết bị <span className="text-red-500">*</span></label>
            <select
              required
              value={assetCategoryId}
              onChange={e => setAssetCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn loại thiết bị --</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mục đích sử dụng <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="VD: Cấp máy cho nhân viên mới"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết <span className="text-red-500">*</span></label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Cấu hình yêu cầu, phần mềm cần thiết..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Gửi yêu cầu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
