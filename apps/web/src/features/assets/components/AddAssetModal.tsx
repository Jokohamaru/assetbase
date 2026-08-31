import React, { useState } from 'react';
import { X, Save, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { useCreateAsset, useUploadFile } from '../../../hooks/useAssets';
import { useCategories, useDepartments, useLocations, useAssetStatuses } from '../../../hooks/useMasterData';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    assetTag: '',
    serialNumber: '',
    categoryId: '',
    departmentId: '',
    locationId: '',
    statusId: '',
    purchaseCost: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: categories = [] } = useCategories();
  const { data: departments = [] } = useDepartments();
  const { data: locations = [] } = useLocations();
  const { data: statuses = [] } = useAssetStatuses();

  const createAsset = useCreateAsset();
  const uploadFile = useUploadFile();

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
      let imageUrl: string | undefined = undefined;
      
      if (imageFile) {
        const uploadResult = await uploadFile.mutateAsync(imageFile);
        if (uploadResult && uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      }

      await createAsset.mutateAsync({
        name: formData.name.trim(),
        assetTag: formData.assetTag.trim(),
        serialNumber: formData.serialNumber.trim() || undefined,
        categoryId: formData.categoryId,
        departmentId: formData.departmentId || undefined,
        locationId: formData.locationId || undefined,
        statusId: formData.statusId,
        purchaseCost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : undefined,
        imageUrl: imageUrl,
      });
      
      onClose(); // Close on success
      setFormData({
        name: '', assetTag: '', serialNumber: '',
        categoryId: '', departmentId: '', locationId: '', statusId: '', purchaseCost: ''
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo tài sản');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors">Thêm tài sản mới</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-900/50 rounded-lg flex items-start gap-3 text-rose-700 dark:text-rose-400 transition-colors">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form id="add-asset-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cột 1 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Mã tài sản (Asset Tag) <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.assetTag}
                    onChange={e => setFormData({...formData, assetTag: e.target.value})}
                    placeholder="VD: LPT-001"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors">Mã định danh duy nhất của tài sản</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Tên tài sản <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="VD: MacBook Pro 14 M3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Nhóm tài sản <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                  >
                    <option value="">-- Chọn nhóm tài sản --</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Trạng thái <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.statusId}
                    onChange={e => setFormData({...formData, statusId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Hình ảnh</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md transition-colors relative overflow-hidden group min-h-[140px]">
                    {imagePreview ? (
                      <div className="absolute inset-0 w-full h-full">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                            className="text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center transition-colors">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white dark:bg-gray-900 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 transition-colors"
                          >
                            <span>Tải ảnh lên</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only" 
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setImageFile(e.target.files[0]);
                                  setImagePreview(URL.createObjectURL(e.target.files[0]));
                                }
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">PNG, JPG, GIF lên tới 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Số Serial (SN)</label>
                  <input 
                    type="text" 
                    value={formData.serialNumber}
                    onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                    placeholder="Tuỳ chọn"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Phòng ban quản lý</label>
                  <select 
                    value={formData.departmentId}
                    onChange={e => setFormData({...formData, departmentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                  >
                    <option value="">-- Tuỳ chọn --</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Vị trí / Kho</label>
                  <select 
                    value={formData.locationId}
                    onChange={e => setFormData({...formData, locationId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
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
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3 transition-colors">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit"
            form="add-asset-form"
            disabled={createAsset.isPending || uploadFile.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {createAsset.isPending || uploadFile.isPending ? 'Đang lưu...' : (
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
