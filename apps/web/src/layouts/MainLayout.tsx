import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
  Box, Building2, ChevronRight, HelpCircle, 
  LockKeyhole, LogOut, Menu, Search, Bell, Settings, History, QrCode, ClipboardList, FileSpreadsheet,
  Activity, Key
} from 'lucide-react';
import type { AppUser, BrandingSettings } from '../types';

export function MainLayout({ user, branding, logout }: { user: AppUser; branding: BrandingSettings; logout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const initials = user.name.split(' ').slice(-2).map(x => x[0]).join('');

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-3 text-indigo-600 font-bold text-lg">
            {branding.logoDataUrl ? (
              <img src={branding.logoDataUrl} alt="Logo" className="w-8 h-8" />
            ) : (
              <Box size={24} />
            )}
            {branding.appName}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
            <Box size={18} /> Tổng quan
          </NavLink>
          <NavLink to="/assets" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
            <Box size={18} /> Sổ tài sản
          </NavLink>
          <NavLink to="/entitlements" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
            <Key size={18} /> Tài sản số
          </NavLink>
          <NavLink to="/master-data" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
            <Settings size={18} /> Danh mục
          </NavLink>
          <NavLink to="/scanner" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
            <QrCode size={18} /> Barcode / QR
          </NavLink>
          <NavLink to="/inventory" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
            <ClipboardList size={18} /> Kiểm kê
          </NavLink>
          <NavLink to="/imports" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
            <FileSpreadsheet size={18} /> Nhập hàng loạt
          </NavLink>
          <NavLink to="/incidents" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
            <Activity size={18} /> Quản lý sự cố
          </NavLink>
          <NavLink to="/history" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
            <History size={18} /> Lịch sử / Audit
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-red-600 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <button onClick={() => setMenuOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-900">
            <Menu size={24} />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-500"><Search size={20} /></button>
            <button className="text-gray-400 hover:text-gray-500 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
