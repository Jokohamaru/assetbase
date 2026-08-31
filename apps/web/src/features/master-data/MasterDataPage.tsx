import React, { useState } from 'react';
import { Building2, MapPin, Tags, Box, Plus, Pencil, Trash2, User } from 'lucide-react';
import { useDepartments, useLocations, useCategories, useManufacturers, useUsers } from '../../hooks/useMasterData';
import { UserFormModal } from './UserFormModal';

type Tab = 'departments' | 'locations' | 'categories' | 'manufacturers' | 'users';

export function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<Tab>('departments');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  const { data: departments = [], isLoading: isLoadingDept } = useDepartments();
  const { data: locations = [], isLoading: isLoadingLoc } = useLocations();
  const { data: categories = [], isLoading: isLoadingCat } = useCategories();
  const { data: manufacturers = [], isLoading: isLoadingMan } = useManufacturers();
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();

  const tabs = [
    { id: 'departments', label: 'Phòng ban', icon: Building2, data: departments, isLoading: isLoadingDept },
    { id: 'locations', label: 'Kho & Vị trí', icon: MapPin, data: locations, isLoading: isLoadingLoc },
    { id: 'categories', label: 'Nhóm tài sản', icon: Tags, data: categories, isLoading: isLoadingCat },
    { id: 'manufacturers', label: 'Nhà sản xuất', icon: Box, data: manufacturers, isLoading: isLoadingMan },
    { id: 'users', label: 'Người dùng', icon: User, data: users, isLoading: isLoadingUsers },
  ] as const;

  const currentTab = tabs.find(t => t.id === activeTab);
  const data = currentTab?.data || [];
  const isLoading = currentTab?.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Danh mục hệ thống</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Quản lý các dữ liệu danh mục gốc của hệ thống AssetFlow</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
        <div className="border-b border-gray-200 dark:border-gray-800 transition-colors">
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
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-700'
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
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 transition-colors">
              {currentTab?.label}
            </h2>
            <button 
              onClick={() => {
                if (activeTab === 'users') {
                  setIsUserModalOpen(true);
                } else {
                  // handle other tabs add
                }
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus size={16} /> Thêm mới
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg transition-colors">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 transition-colors">
                {activeTab === 'users' ? (
                  <tr>
                    <th className="px-6 py-3 font-medium">Mã NV</th>
                    <th className="px-6 py-3 font-medium">Họ tên</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Vai trò</th>
                    <th className="px-6 py-3 font-medium">Trạng thái</th>
                    <th className="px-6 py-3 font-medium w-24">Thao tác</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-3 font-medium">Mã</th>
                    <th className="px-6 py-3 font-medium">Tên</th>
                    <th className="px-6 py-3 font-medium">Ngày tạo</th>
                    <th className="px-6 py-3 font-medium w-24">Thao tác</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
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
                    activeTab === 'users' ? (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">{item.employeeCode}</td>
                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                          <div className="font-medium">{item.fullName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">@{item.username}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {item.status}
                          </span>
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
                    ) : (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">{item.code || item.id}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.name}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
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
                    )
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <UserFormModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} />
    </div>
  );
}
