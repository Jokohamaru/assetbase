import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, XCircle, ChevronRight, Download, RefreshCw, Trash2, ArrowRight } from 'lucide-react';
import { apiClient as api } from '../../lib/api-client';
import { AssetImportBatch, AssetImportRow } from '../../types';

export function ImportPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const { data: batchesRes, isLoading: isLoadingBatches } = useQuery({
    queryKey: ['imports'],
    queryFn: async () => {
      const res = await api.get<{ data: AssetImportBatch[] }>('/imports');
      return res.data;
    },
  });

  const { data: rowsRes, isLoading: isLoadingRows } = useQuery({
    queryKey: ['imports', selectedBatchId, 'rows'],
    queryFn: async () => {
      const res = await api.get<{ data: AssetImportRow[] }>(`/imports/${selectedBatchId}/rows?limit=100`);
      return res.data;
    },
    enabled: !!selectedBatchId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<{ data: AssetImportBatch }>('/imports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.data;
    },
    onSuccess: (newBatch) => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      setSelectedBatchId(newBatch.id);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err: any) => {
      alert(`Lỗi khi tải lên: ${err.response?.data?.error || err.message}`);
    }
  });

  const commitMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<{ data: AssetImportBatch }>(`/imports/${id}/commit`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      alert('Đã đồng bộ dữ liệu vào hệ thống thành công!');
    },
    onError: (err: any) => {
      alert(`Lỗi khi commit: ${err.response?.data?.error || err.message}`);
      queryClient.invalidateQueries({ queryKey: ['imports'] });
    }
  });

  const rollbackMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/imports/${id}/rollback`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      setSelectedBatchId(null);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
  };

  const batches = batchesRes?.data || [];
  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  const rows = rowsRes?.data || [];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'STAGED': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Bản nháp (Staged)</span>;
      case 'COMMITTED': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Đã đồng bộ</span>;
      case 'ROLLED_BACK': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">Đã hủy</span>;
      case 'ROLLBACK_FAILED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Lỗi đồng bộ</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Nhập dữ liệu hàng loạt
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tải lên file Excel/CSV để thêm mới tài sản số lượng lớn
          </p>
        </div>
        <button
          onClick={() => alert("Tính năng tải file mẫu chưa khả dụng.")}
          className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
        >
          <Download size={20} />
          Tải file mẫu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload & History */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 text-center">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              onChange={handleFileChange} 
            />
            
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {uploadMutation.isPending ? (
                <RefreshCw size={28} className="text-primary animate-spin" />
              ) : (
                <UploadCloud size={28} className="text-primary" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tải file lên</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Kéo thả file hoặc click để chọn file Excel (.xlsx, .csv).
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
            >
              {uploadMutation.isPending ? 'Đang tải lên và phân tích...' : 'Chọn file'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 shadow-sm border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-gray-900 dark:text-white">Lịch sử Import</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
              {isLoadingBatches ? (
                <div className="p-8 text-center text-gray-500">Đang tải...</div>
              ) : batches.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">Chưa có lịch sử import nào.</div>
              ) : (
                batches.map((batch) => (
                  <div 
                    key={batch.id} 
                    onClick={() => setSelectedBatchId(batch.id)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50 ${selectedBatchId === batch.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet size={16} className="text-gray-400" />
                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate max-w-[150px]" title={batch.sourceFileName}>
                          {batch.sourceFileName}
                        </span>
                      </div>
                      {getStatusBadge(batch.status)}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(batch.createdAt).toLocaleString('vi-VN')}</span>
                      <span>{batch.totalRows} dòng</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Action */}
        <div className="lg:col-span-2">
          {selectedBatch ? (
            <div className="bg-white dark:bg-slate-900 shadow-sm border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      Bản xem trước dữ liệu
                      {getStatusBadge(selectedBatch.status)}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      File: {selectedBatch.sourceFileName}
                    </p>
                  </div>
                  
                  {selectedBatch.status === 'STAGED' && (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => rollbackMutation.mutate(selectedBatch.id)}
                        disabled={rollbackMutation.isPending || commitMutation.isPending}
                        className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Trash2 size={16} /> Hủy bỏ
                      </button>
                      <button 
                        onClick={() => commitMutation.mutate(selectedBatch.id)}
                        disabled={commitMutation.isPending || rollbackMutation.isPending || selectedBatch.invalidRows > 0}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium shadow-sm flex items-center gap-2"
                      >
                        {commitMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                        Đồng bộ vào hệ thống
                      </button>
                    </div>
                  )}
                </div>

                {/* Validation Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium mb-1 uppercase">Tổng cộng</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBatch.totalRows} <span className="text-sm font-normal text-gray-500">dòng</span></p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1 uppercase">Hợp lệ</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-500">{selectedBatch.validRows} <span className="text-sm font-normal text-green-600/70">dòng</span></p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1 uppercase">Lỗi</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-500">{selectedBatch.invalidRows} <span className="text-sm font-normal text-red-600/70">dòng</span></p>
                  </div>
                </div>
                
                {selectedBatch.status === 'STAGED' && selectedBatch.invalidRows > 0 && (
                  <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-lg text-sm flex gap-2 items-start">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p>Không thể đồng bộ vì có {selectedBatch.invalidRows} dòng dữ liệu bị lỗi. Vui lòng kiểm tra lại file, sửa lỗi và tải lên lại (Hủy bản nháp này).</p>
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-slate-900/20 min-h-[400px]">
                {isLoadingRows ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw size={24} className="text-primary animate-spin" />
                  </div>
                ) : (
                  <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                    <thead className="bg-gray-100 dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="p-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">STT</th>
                        <th className="p-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">Mã tài sản</th>
                        <th className="p-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">Tên tài sản</th>
                        <th className="p-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">Danh mục</th>
                        <th className="p-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">Lỗi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                      {rows.map((row) => (
                        <tr key={row.id} className={`${row.status === 'INVALID' ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-white dark:hover:bg-slate-800/50'}`}>
                          <td className="p-3 text-gray-500 font-mono">{row.rowNumber}</td>
                          <td className="p-3 font-medium text-gray-900 dark:text-white">{row.payload.assetTag}</td>
                          <td className="p-3 text-gray-700 dark:text-gray-300 truncate max-w-[200px]" title={row.payload.name}>{row.payload.name}</td>
                          <td className="p-3 text-gray-700 dark:text-gray-300">{row.payload.categoryCode}</td>
                          <td className="p-3">
                            {row.status === 'INVALID' ? (
                              <div className="flex flex-col gap-1">
                                {row.errors.map((err, idx) => (
                                  <span key={idx} className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded inline-flex items-center gap-1">
                                    <XCircle size={10} /> {err.message}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-green-500"><CheckCircle2 size={16} /></span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-800 h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8">
              <FileSpreadsheet size={48} className="text-gray-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chưa chọn bản nháp nào</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                Vui lòng tải lên một file Excel mới hoặc chọn một bản nháp từ danh sách Lịch sử Import để xem trước.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
