import React, { useState } from 'react';
import { 
  Box, Laptop, Monitor, Smartphone, Printer, Server, 
  Search, Building2, Filter, ChevronDown, Plus, 
  Download, Upload, UserPlus, UserMinus, QrCode, Pencil, Trash2
} from 'lucide-react';
import { useAssets } from '../../hooks/useAssets';
import { useDepartments } from '../../hooks/useMasterData';
import { AddAssetModal } from './components/AddAssetModal';
import { AssignAssetModal } from './components/AssignAssetModal';
import { ReturnAssetModal } from './components/ReturnAssetModal';
import { BarcodePrintModal } from '../scanner/BarcodePrintModal';
import { Asset } from '../../types';

export function AssetBookPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState<Asset | null>(null);
  const [selectedAssetForReturn, setSelectedAssetForReturn] = useState<Asset | null>(null);
  const [selectedAssetForBarcode, setSelectedAssetForBarcode] = useState<Asset | null>(null);

  const { data: assets = [], isLoading } = useAssets({
    category: activeTab === 'all' ? undefined : activeTab,
    search: searchQuery || undefined,
    status: status || undefined
  });
  
  const { data: departments = [] } = useDepartments();

  const assetGroups = [
    { id: 'all', label: 'Tất cả', count: assets.length, icon: Box },
    { id: 'Laptop', label: 'Laptop', count: assets.filter((a: any) => a.category?.name === 'Laptop').length, icon: Laptop },
    { id: 'PC / Desktop', label: 'PC', count: assets.filter((a: any) => a.category?.name === 'PC / Desktop').length, icon: Monitor },
    { id: 'Mobile', label: 'Mobile', count: assets.filter((a: any) => a.category?.name === 'Mobile').length, icon: Smartphone },
    { id: 'Server', label: 'Máy chủ / Mạng', count: assets.filter((a: any) => ['Server', 'Switch', 'Router / Wi-Fi'].includes(a.category?.name)).length, icon: Server },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sổ tài sản</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý và theo dõi toàn bộ tài sản trong công ty.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
            <Upload size={16} /> Nhập Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
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
        <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
          <span className="text-gray-900 font-bold">{assets.length}</span> <span className="text-gray-500">tài sản</span>
        </div>
        <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-gray-900 font-bold">{assets.filter((a: any) => a.status?.code === 'IN_USE').length}</span> <span className="text-gray-500">đang sử dụng</span>
        </div>
        <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-gray-900 font-bold">{assets.filter((a: any) => a.status?.code === 'MAINTENANCE').length}</span> <span className="text-gray-500">bảo trì</span>
        </div>
        <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span className="text-gray-900 font-bold">{assets.filter((a: any) => a.status?.code === 'BROKEN').length}</span> <span className="text-gray-500">hỏng</span>
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
              className={`flex items-center gap-3 min-w-[160px] p-4 rounded-xl border text-left transition-all ${
                isActive 
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                <group.icon size={20} />
              </div>
              <div>
                <p className={`text-sm font-bold ${isActive ? 'text-indigo-900' : 'text-gray-900'}`}>{group.label}</p>
                <p className={`text-xs ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>{group.count} tài sản</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm mã, tên, serial, người sử dụng..." 
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
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
                className="block w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm appearance-none bg-white">
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
                className="block w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm appearance-none bg-white">
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
            <thead className="bg-white text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Tài sản</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Phòng ban / Vị trí</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Người sử dụng</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Nguyên giá</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 animate-pulse"></div>
                      <div className="w-4 h-4 rounded-full bg-indigo-600 animate-pulse delay-75"></div>
                      <div className="w-4 h-4 rounded-full bg-indigo-600 animate-pulse delay-150"></div>
                    </div>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Search size={32} className="mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium text-gray-900">Không tìm thấy tài sản</p>
                    <p className="mt-1">Thử thay đổi từ khóa hoặc bộ lọc để xem kết quả.</p>
                  </td>
                </tr>
              ) : (
                assets.slice((page - 1) * 10, page * 10).map((a: any) => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                          <Laptop size={20} />
                        </div>
                        <div>
                          <button className="font-semibold text-indigo-600 hover:text-indigo-800 text-left">{a.name}</button>
                          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">{a.category?.name || 'Khác'}</span>
                            <span>{a.assetTag}</span>
                            {a.serialNumber && <span>• SN: {a.serialNumber}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{a.department?.name || 'Chưa gán'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.location?.name || 'Chưa xác định'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {a.currentCustodian ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold uppercase">
                              {a.currentCustodian.fullName.substring(0, 2)}
                            </div>
                            <span className="text-gray-900">{a.currentCustodian.fullName}</span>
                          </>
                        ) : (
                          <span className="text-gray-500 italic">Chưa gán</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{a.purchaseCost?.toLocaleString('vi-VN')} ₫</p>
                      <p className="text-xs text-gray-500 mt-0.5">Mua {a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString('vi-VN') : '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        a.status?.code === 'IN_USE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        a.status?.code === 'READY' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        a.status?.code === 'MAINTENANCE' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          a.status?.code === 'IN_USE' ? 'bg-emerald-500' :
                          a.status?.code === 'READY' ? 'bg-blue-500' :
                          a.status?.code === 'MAINTENANCE' ? 'bg-amber-500' :
                          'bg-gray-500'
                        }`}></span>
                        {a.status?.name || 'Sẵn sàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {a.status?.code === 'IN_USE' ? (
                          <button 
                            onClick={() => setSelectedAssetForReturn(a)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded" 
                            title="Thu hồi tài sản"
                          >
                            <UserMinus size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => setSelectedAssetForAssign(a)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" 
                            title="Cấp phát tài sản"
                          >
                            <UserPlus size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedAssetForBarcode(a)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" 
                          title="In Barcode / QR"
                        >
                          <QrCode size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Sửa"><Pencil size={16} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Xóa"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600">Hiển thị <b className="text-gray-900">{Math.min(assets.length, page * 10)}</b> trên <b className="text-gray-900">{assets.length}</b> tài sản</span>
          <div className="flex gap-1">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-50">Trước</button>
            <button className="px-3 py-1 border border-indigo-600 rounded bg-indigo-50 text-indigo-700 font-medium">{page}</button>
            <button 
              disabled={page * 10 >= assets.length}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-50">Tiếp</button>
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
      {selectedAssetForReturn && (
        <ReturnAssetModal 
          isOpen={true}
          asset={selectedAssetForReturn} 
          onClose={() => setSelectedAssetForReturn(null)} 
        />
      )}

      {selectedAssetForBarcode && (
        <BarcodePrintModal 
          asset={selectedAssetForBarcode} 
          onClose={() => setSelectedAssetForBarcode(null)} 
        />
      )}
    </div>
  );
}
