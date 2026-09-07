import React, { useState, useEffect } from 'react';
import { Plus, Search, Activity, AlertCircle, Clock, CheckCircle, Package } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { Incident } from '../../types';
import { CreateIncidentModal } from './components/CreateIncidentModal';

export function MyIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMyIncidents = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/incidents', {
        params: { my: true, status: statusFilter }
      });
      // Lọc thêm text search ở client (do backend có thể chưa hỗ trợ text search cho incident)
      let data = res.data.data || [];
      if (search) {
        data = data.filter((i: any) => 
          i.title.toLowerCase().includes(search.toLowerCase()) || 
          i.incidentNo.toLowerCase().includes(search.toLowerCase())
        );
      }
      setIncidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIncidents();
  }, [search, statusFilter]);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'NEW': return { label: 'Mới', icon: AlertCircle, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'IN_PROGRESS': return { label: 'Đang xử lý', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' };
      case 'RESOLVED': return { label: 'Đã giải quyết', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' };
      case 'CLOSED': return { label: 'Đã đóng', icon: CheckCircle, color: 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400' };
      default: return { label: status, icon: Activity, color: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
  };

  const getCategoryLabel = (cat: string) => {
    if (cat === 'HARDWARE') return 'Phần cứng';
    if (cat === 'SOFTWARE') return 'Phần mềm';
    if (cat === 'NETWORK') return 'Mạng';
    if (cat === 'OTHER') return 'Khác';
    return cat;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Báo cáo sự cố</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Lịch sử các báo cáo lỗi và sự cố IT của bạn</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            <Plus size={20} /> Báo cáo sự cố mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Tìm theo tiêu đề hoặc mã..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="NEW">Mới</option>
          <option value="IN_PROGRESS">Đang xử lý</option>
          <option value="RESOLVED">Đã giải quyết</option>
          <option value="CLOSED">Đã đóng</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Chưa có sự cố nào</h3>
            <p className="text-gray-500 dark:text-gray-400">Bạn chưa ghi nhận sự cố hoặc yêu cầu thiết bị nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Mã số</th>
                  <th className="px-6 py-4 font-medium">Tiêu đề</th>
                  <th className="px-6 py-4 font-medium">Phân loại</th>
                  <th className="px-6 py-4 font-medium">Trạng thái</th>
                  <th className="px-6 py-4 font-medium">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {incidents.map((incident) => {
                  const statusConf = getStatusConfig(incident.status);
                  const StatusIcon = statusConf.icon;
                  const isRequest = incident.title.includes('[Yêu cầu thiết bị]');
                  
                  return (
                    <tr key={incident.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">{incident.incidentNo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isRequest && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                              Yêu cầu
                            </span>
                          )}
                          <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {incident.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {getCategoryLabel(incident.category)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConf.color}`}>
                          <StatusIcon size={14} />
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {new Date(incident.reportedAt).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateIncidentModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchMyIncidents();
          }}
        />
      )}
    </div>
  );
}
