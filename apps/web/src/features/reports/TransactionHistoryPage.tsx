import React, { useState } from 'react';
import { History, Download, Filter, Search } from 'lucide-react';
import { useHistory } from '../../hooks/useAssets';

export function TransactionHistoryPage() {
  const [filter, setFilter] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: history = [], isLoading } = useHistory();

  // Mapping action to Vietnamese for display
  const getActionName = (action: string) => {
    switch(action) {
      case 'CREATED': return 'Khởi tạo';
      case 'UPDATED': return 'Cập nhật';
      case 'ASSIGNED': return 'Cấp phát';
      case 'RETURNED': return 'Thu hồi';
      case 'TRANSFERRED': return 'Điều chuyển';
      case 'MAINTENANCE': return 'Bảo trì';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'CREATED': return 'bg-blue-100 text-blue-700';
      case 'UPDATED': return 'bg-gray-100 text-gray-700';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-700';
      case 'RETURNED': return 'bg-orange-100 text-orange-700';
      case 'TRANSFERRED': return 'bg-teal-100 text-teal-700';
      case 'MAINTENANCE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Filter local logic
  const filteredHistory = history.filter((item: any) => {
    if (filter !== 'Tất cả') {
      if (getActionName(item.action) !== filter) return false;
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        item.asset?.name?.toLowerCase().includes(search) || 
        item.asset?.assetTag?.toLowerCase().includes(search) ||
        item.actor?.fullName?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lịch sử giao dịch</h1>
          <p className="text-sm text-gray-500 mt-1">Nhật ký đầy đủ mọi thao tác đối với tài sản trong hệ thống.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
          <Download size={18} />
          Xuất Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 rounded-t-xl">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
            {['Tất cả', 'Khởi tạo', 'Cấp phát', 'Thu hồi', 'Điều chuyển', 'Bảo trì'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Tìm theo mã, tên tài sản..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Thời gian</th>
                <th className="px-6 py-4 font-semibold">Nghiệp vụ</th>
                <th className="px-6 py-4 font-semibold">Tài sản</th>
                <th className="px-6 py-4 font-semibold">Vị trí (Từ ➝ Đến)</th>
                <th className="px-6 py-4 font-semibold">Người thực hiện</th>
                <th className="px-6 py-4 font-semibold">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <History size={32} className="mx-auto mb-3 opacity-50" />
                    <p>Không tìm thấy lịch sử giao dịch nào.</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</div>
                      <div className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getActionColor(item.action)}`}>
                        {getActionName(item.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 line-clamp-1">{item.asset?.name || 'Unknown Asset'}</div>
                      <div className="text-xs font-medium text-gray-500">{item.asset?.assetTag || item.assetId}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {item.fromLocation || item.toLocation ? (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <span>{item.fromLocation?.name || '-'}</span>
                          <span className="text-gray-300">➝</span>
                          <span className="font-medium text-gray-900">{item.toLocation?.name || '-'}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {item.actor?.fullName || item.actor?.username || 'Hệ thống'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={item.description}>
                      {item.description || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/30 rounded-b-xl">
          <div>Hiển thị <span className="font-medium text-gray-900">{filteredHistory.length}</span> giao dịch</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white transition-colors" disabled>Trước</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white transition-colors" disabled>Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
