import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Laptop, Package } from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import type { Asset, AppUser } from '../../../types';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  prefilledAsset?: Asset | null;
}

export function CreateIncidentModal({ onClose, onSuccess, prefilledAsset }: Props) {
  const [activeTab, setActiveTab] = useState<'INCIDENT' | 'REQUEST'>(prefilledAsset ? 'INCIDENT' : 'INCIDENT');
  
  // Incident Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('HARDWARE');
  const [description, setDescription] = useState('');
  const [assetId, setAssetId] = useState(prefilledAsset?.id || '');
  
  // Request Form State
  const [requestDeviceType, setRequestDeviceType] = useState('Laptop');
  const [requestReason, setRequestReason] = useState('');
  
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Current User
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  useEffect(() => {
    // get from localStorage or context (for simplicity we parse local user or just fetch me)
    const fetchMe = async () => {
      try {
        const res = await apiClient.get('/auth/me'); // Assuming there's a /me or we rely on backend extracting user
        // If no /auth/me, we can just use the name we have or let backend handle reporterName via ID
      } catch (e) {
        // ignore
      }
    };
    
    const fetchAssets = async () => {
      try {
        const res = await apiClient.get('/assets', { params: { my: true } });
        setMyAssets(res.data.data.items || []);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchAssets();
  }, []);

  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/incidents', {
        title,
        category,
        priority: 'P3', // Default medium priority for user reports
        impact: 'MODERATE',
        urgency: 'MEDIUM',
        description,
        assetId: assetId || undefined,
        reporterName: 'User', // The backend will link the Creator ID
        reporterContact: ''
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Temporarily saving requests as an Incident with OTHER category
      await apiClient.post('/incidents', {
        title: `[Yêu cầu thiết bị] ${requestDeviceType}`,
        category: 'OTHER',
        priority: 'P4', // Low priority for requests
        impact: 'LOW',
        urgency: 'LOW',
        description: `Loại thiết bị: ${requestDeviceType}\n\nLý do cấp phát: ${requestReason}`,
        reporterName: 'User', 
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gửi yêu cầu hỗ trợ
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        {!prefilledAsset && (
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('INCIDENT')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'INCIDENT' 
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <AlertCircle size={18} /> Báo cáo sự cố
            </button>
            <button
              onClick={() => setActiveTab('REQUEST')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'REQUEST' 
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Package size={18} /> Xin cấp phát
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 dark:bg-red-900/30 dark:border-red-900/50 dark:text-red-400">
              {error}
            </div>
          )}

          {activeTab === 'INCIDENT' ? (
            <form id="incident-form" onSubmit={handleSubmitIncident} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thiết bị gặp sự cố
                </label>
                {prefilledAsset ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Laptop size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{prefilledAsset.name}</p>
                      <p className="text-xs text-gray-500">{prefilledAsset.assetTag}</p>
                    </div>
                  </div>
                ) : (
                  <select 
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">-- Chọn thiết bị (Không bắt buộc) --</option>
                    {myAssets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Máy tính không lên nguồn"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại sự cố <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="HARDWARE">Phần cứng</option>
                  <option value="SOFTWARE">Phần mềm</option>
                  <option value="NETWORK">Mạng / Internet</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả chi tiết <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả rõ tình trạng gặp phải để IT dễ dàng hỗ trợ..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>
            </form>
          ) : (
            <form id="request-form" onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm border border-blue-100 dark:border-blue-800">
                Lưu ý: Yêu cầu cấp phát thiết bị sẽ được chuyển tới Quản lý duyệt trước khi đến bộ phận IT.
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại thiết bị cần cấp <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={requestDeviceType}
                  onChange={(e) => setRequestDeviceType(e.target.value)}
                  placeholder="Ví dụ: Màn hình phụ, Bàn phím cơ, Chuột..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lý do xin cấp phát <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={4}
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Nêu rõ mục đích công việc cần sử dụng thiết bị này..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            form={activeTab === 'INCIDENT' ? 'incident-form' : 'request-form'}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </div>
      </div>
    </div>
  );
}
