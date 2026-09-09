import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, AlertTriangle, User, Calendar, 
  MapPin, CheckCircle2, Save, MoreVertical,
  LifeBuoy
} from 'lucide-react';
import { apiClient as api } from '../../lib/api-client';
import { Incident } from '../../types';
import { FulfillRequestModal } from '../assets/components/FulfillRequestModal';

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: '',
    note: '',
    resolution: '',
    rootCause: ''
  });

  const [commentNote, setCommentNote] = useState('');
  const [commentType, setCommentType] = useState<'COMMENT' | 'NOTE'>('COMMENT');

  const { data: incidentRes, isLoading } = useQuery({
    queryKey: ['incidents', id],
    queryFn: async () => {
      const res = await api.get<{ data: Incident }>(`/incidents/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  const addActivityMutation = useMutation({
    mutationFn: async (payload: { type: string; note: string }) => {
      const res = await api.post(`/incidents/${id}/activities`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents', id] });
      setCommentNote('');
    },
    onError: (err: any) => {
      alert(`Lỗi khi gửi bình luận: ${err.response?.data?.error || err.message}`);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put<{ data: Incident }>(`/incidents/${id}/status`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents', id] });
      setIsUpdatingStatus(false);
      setStatusForm({ status: '', note: '', resolution: '', rootCause: '' });
      alert('Đã cập nhật trạng thái sự cố!');
    },
    onError: (err: any) => {
      alert(`Lỗi cập nhật: ${err.response?.data?.error || err.message}`);
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center">Đang tải chi tiết sự cố...</div>;
  }

  const incident = incidentRes?.data;
  if (!incident) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy sự cố!</div>;
  }

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

  const checkSLAStatus = (dueAt: string, completedAt?: string) => {
    if (completedAt) {
      return { breached: new Date(completedAt) > new Date(dueAt), message: 'Hoàn thành' };
    }
    const now = new Date();
    const due = new Date(dueAt);
    return { breached: now > due, message: now > due ? 'Vi phạm SLA' : 'Trong SLA' };
  };

  const slaResponse = checkSLAStatus(incident.slaResponseDueAt, incident.responseStartedAt);
  const slaResolution = checkSLAStatus(incident.slaResolutionDueAt, incident.resolvedAt);

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusForm.status) return alert('Vui lòng chọn trạng thái mới');
    if (!statusForm.note) return alert('Vui lòng nhập ghi chú xử lý');
    updateStatusMutation.mutate(statusForm);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/incidents')}
            className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {incident.title}
              </h1>
              {getStatusBadge(incident.status)}
              {getPriorityBadge(incident.priority)}
            </div>
            <p className="text-gray-500 font-mono text-sm mt-1">{incident.incidentNo} • Đã báo cáo: {new Date(incident.reportedAt).toLocaleString('vi-VN')}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {incident.ticketType === 'SERVICE_REQUEST' && incident.status !== 'CLOSED' && incident.status !== 'RESOLVED' && (
            <button 
              onClick={() => setIsFulfillModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              Cấp phát tài sản
            </button>
          )}

          {!isUpdatingStatus && incident.status !== 'CLOSED' && (
            <button 
              onClick={() => {
                setIsUpdatingStatus(true);
                setStatusForm(f => ({ ...f, status: incident.status }));
              }}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              Cập nhật xử lý
            </button>
          )}
          <button className="p-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-gray-600">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Update Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SLA Dashboards */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${slaResponse.breached ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">SLA Phản hồi (Response)</span>
                {slaResponse.breached ? <AlertTriangle size={18} className="text-red-500" /> : <Clock size={18} className="text-gray-400" />}
              </div>
              <div className={`text-xl font-bold ${slaResponse.breached ? 'text-red-700' : 'text-gray-900 dark:text-white'}`}>
                {incident.responseStartedAt ? 'Đã phản hồi' : slaResponse.message}
              </div>
              <div className="text-xs text-gray-500 mt-1">Hạn chót: {new Date(incident.slaResponseDueAt).toLocaleString('vi-VN')}</div>
            </div>

            <div className={`p-4 rounded-xl border ${slaResolution.breached ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">SLA Khắc phục (Resolution)</span>
                {slaResolution.breached ? <AlertTriangle size={18} className="text-red-500" /> : <Clock size={18} className="text-gray-400" />}
              </div>
              <div className={`text-xl font-bold ${slaResolution.breached ? 'text-red-700' : 'text-gray-900 dark:text-white'}`}>
                {incident.resolvedAt ? 'Đã khắc phục' : slaResolution.message}
              </div>
              <div className="text-xs text-gray-500 mt-1">Hạn chót: {new Date(incident.slaResolutionDueAt).toLocaleString('vi-VN')}</div>
            </div>
          </div>

          {/* Status Update Form */}
          {isUpdatingStatus && (
            <form onSubmit={handleUpdateSubmit} className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cập nhật xử lý sự cố</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Đổi trạng thái sang</label>
                    <select 
                      value={statusForm.status}
                      onChange={e => setStatusForm({...statusForm, status: e.target.value})}
                      className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="NEW">Mới (New)</option>
                      <option value="IN_PROGRESS">Đang xử lý (In Progress)</option>
                      <option value="ON_HOLD">Tạm dừng (On Hold)</option>
                      <option value="RESOLVED">Khắc phục xong (Resolved)</option>
                      <option value="CLOSED">Đóng (Closed)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú (bắt buộc)</label>
                  <textarea 
                    required
                    rows={3}
                    value={statusForm.note}
                    onChange={e => setStatusForm({...statusForm, note: e.target.value})}
                    placeholder="Ghi chú quá trình xử lý hoặc lý do đổi trạng thái..."
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {(statusForm.status === 'RESOLVED' || statusForm.status === 'CLOSED') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hướng giải quyết (Resolution)</label>
                      <textarea 
                        rows={2}
                        value={statusForm.resolution}
                        onChange={e => setStatusForm({...statusForm, resolution: e.target.value})}
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nguyên nhân gốc (Root Cause)</label>
                      <input 
                        type="text"
                        value={statusForm.rootCause}
                        onChange={e => setStatusForm({...statusForm, rootCause: e.target.value})}
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsUpdatingStatus(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    disabled={updateStatusMutation.isPending}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                  >
                    {updateStatusMutation.isPending ? 'Đang lưu...' : <><Save size={16} /> Lưu cập nhật</>}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Detail Description */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Mô tả sự cố</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {incident.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Meta & Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Thông tin báo cáo</h3>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-2"><User size={16} /> Người báo cáo</span>
                <span className="font-medium text-gray-900 dark:text-white">{incident.reporterName}</span>
              </div>
              {(incident as any).reporterContact && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2">📱 Liên hệ / Vị trí</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{(incident as any).reporterContact}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-2"><Calendar size={16} /> Thời gian</span>
                <span className="text-gray-900 dark:text-white">{new Date(incident.reportedAt).toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-2"><LifeBuoy size={16} /> Danh mục</span>
                <span className="text-gray-900 dark:text-white">{incident.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-2"><MapPin size={16} /> Mức độ ảnh hưởng</span>
                <span className="text-gray-900 dark:text-white">{incident.impact}</span>
              </div>

              {(() => {
                let details: any = {};
                try {
                  if (typeof incident.requestDetails === 'string') {
                    details = JSON.parse(incident.requestDetails);
                  } else if (incident.requestDetails) {
                    details = incident.requestDetails;
                  }
                } catch(e) {}
                
                if (!details || Object.keys(details).length === 0) return null;

                return (
                  <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-3">
                    <p className="font-medium text-xs text-gray-400 uppercase tracking-wider">Chi tiết Yêu cầu</p>
                    {details.purpose && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Mục đích</span>
                        <span className="font-medium text-gray-900 dark:text-white">{details.purpose}</span>
                      </div>
                    )}
                    {details.requestedFor && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Đối tượng nhận</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">{details.requestedFor}</span>
                      </div>
                    )}
                    {details.requiredDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Ngày cần nhận</span>
                        <span className="font-medium text-amber-600 dark:text-amber-400">{details.requiredDate}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Activity Timeline & Comment Box */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">Trao đổi & Dòng thời gian</h3>
              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCommentType('COMMENT')}
                  className={`px-2 py-1 rounded font-medium ${commentType === 'COMMENT' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Bình luận
                </button>
                <button
                  type="button"
                  onClick={() => setCommentType('NOTE')}
                  className={`px-2 py-1 rounded font-medium ${commentType === 'NOTE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Ghi chú nội bộ
                </button>
              </div>
            </div>

            <div className="p-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!commentNote.trim()) return;
                  addActivityMutation.mutate({ type: commentType, note: commentNote.trim() });
                }}
                className="space-y-3"
              >
                <textarea
                  required
                  rows={2}
                  value={commentNote}
                  onChange={(e) => setCommentNote(e.target.value)}
                  placeholder={commentType === 'COMMENT' ? "Nhập tin nhắn / phản hồi gửi cho người báo cáo..." : "Nhập ghi chú kỹ thuật nội bộ (chỉ IT thấy)..."}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 text-sm bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={addActivityMutation.isPending || !commentNote.trim()}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${commentType === 'COMMENT' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                  >
                    {addActivityMutation.isPending ? 'Đang gửi...' : commentType === 'COMMENT' ? 'Gửi bình luận' : 'Lưu ghi chú nội bộ'}
                  </button>
                </div>
              </form>
            </div>

            <div className="p-5">
              {(!incident.activities || incident.activities.length === 0) ? (
                <div className="text-sm text-gray-500 text-center py-4">Chưa có hoạt động nào</div>
              ) : (
                <div className="relative border-l border-gray-200 dark:border-slate-700 ml-3 space-y-6">
                  {incident.activities.map((activity) => (
                    <div key={activity.id} className="pl-6 relative">
                      <div className={`absolute w-3 h-3 rounded-full -left-1.5 top-1.5 ring-4 ring-white dark:ring-slate-900 ${
                        activity.type === 'COMMENT' ? 'bg-indigo-600' :
                        activity.type === 'NOTE' ? 'bg-amber-500' :
                        activity.type === 'FULFILLED' ? 'bg-green-600' : 'bg-primary'
                      }`}></div>
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          {activity.type === 'STATUS_CHANGE' && `Chuyển sang ${activity.toStatus}`}
                          {activity.type === 'CREATED' && `Đã ghi nhận sự cố`}
                          {activity.type === 'ASSIGNMENT' && `Cập nhật người xử lý`}
                          {activity.type === 'FULFILLED' && `Đã cấp phát thiết bị`}
                          {activity.type === 'COMMENT' && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                              Bình luận
                            </span>
                          )}
                          {activity.type === 'NOTE' && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                              Ghi chú nội bộ
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(activity.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                        {activity.note}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isFulfillModalOpen && (
        <FulfillRequestModal 
          isOpen={isFulfillModalOpen} 
          onClose={() => setIsFulfillModalOpen(false)} 
          request={incident} 
        />
      )}
    </div>
  );
}
