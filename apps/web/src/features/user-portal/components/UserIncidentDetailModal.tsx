import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Send, AlertCircle, Clock, CheckCircle, Package, User } from 'lucide-react';
import { apiClient as api } from '../../../lib/api-client';
import type { Incident } from '../../../types';

interface Props {
  incidentId: string | null;
  onClose: () => void;
}

export function UserIncidentDetailModal({ incidentId, onClose }: Props) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const { data: incidentRes, isLoading } = useQuery({
    queryKey: ['incidents', incidentId],
    queryFn: async () => {
      const res = await api.get<{ data: Incident }>(`/incidents/${incidentId}`);
      return res.data;
    },
    enabled: !!incidentId
  });

  const addCommentMutation = useMutation({
    mutationFn: async (note: string) => {
      const res = await api.post(`/incidents/${incidentId}/activities`, {
        type: 'COMMENT',
        note
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents', incidentId] });
      setCommentText('');
    },
    onError: (err: any) => {
      alert(`Lỗi khi gửi bình luận: ${err.response?.data?.error || err.message}`);
    }
  });

  if (!incidentId) return null;

  const incident = incidentRes?.data;

  const getStatusBadge = (status?: string) => {
    switch(status) {
      case 'NEW': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Mới tiếp nhận</span>;
      case 'IN_PROGRESS': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Đang xử lý</span>;
      case 'RESOLVED': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Đã giải quyết</span>;
      case 'CLOSED': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Đã đóng</span>;
      default: return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {incident?.incidentNo || 'Đang tải...'}
              </span>
              {incident && getStatusBadge(incident.status)}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {incident?.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading || !incident ? (
            <div className="p-8 text-center text-gray-500">Đang tải thông tin chi tiết...</div>
          ) : (
            <>
              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg text-sm border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-gray-500 block text-xs">Loại Ticket</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {incident.ticketType === 'SERVICE_REQUEST' ? 'Yêu cầu cấp phát' : 'Báo cáo sự cố'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Thời gian gửi</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(incident.reportedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                {incident.reporterContact && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-xs">Thông tin liên hệ / Vị trí chỗ ngồi</span>
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                      {incident.reporterContact}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Mô tả nội dung</h3>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {incident.description}
                </div>
              </div>

              {/* Timeline & Activities */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Tiến độ & Nhật ký phản hồi
                </h3>
                {(!incident.activities || incident.activities.length === 0) ? (
                  <div className="text-sm text-gray-400 italic">Chưa có cập nhật nào từ IT.</div>
                ) : (
                  <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-4">
                    {incident.activities
                      .filter(act => act.type !== 'NOTE') // Hide internal IT notes from user
                      .map((act) => (
                        <div key={act.id} className="pl-6 relative text-sm">
                          <div className={`absolute w-2.5 h-2.5 rounded-full -left-1.25 top-1.5 ring-4 ring-white dark:ring-gray-900 ${
                            act.type === 'COMMENT' ? 'bg-indigo-600' :
                            act.type === 'FULFILLED' ? 'bg-green-600' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {act.type === 'CREATED' && 'Phiếu đã được tạo'}
                              {act.type === 'STATUS_CHANGE' && `Trạng thái: ${act.toStatus}`}
                              {act.type === 'FULFILLED' && 'Đã cấp phát thiết bị'}
                              {act.type === 'COMMENT' && 'Phản hồi'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(act.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                            {act.note}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Send Comment Form */}
              <form onSubmit={handleSend} className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gửi phản hồi / Nhắn tin cho IT
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Nhập nội dung trao đổi..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={addCommentMutation.isPending || !commentText.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send size={16} />
                    {addCommentMutation.isPending ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
