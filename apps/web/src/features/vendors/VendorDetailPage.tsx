import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, MapPin, Mail, Phone, FileText, Star, Edit, Key, StarHalf, Shield } from 'lucide-react';
import { apiClient as api } from '../../lib/api-client';
import { Vendor } from '../../types';

export function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'entitlements' | 'evaluation'>('info');
  
  // Evaluation state
  const [evalScores, setEvalScores] = useState<Record<string, number>>({
    'Chất lượng dịch vụ': 5,
    'Thời gian phản hồi': 5,
    'Chi phí/Giá cả': 5,
    'Hỗ trợ kỹ thuật': 5,
  });

  const { data: vendorRes, isLoading, refetch } = useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const response = await api.get<{ data: Vendor }>(`/vendors/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const vendor = vendorRes?.data;

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Đang tải thông tin...</div>;
  }

  if (!vendor) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy đối tác.</div>;
  }

  const handleEvaluate = async () => {
    try {
      await api.post(`/vendors/${id}/evaluate`, { scores: evalScores });
      alert('Đánh giá thành công!');
      refetch();
    } catch (err) {
      alert('Lỗi khi đánh giá');
    }
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={18} 
            className={star <= score ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
          />
        ))}
      </div>
    );
  };

  const renderInteractiveStars = (criterion: string, currentScore: number) => {
    return (
      <div className="flex items-center gap-1 cursor-pointer">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={24} 
            onClick={() => setEvalScores(prev => ({...prev, [criterion]: star}))}
            className={`transition-colors ${star <= currentScore ? "text-yellow-400 fill-yellow-400 hover:text-yellow-500 hover:fill-yellow-500" : "text-gray-300 hover:text-yellow-200"}`} 
          />
        ))}
      </div>
    );
  };

  let parsedScores = {};
  if (vendor.scores && typeof vendor.scores === 'string') {
    try { parsedScores = JSON.parse(vendor.scores); } catch (e) {}
  } else if (vendor.scores && typeof vendor.scores === 'object') {
    parsedScores = vendor.scores;
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/vendors')}
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Building2 size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{vendor.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                vendor.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                vendor.status === 'WARNING' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {vendor.status === 'ACTIVE' ? 'Đang hợp tác' : vendor.status === 'WARNING' ? 'Chú ý' : 'Ngừng hợp tác'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-mono">Mã: {vendor.code}</span>
              <span>MST: {vendor.taxCode || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors text-sm flex items-center gap-2">
            <Edit size={16} /> Chỉnh sửa
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700 overflow-x-auto pb-[1px]">
        {[
          { id: 'info', icon: <FileText size={16} />, label: 'Thông tin chung' },
          { id: 'entitlements', icon: <Key size={16} />, label: 'Tài sản & Dịch vụ' },
          { id: 'evaluation', icon: <Star size={16} />, label: 'Đánh giá (Evaluation)' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Liên hệ & Địa chỉ</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-gray-500">Người đại diện (Contact)</div>
                  <div className="font-medium text-gray-900 dark:text-white">{vendor.contact}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium text-gray-900 dark:text-white">{vendor.email || '-'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-gray-500">Số điện thoại</div>
                  <div className="font-medium text-gray-900 dark:text-white">{vendor.phone || '-'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-gray-500">Địa chỉ</div>
                  <div className="font-medium text-gray-900 dark:text-white">{vendor.address || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lĩnh vực & Bằng cấp</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Lĩnh vực cung cấp (Category)</div>
                  <div className="font-medium text-gray-900 dark:text-white">{vendor.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Shield size={16}/> Chứng chỉ / Đối tác uỷ quyền</div>
                  <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                    {vendor.certifications || 'Chưa cập nhật thông tin chứng chỉ'}
                  </div>
                </div>
              </div>
            </div>

            {vendor.notes && (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Ghi chú nội bộ</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{vendor.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'entitlements' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Tài sản Số & Hợp đồng</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="p-4 font-medium">Tên tài sản</th>
                  <th className="p-4 font-medium">Loại</th>
                  <th className="p-4 font-medium">Số lượng</th>
                  <th className="p-4 font-medium">Hạn sử dụng</th>
                  <th className="p-4 font-medium text-right">Chi phí</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {!vendor.entitlements || vendor.entitlements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">Chưa có tài sản/dịch vụ nào từ nhà cung cấp này.</td>
                  </tr>
                ) : (
                  vendor.entitlements.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate(`/entitlements/${item.id}`)}>
                      <td className="p-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">{item.type}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">{item.totalQuantity}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300 text-right">
                        {item.purchaseCost ? `${Number(item.purchaseCost).toLocaleString('vi-VN')} ${item.currency}` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'evaluation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center">
              <div className="text-gray-500 font-medium mb-2">ĐIỂM TRUNG BÌNH</div>
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">{vendor.score > 0 ? vendor.score : '-'} <span className="text-xl text-gray-400 font-normal">/ 5</span></div>
              <div className="mb-4">{renderStars(vendor.score)}</div>
              <div className="text-xs text-gray-500">
                Đánh giá lần cuối: {vendor.lastEvaluation ? new Date(vendor.lastEvaluation).toLocaleDateString('vi-VN') : 'Chưa đánh giá'}
              </div>
            </div>

            {Object.keys(parsedScores).length > 0 && (
              <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Chi tiết điểm số hiện tại</h3>
                <div className="space-y-4">
                  {Object.entries(parsedScores).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{key}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{val as number}/5</span>
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <StarHalf className="text-yellow-500" /> Đánh giá định kỳ
                </h3>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-medium">Chỉ dành cho Manager</span>
              </div>
              
              <div className="space-y-6">
                {Object.keys(evalScores).map((criterion) => (
                  <div key={criterion} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                    <div className="mb-2 sm:mb-0">
                      <div className="font-medium text-gray-900 dark:text-white">{criterion}</div>
                    </div>
                    {renderInteractiveStars(criterion, evalScores[criterion])}
                  </div>
                ))}
                
                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={handleEvaluate}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Lưu kết quả đánh giá
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
