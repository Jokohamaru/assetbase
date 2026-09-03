import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Calendar } from 'lucide-react';
import { useAssignAsset } from '../../../hooks/useAssets';
import { usePeople, useDepartments, useLocations } from '../../../hooks/useMasterData';
import { Asset } from '../../../types';

interface AssignAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export function AssignAssetModal({ isOpen, onClose, asset }: AssignAssetModalProps) {
  const [formData, setFormData] = useState({
    type: 'ASSIGNMENT', // or LOAN
    assignedToId: '',
    departmentId: '',
    locationId: '',
    conditionOut: 'Tốt',
    expectedReturnDate: '',
    note: ''
  });
  const [error, setError] = useState<string | null>(null);

  const { data: people = [] } = usePeople();
  const { data: departments = [] } = useDepartments();
  const { data: locations = [] } = useLocations();
  const assignAsset = useAssignAsset();

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.assignedToId) return setError('Vui lòng chọn người nhận tài sản');
    if (!formData.departmentId) return setError('Vui lòng chọn phòng ban');
    if (!formData.locationId) return setError('Vui lòng chọn vị trí sử dụng');
    if (formData.type === 'LOAN' && !formData.expectedReturnDate) {
      return setError('Vui lòng chọn ngày dự kiến trả khi cho mượn');
    }

    try {
      await assignAsset.mutateAsync({
        id: asset.id,
        data: {
          type: formData.type,
          assignedToId: formData.assignedToId,
          departmentId: formData.departmentId,
          locationId: formData.locationId,
          conditionOut: formData.conditionOut,
          expectedReturnDate: formData.type === 'LOAN' ? formData.expectedReturnDate : undefined,
          note: formData.note || undefined
        }
      });
      onClose();
      // Reset
      setFormData({
        type: 'ASSIGNMENT', assignedToId: '', departmentId: '', locationId: '', conditionOut: 'Tốt', expectedReturnDate: '', note: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cấp phát tài sản');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserPlus size={20} className="text-indigo-600" />
              Cấp phát / Cho mượn tài sản
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Đang thao tác trên: <b className="text-gray-900">{asset.name}</b> ({asset.assetTag})
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

          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-900">
            Tài sản hiện đang ở trạng thái <b>{asset.status?.name || 'Chưa rõ'}</b> và <b>{asset.currentCustodian ? `do ${asset.currentCustodian.fullName} sử dụng` : 'chưa gán cho ai'}</b>.
          </div>

          <form id="assign-asset-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình thức giao tài sản</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="ASSIGNMENT"
                    checked={formData.type === 'ASSIGNMENT'}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="text-sm text-gray-900">Cấp phát cố định</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="LOAN"
                    checked={formData.type === 'LOAN'}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="text-sm text-gray-900">Cho mượn tạm thời</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người nhận tài sản <span className="text-rose-500">*</span></label>
                <select
                  value={formData.assignedToId}
                  onChange={e => setFormData({ ...formData, assignedToId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white"
                >
                  <option value="">-- Chọn người nhận --</option>
                  {people.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.email || p.employeeCode})</option>
                  ))}
                </select>
              </div>

              {formData.type === 'LOAN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày dự kiến trả <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="date"
                      value={formData.expectedReturnDate}
                      onChange={e => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban sử dụng <span className="text-rose-500">*</span></label>
                <select
                  value={formData.departmentId}
                  onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white"
                >
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí sử dụng <span className="text-rose-500">*</span></label>
                <select
                  value={formData.locationId}
                  onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white"
                >
                  <option value="">-- Chọn vị trí --</option>
                  {locations.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng tài sản khi giao <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.conditionOut}
                  onChange={e => setFormData({ ...formData, conditionOut: e.target.value })}
                  placeholder="VD: Máy tốt, có xước dăm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                <textarea
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Ghi chú về việc cấp phát tài sản này..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm resize-none"
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
            form="assign-asset-form"
            disabled={assignAsset.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {assignAsset.isPending ? 'Đang xử lý...' : 'Xác nhận cấp phát'}
          </button>
        </div>
      </div>
    </div>
  );
}
