import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, CheckCircle2, Clock, 
  Search, Filter, Plus, ChevronRight, Activity 
} from 'lucide-react';
import { apiClient as api } from '../../lib/api-client';
import { Incident } from '../../types';
import { CreateIncidentModal } from '../user-portal/components/CreateIncidentModal';

export function IncidentListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [ticketTypeFilter, setTicketTypeFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: incidentsRes, isLoading } = useQuery({
    queryKey: ['incidents', statusFilter, ticketTypeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (ticketTypeFilter) params.append('ticketType', ticketTypeFilter);
      const url = `/incidents?${params.toString()}`;
      const res = await api.get<{ data: Incident[] }>(url);
      return res.data;
    },
  });

  const incidents = incidentsRes?.data || [];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'P1': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Rất cao</span>;
      case 'P2': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">Cao</span>;
      case 'P3': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Trung bình</span>;
      case 'P4': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Thấp</span>;
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

  const getTypeBadge = (type?: string) => {
    if (type === 'SERVICE_REQUEST') {
      return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">Yêu cầu DV</span>;
    }
    return <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-medium">Sự cố</span>;
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
        message: 'Trễ SLA (Resolution)', 
        color: 'text-red-600 bg-red-50 border-red-200' 
      };
    }
    
    const responseDue = new Date(incident.slaResponseDueAt);
    if (!incident.responseStartedAt && now > responseDue) {
      return { 
        breached: true, 
        message: 'Trễ SLA (Response)', 
        color: 'text-red-600 bg-red-50 border-red-200' 
      };
    }

    return { 
      breached: false, 
      message: 'Trong hạn SLA', 
      color: 'text-blue-600 bg-blue-50 border-blue-200' 
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Sự cố & Yêu cầu</h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi và xử lý các sự cố IT và yêu cầu dịch vụ
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Ticket
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Tìm kiếm theo mã số, tiêu đề..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            value={ticketTypeFilter}
            onChange={(e) => setTicketTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại</option>
            <option value="INCIDENT">Sự cố</option>
            <option value="SERVICE_REQUEST">Yêu cầu DV</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="NEW">Mới (New)</option>
            <option value="IN_PROGRESS">Đang xử lý</option>
            <option value="ON_HOLD">Tạm dừng</option>
            <option value="RESOLVED">Đã khắc phục</option>
            <option value="CLOSED">Đã đóng</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm">
              <th className="p-4 font-medium text-gray-600">Ticket No</th>
              <th className="p-4 font-medium text-gray-600">Loại</th>
              <th className="p-4 font-medium text-gray-600">Tiêu đề</th>
              <th className="p-4 font-medium text-gray-600">Mức độ</th>
              <th className="p-4 font-medium text-gray-600">Trạng thái</th>
              <th className="p-4 font-medium text-gray-600">Người báo cáo</th>
              <th className="p-4 font-medium text-gray-600">Hạn SLA</th>
              <th className="p-4 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
            {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">Đang tải danh sách sự cố...</td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
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
                      <td className="p-4">
                        {getTypeBadge(incident.ticketType)}
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

      {isCreateModalOpen && (
        <CreateIncidentModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => {
            setIsCreateModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
