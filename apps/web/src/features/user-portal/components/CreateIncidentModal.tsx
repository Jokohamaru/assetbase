import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Laptop } from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import type { Asset, AppUser } from '../../../types';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  prefilledAsset?: Asset | null;
}

export function CreateIncidentModal({ onClose, onSuccess, prefilledAsset }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('HARDWARE');
  const [urgency, setUrgency] = useState('MEDIUM');
  const [reporterContact, setReporterContact] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [description, setDescription] = useState('');
  const [assetId, setAssetId] = useState(prefilledAsset?.id || '');
  
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await apiClient.get('/auth/me'); 
        setCurrentUser(res.data.data.user);
      } catch (e) {
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    if (!prefilledAsset) {
      const fetchAssets = async () => {
        try {
          const res = await apiClient.get('/assets', { params: { my: true } });
          setMyAssets(Array.isArray(res.data.data) ? res.data.data : (res.data.data.items || []));
        } catch (e) {}
      };
      fetchAssets();
    }
  }, [prefilledAsset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Vui lòng nhập đầy đủ tiêu đề và mô tả.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let priority = 'P3';
      if (urgency === 'CRITICAL') priority = 'P1';
      else if (urgency === 'HIGH') priority = 'P2';
      else if (urgency === 'LOW') priority = 'P4';

      let finalDesc = description;
      if (attachmentUrl.trim()) {
        finalDesc += `\n\n[Hình ảnh đính kèm]: ${attachmentUrl.trim()}`;
      }

      await apiClient.post('/incidents', {
        title,
        category,
        description: finalDesc,
        assetId: assetId || undefined,
        priority,
        impact: urgency === 'CRITICAL' ? 'HIGH' : urgency === 'HIGH' ? 'HIGH' : 'MEDIUM',
        urgency,
        reporterContact: reporterContact.trim() || undefined,
        reporterName: currentUser ? currentUser.name : 'Nhân viên', 
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi tạo báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gửi báo cáo sự cố</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 dark:bg-red-900/30 dark:border-red-900/50 dark:text-red-400">
              {error}
            </div>
          )}

          <form id="incident-form" onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mức độ khẩn cấp <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="LOW">Thấp (Thong thả)</option>
                  <option value="MEDIUM">Trung bình (Vừa phải)</option>
                  <option value="HIGH">Cao (Cần hỗ trợ sớm)</option>
                  <option value="CRITICAL">Khẩn cấp (Gián đoạn công việc)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thông tin liên hệ / Vị trí chỗ ngồi</label>
              <input 
                type="text"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="VD: 0987654321 - Tầng 3, Phòng 302"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link ảnh minh họa / Bằng chứng lỗi (nếu có)</label>
              <input 
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
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
            form="incident-form"
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
