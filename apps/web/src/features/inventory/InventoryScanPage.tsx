import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ScanLine, Search, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient as api } from '../../lib/api-client';
import { InventorySession, InventoryItem } from '../../types';

export function InventoryScanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' } | null>(null);
  
  // This is a simplified scanner page. 
  // In a real implementation, you would integrate a BarcodeDetector or html5-qrcode here.
  
  const { data: response, isLoading } = useQuery({
    queryKey: ['inventories', id],
    queryFn: async () => {
      const res = await api.get<{ data: InventorySession }>(`/inventories/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const scanMutation = useMutation({
    mutationFn: async (barcode: string) => {
      const res = await api.post<{ data: InventoryItem }>(`/inventories/${id}/scan`, { barcode });
      return res.data.data;
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['inventories', id] });
      
      if (item.result === 'MATCHED') {
        setMessage({ text: `Quét thành công: ${item.asset?.name} (${item.asset?.assetTag}) - Khớp`, type: 'success' });
      } else if (item.result === 'UNEXPECTED') {
        setMessage({ text: `Tài sản dư/lạc vào: ${item.asset?.name} (${item.asset?.assetTag})`, type: 'warning' });
      } else if (item.result === 'LOCATION_MISMATCH') {
        setMessage({ text: `Sai vị trí: ${item.asset?.name} (${item.asset?.assetTag})`, type: 'warning' });
      } else {
        setMessage({ text: `Đã quét: ${item.asset?.name} (${item.asset?.assetTag})`, type: 'success' });
      }
      
      setCode(''); // Reset input
    },
    onError: (error: any) => {
      setMessage({ text: error.response?.data?.error || 'Mã tài sản không tồn tại trong hệ thống', type: 'error' });
      setCode('');
    }
  });

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    scanMutation.mutate(code.trim());
  };

  const session = response?.data;

  if (isLoading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  if (!session) return <div className="p-8 text-center text-red-500">Không tìm thấy đợt kiểm kê</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(`/inventory/${id}`)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Quét kiểm kê
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {session.name} ({session.inventoryNo})
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
          message.type === 'warning' ? 'bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
          'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {message.type === 'success' && <CheckCircle2 size={20} className="mt-0.5 shrink-0" />}
          {message.type === 'warning' && <AlertCircle size={20} className="mt-0.5 shrink-0" />}
          {message.type === 'error' && <AlertCircle size={20} className="mt-0.5 shrink-0" />}
          <div>
            <p className="font-medium">{message.text}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
        <div className="w-48 h-48 bg-gray-100 dark:bg-slate-800 rounded-xl mb-6 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 relative overflow-hidden group">
          <ScanLine size={64} className="text-gray-400 group-hover:text-primary transition-colors" />
          <div className="absolute inset-0 bg-primary/10 -translate-y-full group-hover:translate-y-full duration-1000 transition-transform"></div>
        </div>
        
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Quét Barcode / QR Code
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          Sử dụng máy quét hoặc camera để quét mã tài sản.
        </p>

        <div className="w-full max-w-sm">
          <div className="relative flex items-center mb-4">
            <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">HOẶC NHẬP TAY</span>
            <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
          </div>
          
          <form onSubmit={handleManualScan} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                autoFocus
                placeholder="Nhập mã barcode/serial..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center uppercase tracking-wider"
              />
            </div>
            <button 
              type="submit"
              disabled={scanMutation.isPending || !code.trim()}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-colors font-medium flex items-center justify-center min-w-[100px]"
            >
              {scanMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : 'Gửi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
