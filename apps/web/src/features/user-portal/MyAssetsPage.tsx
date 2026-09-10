import React, { useState, useEffect } from 'react';
import { Box, Search, AlertCircle, Laptop, Settings, ShieldAlert, FileText } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { Asset } from '../../types';
import { CreateIncidentModal } from './components/CreateIncidentModal';

export function MyAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // For reporting an incident
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const fetchMyAssets = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/assets', {
        params: { my: true, search }
      });
      setAssets(Array.isArray(res.data.data) ? res.data.data : (res.data.data.items || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAssets();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thiết bị của tôi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sách các thiết bị bạn đang quản lý hoặc sử dụng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Tìm theo mã hoặc tên thiết bị..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Box className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Không có thiết bị nào</h3>
          <p className="text-gray-500 dark:text-gray-400">Bạn hiện không giữ thiết bị nào khớp với tìm kiếm.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map(asset => (
            <div key={asset.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Laptop size={24} />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800`}>
                    {asset.status?.name || 'Đang sử dụng'}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{asset.name}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">{asset.assetTag}</p>
                
                <div className="space-y-2">
                  {asset.manufacturer?.name && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Settings size={16} className="mr-2 text-gray-400" />
                      <span>Nhà SX: {asset.manufacturer.name}</span>
                    </div>
                  )}
                  {asset.category?.name && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <FileText size={16} className="mr-2 text-gray-400" />
                      <span>Loại: {asset.category.name}</span>
                    </div>
                  )}
                  {asset.serialNumber && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <ShieldAlert size={16} className="mr-2 text-gray-400" />
                      <span>S/N: {asset.serialNumber}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 mt-auto">
                <button
                  onClick={() => setSelectedAsset(asset)}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 transition-colors font-medium text-sm"
                >
                  <AlertCircle size={16} /> Báo lỗi thiết bị
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAsset && (
        <CreateIncidentModal 
          prefilledAsset={selectedAsset}
          onClose={() => setSelectedAsset(null)} 
          onSuccess={() => {
            setSelectedAsset(null);
          }}
        />
      )}
    </div>
  );
}
