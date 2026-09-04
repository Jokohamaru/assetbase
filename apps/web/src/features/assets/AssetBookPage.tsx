import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Laptop, Monitor, Smartphone, Printer, Server,
  Search, Building2, Filter, ChevronDown, Plus,
  Download, Upload, UserPlus, UserMinus, QrCode, Pencil, Trash2, Edit3, Eye
} from 'lucide-react';
import { useAssets, useDeleteAsset } from '../../hooks/useAssets';
import { useDashboardMetrics } from '../../hooks/useDashboard';
import { useDepartments, useCategories } from '../../hooks/useMasterData';
import { AddAssetModal } from './components/AddAssetModal';
import { AssignAssetModal } from './components/AssignAssetModal';
import { ReturnAssetModal } from './components/ReturnAssetModal';
import { EditAssetModal } from './components/EditAssetModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { BarcodePrintModal } from '../scanner/BarcodePrintModal';
import { Asset } from '../../types';
import { getStatusBadgeClasses, getStatusDotClasses } from '../../utils/theme';

const API_ROOT = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8080';

export function AssetBookPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState<Asset | null>(null);
  const [selectedAssetForReturn, setSelectedAssetForReturn] = useState<Asset | null>(null);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState<Asset | null>(null);
  const [selectedAssetForPrint, setSelectedAssetForPrint] = useState<Asset | null>(null);
  const [selectedAssetForDelete, setSelectedAssetForDelete] = useState<Asset | null>(null);

  const { data: metricsData } = useDashboardMetrics();

  const { data: assets = [], isLoading } = useAssets({
    category: activeTab === 'all' ? undefined : activeTab,
    search: debouncedSearch || undefined,
    status: status || undefined,
    department: department || undefined
  });

  const { data: departments = [] } = useDepartments();
  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteAsset();

  const handleDelete = () => {
    if (selectedAssetForDelete) {
      deleteMutation.mutate(selectedAssetForDelete.id, {
        onSuccess: () => {
          setSelectedAssetForDelete(null);
        }
      });
    }
  };

  // Map category names to icons
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('laptop')) return Laptop;
    if (name.includes('pc') || name.includes('desktop') || name.includes('màn hình')) return Monitor;
    if (name.includes('mobile') || name.includes('điện thoại') || name.includes('tablet')) return Smartphone;
    if (name.includes('server') || name.includes('máy chủ') || name.includes('network') || name.includes('mạng') || name.includes('switch') || name.includes('router')) return Server;
    if (name.includes('print') || name.includes('máy in')) return Printer;
    return Box;
  };

  const dynamicGroups = categories.map((c: any) => ({
    id: c.name,
    label: c.name,
    count: assets.filter((a: any) => a.category?.id === c.id).length,
    icon: getCategoryIcon(c.name)
  }));

  const assetGroups = [
    { id: 'all', label: 'Tất cả', count: metricsData?.totalAssets || 0, icon: Box },
    ...dynamicGroups
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Sổ tài sản</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Quản lý và theo dõi toàn bộ tài sản trong công ty.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Upload size={16} /> Nhập Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Download size={16} /> Xuất Excel
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} /> Thêm tài sản
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex flex-wrap gap-4 text-sm font-medium">
        <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
          <span className="text-gray-900 dark:text-gray-100 font-bold">{metricsData?.totalAssets || 0}</span> <span className="text-gray-500 dark:text-gray-400">tài sản</span>
        </div>
        <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-2 transition-colors">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="text-gray-900 dark:text-gray-100 font-bold">{metricsData?.readyAssets || 0}</span> <span className="text-gray-500 dark:text-gray-400">sẵn sàng</span>
        </div>
        <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-2 transition-colors">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-gray-900 dark:text-gray-100 font-bold">{metricsData?.inUseAssets || 0}</span> <span className="text-gray-500 dark:text-gray-400">đang sử dụng</span>
        </div>
        <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-2 transition-colors">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-gray-900 dark:text-gray-100 font-bold">{metricsData?.attentionAssets || 0}</span> <span className="text-gray-500 dark:text-gray-400">bảo trì / hỏng</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        {assetGroups.map((group) => {
          const isActive = activeTab === group.id;
          return (
            <button
              key={group.id}
              onClick={() => setActiveTab(group.id)}
              className={`flex items-center gap-3 min-w-[160px] p-4 rounded-xl border text-left transition-all ${isActive
                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/30 ring-1 ring-indigo-600 dark:ring-indigo-500 shadow-sm'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
            >
              <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                <group.icon size={20} />
              </div>
              <div>
                <p className={`text-sm font-bold transition-colors ${isActive ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-900 dark:text-gray-100'}`}>{group.label}</p>
                <p className={`text-xs transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>{group.count} tài sản</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Table Area */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row gap-4 transition-colors">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm mã, tên, serial, người sử dụng..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Building2 size={16} />
              </div>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="block w-full pl-9 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm appearance-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
                <option value="">Tất cả phòng ban</option>
                {departments.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={16} />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Filter size={16} />
              </div>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="block w-full pl-9 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm appearance-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
                <option value="">Tất cả trạng thái</option>
                <option value="IN_USE">Đang sử dụng</option>
                <option value="READY">Sẵn sàng</option>
                <option value="MAINTENANCE">Bảo trì</option>
                <option value="BROKEN">Hỏng</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 transition-colors">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Tài sản</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Phòng ban / Vị trí</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Người sử dụng</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 animate-pulse"></div>
                      <div className="w-4 h-4 rounded-full bg-indigo-600 animate-pulse delay-75"></div>
                      <div className="w-4 h-4 rounded-full bg-indigo-600 animate-pulse delay-150"></div>
                    </div>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Search size={32} className="mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Không tìm thấy tài sản</p>
                    <p className="mt-1">Thử thay đổi từ khóa hoặc bộ lọc để xem kết quả.</p>
                  </td>
                </tr>
              ) : (
                assets.slice((page - 1) * 10, page * 10).map((a: any) => (
                  <tr key={a.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0 transition-colors overflow-hidden">
                          {a.imageUrl ? (
                            <img src={a.imageUrl.startsWith('http') ? a.imageUrl : `${API_ROOT}${a.imageUrl}`} alt={a.name} className="w-full h-full object-cover" />
                          ) : (
                            <Laptop size={20} />
                          )}
                        </div>
                        <div>
                          <button className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-left transition-colors">{a.name}</button>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2 transition-colors">
                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300 font-medium transition-colors">{a.category?.name || 'Khác'}</span>
                            <span>{a.assetTag}</span>
                            {a.serialNumber && <span>• SN: {a.serialNumber}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors">{a.department?.name || 'Chưa gán'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 transition-colors">{a.location?.name || 'Chưa xác định'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {a.currentCustodian ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-bold uppercase transition-colors">
                              {a.currentCustodian.fullName.substring(0, 2)}
                            </div>
                            <span className="text-gray-900 dark:text-gray-100 transition-colors">{a.currentCustodian.fullName}</span>
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 italic transition-colors">Chưa gán</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${getStatusBadgeClasses(a.status?.color)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 transition-colors ${getStatusDotClasses(a.status?.color)}`}></span>
                        {a.status?.name || '---'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/assets/${a.id}`)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                          title="Xem chi tiết thiết bị"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setSelectedAssetForEdit(a)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                          title="Chỉnh sửa tài sản"
                        >
                          <Edit3 size={16} />
                        </button>
                        {a.status?.code === 'ACTIVE' ? (
                          <button
                            onClick={() => setSelectedAssetForReturn(a)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded transition-colors"
                            title="Thu hồi tài sản"
                          >
                            <UserMinus size={16} />
                          </button>
                        ) : a.status?.code === 'READY' ? (
                          <button
                            onClick={() => setSelectedAssetForAssign(a)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                            title="Cấp phát tài sản"
                          >
                            <UserPlus size={16} />
                          </button>
                        ) : null}
                        <button
                          onClick={() => setSelectedAssetForPrint(a)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                          title="In Barcode / QR"
                        >
                          <QrCode size={16} />
                        </button>
                        <button
                          onClick={() => setSelectedAssetForDelete(a)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between transition-colors">
          <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Hiển thị <b className="text-gray-900 dark:text-gray-100">{Math.min(assets.length, page * 10)}</b> trên <b className="text-gray-900 dark:text-gray-100">{assets.length}</b> tài sản</span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Trước</button>
            <button className="px-3 py-1 border border-indigo-600 dark:border-indigo-500 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium transition-colors">{page}</button>
            <button
              disabled={page * 10 >= assets.length}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Tiếp</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddAssetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <AssignAssetModal
        isOpen={selectedAssetForAssign !== null}
        asset={selectedAssetForAssign}
        onClose={() => setSelectedAssetForAssign(null)}
      />
      <ReturnAssetModal
        isOpen={!!selectedAssetForReturn}
        onClose={() => setSelectedAssetForReturn(null)}
        asset={selectedAssetForReturn}
      />

      <EditAssetModal
        isOpen={!!selectedAssetForEdit}
        onClose={() => setSelectedAssetForEdit(null)}
        asset={selectedAssetForEdit}
        onAssign={(asset) => setSelectedAssetForAssign(asset)}
        onReturn={(asset) => setSelectedAssetForReturn(asset)}
      />

      {selectedAssetForPrint && (
        <BarcodePrintModal
          asset={selectedAssetForPrint}
          onClose={() => setSelectedAssetForPrint(null)}
        />
      )}
      <ConfirmDeleteModal
        isOpen={!!selectedAssetForDelete}
        onClose={() => setSelectedAssetForDelete(null)}
        onConfirm={handleDelete}
        asset={selectedAssetForDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
