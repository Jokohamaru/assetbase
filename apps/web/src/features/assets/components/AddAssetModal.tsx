import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useCreateAsset } from '../../../hooks/useAssets';
import { useCategories, useDepartments, useLocations, useAssetStatuses } from '../../../hooks/useMasterData';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    assetTag: '',
    barcode: '',
    serialNumber: '',
    categoryId: '',
    departmentId: '',
    locationId: '',
    statusId: '',
    purchaseCost: '',
  });

  const [error, setError] = useState<string | null>(null);

  const { data: categories = [] } = useCategories();
  const { data: departments = [] } = useDepartments();
  const { data: locations = [] } = useLocations();
  const { data: statuses = [] } = useAssetStatuses();

  const createAsset = useCreateAsset();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) return setError('Tên tài sản là bắt buộc');
    if (!formData.assetTag.trim()) return setError('Mã tài sản (Asset Tag) là bắt buộc');
    if (!formData.categoryId) return setError('Vui lòng chọn nhóm tài sản');
    if (!formData.statusId) return setError('Vui lòng chọn trạng thái');

    try {
      await createAsset.mutateAsync({
        name: formData.name.trim(),
        assetTag: formData.assetTag.trim(),
        barcode: formData.barcode.trim() || undefined,
        serialNumber: formData.serialNumber.trim() || undefined,
        categoryId: formData.categoryId,
        departmentId: formData.departmentId || undefined,
        locationId: formData.locationId || undefined,
        statusId: formData.statusId,
        purchaseCost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : undefined,
      });
      
      onClose(); // Close on success
      setFormData({
        name: '', assetTag: '', barcode: '', serialNumber: '',
        categoryId: '', departmentId: '', locationId: '', statusId: '', purchaseCost: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo tài sản');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Thêm tài sản mới</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-700">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form id="add-asset-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cột 1 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã tài sản (Asset Tag) <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.assetTag}
                    onChange={e => setFormData({...formData, assetTag: e.target.value})}
                    placeholder="VD: LPT-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Mã định danh duy nhất của tài sản</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài sản <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="VD: MacBook Pro 14 M3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm tài sản <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white"
                  >
                    <option value="">-- Chọn nhóm tài sản --</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.statusId}
                    onChange={e => setFormData({...formData, statusId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white"
                  >
                    <option value="">-- Chọn trạng thái --</option>
                    {statuses.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cột 2 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã vạch (Barcode)</label>
                  <input 
                    type="text" 
                    value={formData.barcode}
                    onChange={e => setFormData({...formData, barcode: e.target.value})}
                    placeholder="Tuỳ chọn"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số Serial (SN)</label>
                  <input 
                    type="text" 
                    value={formData.serialNumber}
                    onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                    placeholder="Tuỳ chọn"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban quản lý</label>
                  <select 
                    value={formData.departmentId}
                    onChange={e => setFormData({...formData, departmentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white"
                  >
                    <option value="">-- Tuỳ chọn --</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí / Kho</label>
                  <select 
                    value={formData.locationId}
                    onChange={e => setFormData({...formData, locationId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white"
                  >
                    <option value="">-- Tuỳ chọn --</option>
                    {locations.map((l: any) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit"
            form="add-asset-form"
            disabled={createAsset.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {createAsset.isPending ? 'Đang lưu...' : (
              <>
                <Save size={16} /> Lưu tài sản
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
