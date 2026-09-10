import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCreateManufacturer, useUpdateManufacturer, useDeleteManufacturer } from '../../hooks/useMasterData';

export function ManufacturerFormModal({ isOpen, onClose, entity }: { isOpen: boolean, onClose: () => void, entity?: any }) {
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState<string | null>(null);
  
  const createMutation = useCreateManufacturer();
  const updateMutation = useUpdateManufacturer();

  useEffect(() => {
    if (entity) setFormData({ name: entity.name });
    else setFormData({ name: '' });
  }, [entity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (entity) await updateMutation.mutateAsync({ id: entity.id, data: formData });
      else await createMutation.mutateAsync(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Lỗi');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{entity ? 'Sửa' : 'Thêm'} Nhà sản xuất</h2>
          <button onClick={onClose}><X className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Tên *</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded bg-white dark:bg-gray-800" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Hủy</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ManufacturerDeleteModal({ isOpen, onClose, entity }: { isOpen: boolean, onClose: () => void, entity: any }) {
  const [error, setError] = useState<string | null>(null);
  const deleteMutation = useDeleteManufacturer();
  if (!isOpen || !entity) return null;
  const handleDelete = async () => {
    try { await deleteMutation.mutateAsync(entity.id); onClose(); }
    catch (err: any) { setError(err.response?.data?.error?.message || err.message || 'Lỗi'); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Xóa NSX</h2>
        <p>Bạn có chắc muốn xóa <b>{entity.name}</b>?</p>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded">Hủy</button>
          <button onClick={handleDelete} disabled={deleteMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded">Xóa</button>
        </div>
      </div>
    </div>
  );
}
