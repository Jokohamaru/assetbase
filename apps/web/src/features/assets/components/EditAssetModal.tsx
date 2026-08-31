import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Image as ImageIcon, PenTool, Zap, CheckCircle, RefreshCcw } from 'lucide-react';
import { useUpdateAsset, useUploadFile } from '../../../hooks/useAssets';
import { useCategories, useDepartments, useLocations, useAssetStatuses } from '../../../hooks/useMasterData';
import { Asset } from '../../../types';

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onAssign?: (asset: Asset) => void;
  onReturn?: (asset: Asset) => void;
}

const API_ROOT = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8080';

export function EditAssetModal({ isOpen, onClose, asset, onAssign, onReturn }: EditAssetModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'actions'>('info');
  
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

  const updateAsset = useUpdateAsset();
  const uploadFile = useUploadFile();

  useEffect(() => {
    if (asset && isOpen) {
      setFormData({
        name: asset.name || '',
        assetTag: asset.assetTag || '',
        serialNumber: asset.serialNumber || '',
        categoryId: asset.categoryId || '',
        departmentId: asset.departmentId || '',
        locationId: asset.locationId || '',
        statusId: asset.statusId || '',
        purchaseCost: asset.purchaseCost ? asset.purchaseCost.toString() : '',
      });
      if (asset.imageUrl) {
        setImagePreview(asset.imageUrl.startsWith('http') ? asset.imageUrl : `${API_ROOT}${asset.imageUrl}`);
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
      setActiveTab('info');
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) return setError('Tên tài sản là bắt buộc');
    if (!formData.categoryId) return setError('Vui lòng chọn nhóm tài sản');
    if (!formData.statusId) return setError('Vui lòng chọn trạng thái');

    try {
      let imageUrl: string | undefined = asset.imageUrl;
      
      if (imageFile) {
        const uploadResult = await uploadFile.mutateAsync(imageFile);
        if (uploadResult && uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      }

      await updateAsset.mutateAsync({
        id: asset.id,
        data: {
          name: formData.name.trim(),
          barcode: formData.assetTag.trim(), // Assuming barcode/assetTag mapping
          serialNumber: formData.serialNumber.trim() || undefined,
          categoryId: formData.categoryId,
          departmentId: formData.departmentId || undefined,
          locationId: formData.locationId || undefined,
          statusId: formData.statusId,
          purchaseCost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : undefined,
          imageUrl: imageUrl,
        }
      });
      
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tài sản');
    }
  };

  const currentStatus = statuses.find((s: any) => s.id === formData.statusId);
  const isReady = currentStatus?.code === 'READY';
  const isInUse = currentStatus?.code === 'IN_USE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <PenTool size={20} className="text-indigo-600 dark:text-indigo-400" />
            Chỉnh sửa tài sản
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'info' 
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2"><PenTool size={16} /> Thông tin chung</span>
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'actions' 
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2"><Zap size={16} /> Thao tác nhanh</span>
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

          {activeTab === 'info' ? (
            <form id="edit-asset-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã tài sản</label>
                    <input 
                      type="text" 
                      value={formData.assetTag}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên tài sản <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nhóm tài sản <span className="text-rose-500">*</span></label>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái <span className="text-rose-500">*</span></label>
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

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hình ảnh</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md transition-colors relative overflow-hidden group min-h-[140px]">
                      {imagePreview ? (
                        <div className="absolute inset-0 w-full h-full">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
                              Đổi ảnh
                              <input 
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
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                          <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                            <label className="relative cursor-pointer bg-white dark:bg-gray-900 rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                              <span>Tải ảnh lên</span>
                              <input 
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
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số Serial (SN)</label>
                    <input 
                      type="text" 
                      value={formData.serialNumber}
                      onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phòng ban quản lý</label>
                    <select 
                      value={formData.departmentId}
                      onChange={e => setFormData({...formData, departmentId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">-- Tuỳ chọn --</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vị trí / Kho</label>
                    <select 
                      value={formData.locationId}
                      onChange={e => setFormData({...formData, locationId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Các thao tác khả dụng</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Assign Action */}
                <div className={`p-5 rounded-xl border ${isReady ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isReady ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Cấp phát tài sản</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Giao tài sản cho nhân viên</p>
                    </div>
                  </div>
                  <button 
                    disabled={!isReady}
                    onClick={() => { onClose(); onAssign?.(asset); }}
                    className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                      isReady 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                        : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Thực hiện Cấp phát
                  </button>
                </div>

                {/* Return Action */}
                <div className={`p-5 rounded-xl border ${isInUse ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isInUse ? 'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                      <RefreshCcw size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Thu hồi tài sản</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Thu lại tài sản từ nhân viên</p>
                    </div>
                  </div>
                  <button 
                    disabled={!isInUse}
                    onClick={() => { onClose(); onReturn?.(asset); }}
                    className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                      isInUse 
                        ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm' 
                        : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Thực hiện Thu hồi
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-500">
                  <span className="font-medium">Lưu ý:</span> Trạng thái hiện tại của tài sản là <strong>{asset.statusName || 'N/A'}</strong>. Các thao tác Cấp phát/Thu hồi phụ thuộc vào trạng thái này.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'info' && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3 transition-colors">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit"
              form="edit-asset-form"
              disabled={updateAsset.isPending || uploadFile.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {updateAsset.isPending || uploadFile.isPending ? 'Đang lưu...' : (
                <>
                  <Save size={16} /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
