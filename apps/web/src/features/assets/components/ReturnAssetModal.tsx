import React, { useState } from 'react';
import { X, UserMinus, AlertCircle } from 'lucide-react';
import { useReturnAsset } from '../../../hooks/useAssets';
import { useLocations, useWarehouses } from '../../../hooks/useMasterData';
import { Asset } from '../../../types';

interface ReturnAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export function ReturnAssetModal({ isOpen, onClose, asset }: ReturnAssetModalProps) {
  const [formData, setFormData] = useState({
    locationId: '',
    warehouseId: '',
    conditionIn: 'Tốt, hoạt động bình thường',
    outcome: 'READY',
    note: ''
  });
  const [error, setError] = useState<string | null>(null);

  const { data: locations = [] } = useLocations();
  const { data: warehouses = [] } = useWarehouses();
  const returnAsset = useReturnAsset();

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.locationId) return setError('Vui lòng chọn vị trí thu hồi về');
    if (!formData.conditionIn) return setError('Vui lòng nhập tình trạng tài sản khi thu hồi');

    try {
      await returnAsset.mutateAsync({
        id: asset.id,
        data: {
          locationId: formData.locationId,
          warehouseId: formData.warehouseId || undefined,
          conditionIn: formData.conditionIn,
          outcome: formData.outcome,
          note: formData.note || undefined
        }
      });
      onClose();
      // Reset
      setFormData({
        locationId: '', warehouseId: '', conditionIn: 'Tốt, hoạt động bình thường', outcome: 'READY', note: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi thu hồi tài sản');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserMinus size={20} className="text-rose-600" />
              Thu hồi tài sản
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Thu hồi từ: <b className="text-gray-900">{asset.currentCustodian?.fullName || 'Không xác định'}</b>
            </p>
          </div>
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

          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-900">
            Tài sản <b>{asset.name} ({asset.assetTag})</b> sẽ được gỡ bỏ khỏi người dùng hiện tại và trạng thái sẽ được cập nhật lại theo kết quả đánh giá.
          </div>

          <form id="return-asset-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá tình trạng (Kết quả) <span className="text-rose-500">*</span></label>
                <select 
                  value={formData.outcome}
                  onChange={e => setFormData({...formData, outcome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 text-sm bg-white"
                >
                  <option value="READY">Hoạt động tốt (Sẵn sàng)</option>
                  <option value="MAINTENANCE">Cần bảo trì / Sửa chữa</option>
                  <option value="BROKEN">Đã hỏng (Chờ thanh lý)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí thu hồi về <span className="text-rose-500">*</span></label>
                <select 
                  value={formData.locationId}
                  onChange={e => setFormData({...formData, locationId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 text-sm bg-white"
                >
                  <option value="">-- Chọn vị trí --</option>
                  {locations.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kho lưu trữ (Tùy chọn)</label>
                <select 
                  value={formData.warehouseId}
                  onChange={e => setFormData({...formData, warehouseId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 text-sm bg-white"
                >
                  <option value="">-- Không xếp vào kho --</option>
                  {warehouses.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả tình trạng khi thu hồi <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.conditionIn}
                  onChange={e => setFormData({...formData, conditionIn: e.target.value})}
                  placeholder="VD: Trầy xước nhẹ, màn hình hoạt động tốt..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                <textarea 
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  placeholder="Lý do thu hồi hoặc ghi chú đặc biệt..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 text-sm resize-none"
                />
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
            form="return-asset-form"
            disabled={returnAsset.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-rose-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {returnAsset.isPending ? 'Đang xử lý...' : 'Xác nhận thu hồi'}
          </button>
        </div>
      </div>
    </div>
  );
}
