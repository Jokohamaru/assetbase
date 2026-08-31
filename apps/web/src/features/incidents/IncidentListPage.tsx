import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, CheckCircle2, Clock, 
  Search, Filter, Plus, ChevronRight, Activity 
} from 'lucide-react';
import { apiClient as api } from '../../lib/api-client';
import { Incident } from '../../types';

export function IncidentListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: incidentsRes, isLoading } = useQuery({
    queryKey: ['incidents', statusFilter],
    queryFn: async () => {
      const url = statusFilter ? `/incidents?status=${statusFilter}` : '/incidents';
      const res = await api.get<{ data: Incident[] }>(url);
      return res.data;
    },
  });

  const incidents = incidentsRes?.data || [];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'P1': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">P1 - Rất cao</span>;
      case 'P2': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">P2 - Cao</span>;
      case 'P3': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">P3 - Trung bình</span>;
      case 'P4': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">P4 - Thấp</span>;
      default: return <span>{priority}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">Mới (New)</span>;
      case 'IN_PROGRESS': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Đang xử lý</span>;
      case 'ON_HOLD': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Tạm dừng</span>;
      case 'RESOLVED': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Đã khắc phục</span>;
      case 'CLOSED': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">Đã đóng</span>;
      default: return <span>{status}</span>;
    }
  };

  const checkSLAStatus = (incident: Incident) => {
    if (incident.status === 'RESOLVED' || incident.status === 'CLOSED') {
      return { 
        breached: false, 
        message: 'Hoàn thành', 
        color: 'text-green-600 bg-green-50 border-green-200' 
      };
    }
    
    const now = new Date();
    const resolutionDue = new Date(incident.slaResolutionDueAt);
    
    if (now > resolutionDue) {
      return { 
        breached: true, 
        message: 'Vi phạm SLA', 
        color: 'text-red-600 bg-red-50 border-red-200 animate-pulse' 
      };
    }
    
    const timeDiff = resolutionDue.getTime() - now.getTime();
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    
    if (hoursLeft < 2) {
      return { 
        breached: false, 
        message: `Còn < ${hoursLeft + 1} giờ`, 
        color: 'text-orange-600 bg-orange-50 border-orange-200' 
      };
    }
    
    return { 
      breached: false, 
      message: 'Trong SLA', 
      color: 'text-gray-600 bg-gray-50 border-gray-200' 
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="text-primary" /> Quản lý Sự cố (Incidents)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Theo dõi, phân công và xử lý các sự cố IT kèm SLA
          </p>
        </div>
        <button
          onClick={() => alert("Tính năng thêm sự cố chưa khả dụng")}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Báo cáo sự cố
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-slate-800/20">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm mã sự cố..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Filter size={16} /> Lọc:
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="NEW">Mới (New)</option>
              <option value="IN_PROGRESS">Đang xử lý (In Progress)</option>
              <option value="RESOLVED">Đã khắc phục (Resolved)</option>
              <option value="CLOSED">Đã đóng (Closed)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="p-4 font-medium">Mã sự cố</th>
                <th className="p-4 font-medium">Tiêu đề</th>
                <th className="p-4 font-medium">Mức độ</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Người báo cáo</th>
                <th className="p-4 font-medium">Hạn SLA</th>
                <th className="p-4 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Đang tải danh sách sự cố...</td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle2 size={40} className="text-gray-300 mb-2" />
                      <p>Tuyệt vời! Hiện không có sự cố nào.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                incidents.map((incident) => {
                  const sla = checkSLAStatus(incident);
                  
                  return (
                    <tr 
                      key={incident.id} 
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/incidents/${incident.id}`)}
                    >
                      <td className="p-4 font-mono font-medium text-primary">
                        {incident.incidentNo}
                      </td>
                      <td className="p-4 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">
                        {incident.title}
                        <div className="text-xs text-gray-500 font-normal mt-0.5">{incident.category}</div>
                      </td>
                      <td className="p-4">
                        {getPriorityBadge(incident.priority)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(incident.status)}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">
                        {incident.reporterName}
                        <div className="text-xs text-gray-400 mt-0.5">{new Date(incident.reportedAt).toLocaleString('vi-VN')}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 border rounded-full text-xs font-medium flex items-center gap-1 w-max ${sla.color}`}>
                          {sla.breached ? <AlertTriangle size={12} /> : <Clock size={12} />}
                          {sla.message}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">
                        <ChevronRight size={18} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
