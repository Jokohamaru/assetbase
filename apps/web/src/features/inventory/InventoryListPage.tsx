import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Search, Calendar, ChevronRight } from 'lucide-react';
import { apiClient as api } from '../../lib/api-client';
import { InventorySession } from '../../types';

export function InventoryListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  
  const { data: response, isLoading } = useQuery({
    queryKey: ['inventories'],
    queryFn: async () => {
      const res = await api.get<{ data: InventorySession[] }>('/inventories');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await api.post<{ data: InventorySession }>('/inventories', data);
      return res.data.data;
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      setShowCreateModal(false);
      navigate(`/inventory/${newSession.id}`);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;
    createMutation.mutate({ name: newSessionName });
  };

  const statusColor = (status: string) => {
    if (status === 'OPEN') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (status === 'CLOSED') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Kiểm kê tài sản
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Quản lý các đợt kiểm kê, đánh giá thực trạng tài sản
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Tạo đợt kiểm kê mới
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 shadow-sm border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm đợt kiểm kê..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium">Mã đợt</th>
                <th className="p-4 font-medium">Tên đợt kiểm kê</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Ngày bắt đầu</th>
                <th className="p-4 font-medium">Ngày đóng</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : response?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList size={48} className="text-gray-300 mb-4" />
                      <p>Chưa có đợt kiểm kê nào.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                response?.data.map((session) => (
                  <tr 
                    key={session.id} 
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/inventory/${session.id}`)}
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                        {session.inventoryNo}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {session.name}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(session.status)}`}>
                        {session.status === 'OPEN' ? 'Đang thực hiện' : 'Đã đóng'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                      <Calendar size={16} />
                      {new Date(session.startedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                      {session.closedAt ? new Date(session.closedAt).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tạo đợt kiểm kê mới</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Thiết lập phiên kiểm kê để bắt đầu quét tài sản
              </p>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên đợt kiểm kê <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="VD: Kiểm kê định kỳ Q3/2026"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-lg text-sm">
                <p><strong>Lưu ý:</strong> Hiện tại hệ thống sẽ tự động quét toàn bộ tài sản đang khả dụng. Tính năng lọc theo chi nhánh/phòng ban sẽ được bổ sung sau.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !newSessionName.trim()}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg transition-colors font-medium shadow-sm flex items-center gap-2"
                >
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
