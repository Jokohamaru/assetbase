import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useFulfillAssetRequest } from '../../../hooks/useAssetRequests';
import { apiClient } from '../../../lib/api-client';
import type { Asset, Incident } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  request: Incident | null;
}

export function FulfillRequestModal({ isOpen, onClose, request }: Props) {
  const mutation = useFulfillAssetRequest();
  const [assetId, setAssetId] = useState('');
  const [conditionOut, setConditionOut] = useState('Bình thường');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  useEffect(() => {
    if (isOpen && request && request.ticketType === 'SERVICE_REQUEST') {
      let details: any = {};
      try {
        if (typeof request.requestDetails === 'string') {
          details = JSON.parse(request.requestDetails);
        } else if (request.requestDetails) {
          details = request.requestDetails;
        }
      } catch(e) {}
      
      const fetchAssets = async () => {
        setLoadingAssets(true);
        try {
          // fetch by category if defined
          const params: any = { status: 'READY', limit: 100 };
          if (details.assetCategoryId) {
            params.categoryId = details.assetCategoryId;
          }
          const res = await apiClient.get('/assets', { params });
          setAssets(res.data.data.items || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingAssets(false);
        }
      };
      fetchAssets();
      setAssetId('');
      setConditionOut('Bình thường');
    }
  }, [isOpen, request]);

  if (!isOpen || !request) return null;

  const handleFulfill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !conditionOut) return;

    mutation.mutate({ id: request.id, data: { assetId, conditionOut } }, {
      onSuccess: () => {
        onClose();
        alert('Cấp phát thành công!');
      },
      onError: (err: any) => alert(err.response?.data?.error || 'Có lỗi xảy ra')
    });
  };

  let details: any = {};
  try {
    if (typeof request.requestDetails === 'string') {
      details = JSON.parse(request.requestDetails);
    } else if (request.requestDetails) {
      details = request.requestDetails;
    }
  } catch(e) {}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Cấp phát Thiết Bị</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleFulfill} className="p-4 space-y-4">
          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
            <p><span className="font-medium">Mã yêu cầu:</span> {request.incidentNo}</p>
            <p><span className="font-medium">Người yêu cầu:</span> {request.reporterName}</p>
            <p><span className="font-medium">Tiêu đề:</span> {request.title}</p>
            {details.purpose && <p><span className="font-medium">Mục đích:</span> {details.purpose}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Thiết bị (READY) <span className="text-red-500">*</span></label>
            <select
              required
              value={assetId}
              onChange={e => setAssetId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              disabled={loadingAssets}
            >
              <option value="">-- Chọn tài sản --</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.assetTag} - {a.name}</option>
              ))}
            </select>
            {assets.length === 0 && !loadingAssets && (
              <p className="mt-1 text-sm text-red-600">Không có tài sản nào ở trạng thái READY cho loại này.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng khi giao <span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              value={conditionOut}
              onChange={e => setConditionOut(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="VD: Mới, Bình thường..."
            />
          </div>

          <div className="flex justify-end pt-4 gap-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100">Hủy</button>
            <button 
              type="submit" 
              disabled={mutation.isPending || !assetId || assets.length === 0}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tiến hành Cấp Phát
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
