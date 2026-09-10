import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse, useLocations } from '../../hooks/useMasterData';

export function WarehouseFormModal({ isOpen, onClose, entity }: { isOpen: boolean, onClose: () => void, entity?: any }) {
  const [formData, setFormData] = useState({ code: '', name: '', description: '', locationId: '' });
  const [error, setError] = useState<string | null>(null);
  
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();
  const { data: locations = [] } = useLocations();

  useEffect(() => {
    if (entity) setFormData({ code: entity.code, name: entity.name, description: entity.description || '', locationId: entity.locationId || '' });
    else setFormData({ code: '', name: '', description: '', locationId: '' });
  }, [entity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const dataToSend = { ...formData, locationId: formData.locationId || undefined };
    try {
      if (entity) await updateMutation.mutateAsync({ id: entity.id, data: dataToSend });
      else await createMutation.mutateAsync(dataToSend);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Lỗi');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{entity ? 'Sửa' : 'Thêm'} Kho</h2>
          <button onClick={onClose}><X className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Mã *</label>
            <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full border p-2 rounded bg-white dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tên *</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded bg-white dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vị trí</label>
            <select value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})} className="w-full border p-2 rounded bg-white dark:bg-gray-800">
              <option value="">-- Chọn vị trí --</option>
              {locations.map((l:any) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded bg-white dark:bg-gray-800" />
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

export function WarehouseDeleteModal({ isOpen, onClose, entity }: { isOpen: boolean, onClose: () => void, entity: any }) {
  const [error, setError] = useState<string | null>(null);
  const deleteMutation = useDeleteWarehouse();
  if (!isOpen || !entity) return null;
  const handleDelete = async () => {
    try { await deleteMutation.mutateAsync(entity.id); onClose(); }
    catch (err: any) { setError(err.response?.data?.error?.message || err.message || 'Lỗi'); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Xóa Kho</h2>
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
