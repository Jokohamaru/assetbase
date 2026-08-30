import React, { useState } from 'react';
import { Building2, MapPin, Tags, Box, Plus, Pencil, Trash2 } from 'lucide-react';
import { useDepartments, useLocations, useCategories, useManufacturers } from '../../hooks/useMasterData';

type Tab = 'departments' | 'locations' | 'categories' | 'manufacturers';

export function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<Tab>('departments');
  
  const { data: departments = [], isLoading: isLoadingDept } = useDepartments();
  const { data: locations = [], isLoading: isLoadingLoc } = useLocations();
  const { data: categories = [], isLoading: isLoadingCat } = useCategories();
  const { data: manufacturers = [], isLoading: isLoadingMan } = useManufacturers();

  const tabs = [
    { id: 'departments', label: 'Phòng ban', icon: Building2, data: departments, isLoading: isLoadingDept },
    { id: 'locations', label: 'Kho & Vị trí', icon: MapPin, data: locations, isLoading: isLoadingLoc },
    { id: 'categories', label: 'Nhóm tài sản', icon: Tags, data: categories, isLoading: isLoadingCat },
    { id: 'manufacturers', label: 'Nhà sản xuất', icon: Box, data: manufacturers, isLoading: isLoadingMan },
  ] as const;

  const currentTab = tabs.find(t => t.id === activeTab);
  const data = currentTab?.data || [];
  const isLoading = currentTab?.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Danh mục hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các dữ liệu danh mục gốc của hệ thống AssetFlow</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px px-4 gap-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {currentTab?.label}
            </h2>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus size={16} /> Thêm mới
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-medium">Mã</th>
                  <th className="px-6 py-3 font-medium">Tên</th>
                  <th className="px-6 py-3 font-medium">Ngày tạo</th>
                  <th className="px-6 py-3 font-medium w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-indigo-600 animate-pulse"></div>
                        <div className="w-4 h-4 rounded-full bg-indigo-600 animate-pulse delay-75"></div>
                        <div className="w-4 h-4 rounded-full bg-indigo-600 animate-pulse delay-150"></div>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Chưa có dữ liệu cho danh mục này.
                    </td>
                  </tr>
                ) : (
                  data.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-medium">{item.code || item.id}</td>
                      <td className="px-6 py-4 text-gray-600">{item.name}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                            <Pencil size={16} />
                          </button>
                          <button className="text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
