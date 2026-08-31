import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShieldAlert, List, TrendingDown, Target, Edit, CheckCircle, Activity } from 'lucide-react';
import { apiClient as api } from '../../lib/api-client';
import { RiskAssessment, RiskItem, RiskLevel } from '../../types';

export function RiskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'register' | 'matrix'>('register');

  const { data: res, isLoading, refetch } = useQuery({
    queryKey: ['risk-assessment', id],
    queryFn: async () => {
      const response = await api.get<{ data: RiskAssessment }>(`/risk-assessments/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const assessment = res?.data;

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Đang tải thông tin...</div>;
  }

  if (!assessment) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy đợt đánh giá.</div>;
  }

  const getLevelBadge = (level: RiskLevel) => {
    switch (level) {
      case 'LOW': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">THẤP</span>;
      case 'MEDIUM': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">TRUNG BÌNH</span>;
      case 'HIGH': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">CAO</span>;
      case 'CRITICAL': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">NGHIÊM TRỌNG</span>;
      default: return null;
    }
  };

  const getLevelColor = (level: RiskLevel) => {
    switch (level) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-400';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-600';
      default: return 'bg-gray-200';
    }
  };

  // Matrix generation
  // 5x5 Matrix: Likelihood (Y) vs Impact (X). Origin (1,1) is bottom-left conventionally, but we can draw it top-down.
  // 5: Almost Certain, 4: Likely, 3: Possible, 2: Unlikely, 1: Rare
  // 5: Severe, 4: Major, 3: Moderate, 2: Minor, 1: Insignificant
  const matrix = Array(5).fill(0).map(() => Array(5).fill(0));
  
  (assessment.risks || []).forEach(risk => {
    if (risk.likelihood >= 1 && risk.likelihood <= 5 && risk.impact >= 1 && risk.impact <= 5) {
      // row = 5 - likelihood (so likelihood 5 is row 0)
      const row = 5 - risk.likelihood;
      // col = impact - 1 (so impact 1 is col 0)
      const col = risk.impact - 1;
      matrix[row][col]++;
    }
  });

  const getCellLevel = (l: number, i: number): RiskLevel => {
    const score = l * i;
    if (score <= 4) return 'LOW';
    if (score <= 9) return 'MEDIUM';
    if (score <= 16) return 'HIGH';
    return 'CRITICAL';
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/risks')}
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
      </button>

      {/* Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{assessment.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                assessment.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                assessment.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {assessment.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span className="font-mono">Mã: {assessment.assessmentNo}</span>
              <span>Bắt đầu: {new Date(assessment.startDate).toLocaleDateString('vi-VN')}</span>
              <span>Mục tiêu hoàn thành: {assessment.targetDate ? new Date(assessment.targetDate).toLocaleDateString('vi-VN') : 'Không có'}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Phạm vi (Scope):</span> {assessment.scope}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {assessment.status === 'SUBMITTED' && (
            <button 
              onClick={() => {
                api.put(`/risk-assessments/${id}/status`, { status: 'APPROVED' }).then(() => {
                  alert("Đã phê duyệt!");
                  refetch();
                });
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
            >
              <CheckCircle size={16} /> Phê duyệt
            </button>
          )}
          <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2 shadow-sm">
            <Edit size={16} /> Chỉnh sửa
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700 overflow-x-auto pb-[1px]">
        {[
          { id: 'register', icon: <List size={16} />, label: 'Danh mục Rủi ro (Risk Register)' },
          { id: 'matrix', icon: <Activity size={16} />, label: 'Ma trận (Risk Matrix)' }
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

      {activeTab === 'register' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Chi tiết các hạng mục Rủi ro</h3>
            <button className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
              + Thêm rủi ro
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="p-4 font-medium">Mã</th>
                  <th className="p-4 font-medium">Tiêu đề & Mối đe doạ</th>
                  <th className="p-4 font-medium text-center">Khả năng<br/>(Likelihood)</th>
                  <th className="p-4 font-medium text-center">Ảnh hưởng<br/>(Impact)</th>
                  <th className="p-4 font-medium text-center">Điểm<br/>(Score)</th>
                  <th className="p-4 font-medium">Mức độ gốc<br/>(Inherent)</th>
                  <th className="p-4 font-medium">Chiến lược</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {!assessment.risks || assessment.risks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">Chưa có rủi ro nào được ghi nhận.</td>
                  </tr>
                ) : (
                  assessment.risks.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer">
                      <td className="p-4 font-mono text-xs text-gray-500">{item.riskNo}</td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{item.threat}</div>
                      </td>
                      <td className="p-4 text-center font-medium">{item.likelihood}/5</td>
                      <td className="p-4 text-center font-medium">{item.impact}/5</td>
                      <td className="p-4 text-center font-bold text-gray-900 dark:text-white">{item.inherentScore}</td>
                      <td className="p-4">{getLevelBadge(item.inherentLevel)}</td>
                      <td className="p-4">
                        <span className="text-xs border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-gray-600 dark:text-gray-400">
                          {item.treatmentStrategy}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Ma trận Phân bổ Rủi ro (Heatmap)</h3>
            
            <div className="flex">
              {/* Y Axis Label */}
              <div className="flex flex-col justify-center mr-4">
                <div className="transform -rotate-90 text-sm font-medium text-gray-500 whitespace-nowrap">
                  Khả năng xảy ra (Likelihood)
                </div>
              </div>
              
              <div className="flex-1">
                {/* The Grid */}
                <div className="grid grid-rows-5 gap-1">
                  {[5, 4, 3, 2, 1].map((likelihood, rowIndex) => (
                    <div key={`row-${likelihood}`} className="flex gap-1">
                      <div className="w-8 flex items-center justify-center text-xs text-gray-400 font-medium">{likelihood}</div>
                      {[1, 2, 3, 4, 5].map((impact, colIndex) => {
                        const level = getCellLevel(likelihood, impact);
                        const count = matrix[rowIndex][colIndex];
                        
                        let bgColorClass = 'bg-gray-100 dark:bg-slate-800';
                        if (level === 'LOW') bgColorClass = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50';
                        if (level === 'MEDIUM') bgColorClass = 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50';
                        if (level === 'HIGH') bgColorClass = 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50';
                        if (level === 'CRITICAL') bgColorClass = 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50';

                        return (
                          <div 
                            key={`cell-${likelihood}-${impact}`}
                            className={`flex-1 h-12 flex items-center justify-center rounded-md font-bold transition-all hover:scale-105 cursor-default ${bgColorClass}`}
                            title={`Khả năng: ${likelihood}, Ảnh hưởng: ${impact} -> Mức: ${level}`}
                          >
                            {count > 0 ? count : ''}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                
                {/* X Axis Label */}
                <div className="flex mt-1">
                  <div className="w-8"></div>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={`x-${i}`} className="flex-1 flex justify-center text-xs text-gray-400 font-medium pt-2">{i}</div>
                  ))}
                </div>
                <div className="text-center text-sm font-medium text-gray-500 mt-2">
                  Mức độ ảnh hưởng (Impact)
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 grid grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500"></div> 1-4: Thấp</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-yellow-400"></div> 5-9: Trung bình</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500"></div> 10-16: Cao</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-600"></div> 17-25: Nghiêm trọng</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Thống kê theo mức độ</h3>
            <div className="space-y-4">
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => {
                const count = (assessment.risks || []).filter(r => r.inherentLevel === level).length;
                const total = Math.max(1, (assessment.risks || []).length);
                const percentage = Math.round((count / total) * 100);
                
                return (
                  <div key={level}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{level}</span>
                      <span className="text-gray-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getLevelColor(level as RiskLevel)}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
