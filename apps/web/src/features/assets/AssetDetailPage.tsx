import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Box, CheckCircle, Clock, MapPin, Monitor, Server, Tag, User, Cpu, HardDrive, Calendar, AlertCircle, Plus, UserMinus } from 'lucide-react';
import { useAsset } from '../../hooks/useAssets';
import { getStatusBadgeClasses, getStatusDotClasses } from '../../utils/theme';

const API_ROOT = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8080';

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: asset, isLoading, error } = useAsset(id!);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'history'>('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-rose-500 mb-2" />
          <p>Không tìm thấy tài sản hoặc có lỗi xảy ra.</p>
          <Link to="/assets" className="text-indigo-600 dark:text-indigo-400 mt-2 inline-block">Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  const statusColor = getStatusBadgeClasses(asset.status?.color);

  const imageUrl = asset.imageUrl 
    ? (asset.imageUrl.startsWith('http') ? asset.imageUrl : `${API_ROOT}${asset.imageUrl}`) 
    : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header / Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link 
          to="/assets"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{asset.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border inline-flex items-center ${statusColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotClasses(asset.status?.color)}`}></span>
              {asset.status?.name || '---'}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <Tag size={14} /> {asset.assetTag}
            {asset.serialNumber && (
              <>
                <span className="text-gray-300 dark:text-gray-600">|</span> 
                SN: {asset.serialNumber}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Card Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="aspect-video w-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
              {imageUrl ? (
                <img src={imageUrl} alt={asset.name} className="w-full h-full object-cover" />
              ) : (
                <Box size={64} className="text-gray-300 dark:text-gray-600" />
              )}
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nhóm tài sản</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{asset.category?.name || '---'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hãng sản xuất</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{asset.manufacturer?.name || '---'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dòng sản phẩm</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{asset.model?.name || '---'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MapPin size={16} className="text-indigo-500" /> Vị trí hiện tại
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phòng ban quản lý</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{asset.department?.name || '---'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Người đang sử dụng</p>
                {asset.currentCustodian ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                      {asset.currentCustodian.fullName?.charAt(0) || 'U'}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{asset.currentCustodian.fullName}</span>
                  </div>
                ) : (
                  <p className="font-medium text-gray-500 dark:text-gray-400 mt-1">---</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vị trí / Kho</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{asset.location?.name || '---'} {asset.warehouse ? `(Kho: ${asset.warehouse.name})` : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
            {/* Tab Navigation */}
            <div className="flex px-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'overview' 
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Tổng quan tài chính
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'specs' 
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Cấu hình & Mạng
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'history' 
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Lịch sử vòng đời
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 flex-1">
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100 font-medium">
                        <Calendar size={18} className="text-blue-500" /> Ngày mua
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('vi-VN') : '---'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Giá mua: {asset.purchaseCost ? `${asset.purchaseCost.toLocaleString('vi-VN')} ₫` : '---'}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100 font-medium">
                        <CheckCircle size={18} className="text-emerald-500" /> Bảo hành
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {asset.warrantyMonths ? `${asset.warrantyMonths} tháng` : '---'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Ngày hết hạn: {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString('vi-VN') : '---'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Thông tin bổ sung</h3>
                    <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {asset.notes || 'Không có ghi chú nào.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Cpu size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Bộ vi xử lý (CPU)</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{asset.cpu || '---'}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <HardDrive size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">RAM</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{asset.ram || '---'}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Server size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Lưu trữ (Storage)</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{asset.storage || '---'}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Monitor size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Hệ điều hành</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{asset.operatingSystem || '---'}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 md:col-span-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ IP</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{asset.ipAddress || '---'}</p>
                      </div>
                      <div className="ml-12">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ MAC</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5 uppercase tracking-wider">{asset.macAddress || '---'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="animate-in fade-in duration-300">
                  {(!asset.histories || asset.histories.length === 0) ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Clock size={40} className="mx-auto mb-3 opacity-20" />
                      <p>Chưa có lịch sử giao dịch nào.</p>
                    </div>
                  ) : (
                    <div className="relative border-l border-gray-200 dark:border-gray-700 ml-4 space-y-8 pb-4">
                      {asset.histories.map((h: any, i: number) => {
                        const isCreation = h.actionType === 'CREATE';
                        const isAssign = h.actionType === 'ASSIGN';
                        const isReturn = h.actionType === 'RETURN';
                        const isUpdate = h.actionType === 'UPDATE';
                        const isStatusChange = h.actionType === 'STATUS_CHANGE';
                        
                        let Icon = Clock;
                        let iconColor = 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
                        
                        if (isCreation) {
                          Icon = Plus;
                          iconColor = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400';
                        } else if (isAssign) {
                          Icon = User;
                          iconColor = 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
                        } else if (isReturn) {
                          Icon = UserMinus;
                          iconColor = 'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-400';
                        }

                        return (
                          <div key={h.id} className="relative pl-8">
                            <span className={`absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-900 ${iconColor}`}>
                              <Icon size={12} />
                            </span>
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-800">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                  {isCreation && 'Tạo mới tài sản'}
                                  {isAssign && 'Cấp phát tài sản'}
                                  {isReturn && 'Thu hồi tài sản'}
                                  {isUpdate && 'Cập nhật thông tin'}
                                  {isStatusChange && 'Đổi trạng thái'}
                                </h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                                  {new Date(h.createdAt).toLocaleString('vi-VN')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{h.description}</p>
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <User size={12} /> Thực hiện bởi: {h.actor?.fullName || 'Hệ thống'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
