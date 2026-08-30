import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, AlertCircle, ScanLine, Search, Download, HelpCircle, XCircle } from 'lucide-react';
import { apiClient as api } from '../../lib/api-client';
import { InventorySession, InventoryItem } from '../../types';

export function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['inventories', id],
    queryFn: async () => {
      const res = await api.get<{ data: InventorySession }>(`/inventories/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const session = response?.data;
  const items = session?.items || [];

  const closeMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/inventories/${id}/close`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories', id] });
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  if (!session) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy đợt kiểm kê</div>;
  }

  const stats = {
    total: items.length,
    pending: items.filter(i => i.result === 'PENDING').length,
    matched: items.filter(i => i.result === 'MATCHED').length,
    unexpected: items.filter(i => i.result === 'UNEXPECTED').length,
    missing: items.filter(i => i.result === 'MISSING').length,
    locationMismatch: items.filter(i => i.result === 'LOCATION_MISMATCH').length,
  };

  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.asset?.name.toLowerCase().includes(term) ||
      item.asset?.assetTag.toLowerCase().includes(term) ||
      item.asset?.barcode?.toLowerCase().includes(term)
    );
  });

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'PENDING':
        return <span className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><HelpCircle size={12}/> Chờ quét</span>;
      case 'MATCHED':
        return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><CheckCircle2 size={12}/> Khớp</span>;
      case 'MISSING':
        return <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><XCircle size={12}/> Thất lạc</span>;
      case 'UNEXPECTED':
        return <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><AlertCircle size={12}/> Dư / Lạc vào</span>;
      case 'LOCATION_MISMATCH':
        return <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><AlertCircle size={12}/> Sai vị trí</span>;
      default:
        return <span>{result}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/inventory')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {session.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${session.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {session.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <span className="font-mono text-sm">{session.inventoryNo}</span>
              <span>•</span>
              <span>Tạo lúc: {new Date(session.createdAt).toLocaleString('vi-VN')}</span>
            </p>
          </div>
        </div>
        
        {session.status === 'OPEN' && (
          <div className="flex gap-3">
            <button 
              onClick={() => navigate(`/inventory/${id}/scan`)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
            >
              <ScanLine size={20} />
              Quét kiểm kê
            </button>
            <button 
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn đóng phiên kiểm kê này? Các tài sản chưa quét sẽ bị đánh dấu là Thất lạc (MISSING).')) {
                  closeMutation.mutate();
                }
              }}
              className="bg-gray-800 hover:bg-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
            >
              <CheckCircle2 size={20} />
              Chốt kết quả
            </button>
          </div>
        )}
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tổng tài sản</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Chưa quét</p>
          <p className="text-3xl font-bold text-gray-500 dark:text-gray-400 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl shadow-sm border border-green-100 dark:border-green-900/30">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Khớp (MATCHED)</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-500 mt-2">{stats.matched}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl shadow-sm border border-orange-100 dark:border-orange-900/30">
          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Sai vị trí</p>
          <p className="text-3xl font-bold text-orange-700 dark:text-orange-500 mt-2">{stats.locationMismatch}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900/30">
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Dư / Lạc vào</p>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-500 mt-2">{stats.unexpected}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Thất lạc</p>
          <p className="text-3xl font-bold text-red-700 dark:text-red-500 mt-2">{stats.missing}</p>
        </div>
      </div>

      {/* Item List */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm theo mã hoặc tên tài sản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium border border-gray-300 dark:border-slate-700">
            <Download size={18} />
            Xuất Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium">Mã tài sản</th>
                <th className="p-4 font-medium">Tên tài sản</th>
                <th className="p-4 font-medium">Kết quả</th>
                <th className="p-4 font-medium">Thời gian quét</th>
                <th className="p-4 font-medium">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Không tìm thấy tài sản nào.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-medium text-gray-900 dark:text-white">{item.asset?.assetTag}</span>
                        {item.asset?.barcode && <span className="text-xs text-gray-500">BC: {item.asset.barcode}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-gray-900 dark:text-white">{item.asset?.name}</span>
                    </td>
                    <td className="p-4">
                      {getResultBadge(item.result)}
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {item.scannedAt ? new Date(item.scannedAt).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 text-sm max-w-[200px] truncate">
                      {item.note || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
