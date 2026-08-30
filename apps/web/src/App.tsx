import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LoginScreen } from './features/auth/LoginScreen';
import { MasterDataPage } from './features/master-data/MasterDataPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { AssetBookPage } from './features/assets/AssetBookPage';
import type { AppUser, BrandingSettings } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  
  // Temporary mock branding
  const branding: BrandingSettings = {
    appName: 'AssetBase',
    companyName: 'Công ty TNHH Demo',
    companyAddress: 'Hà Nội',
    handoverDepartment: 'IT',
    handoverFormCode: 'BM-IT-01',
    tagline: 'IT Asset Management',
    primaryColor: '#6653df',
    logoDataUrl: ''
  };

  const handleLogin = async (username: string) => {
    // Mock login for now until API is wired up
    setCurrentUser({
      id: 1,
      username,
      name: 'Admin User',
      email: 'admin@demo.com',
      role: 'Admin',
      departmentScope: ['*']
    });
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} branding={branding} />;
  }

  return (
    <Routes>
      <Route element={<MainLayout user={currentUser} branding={branding} logout={handleLogout} />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assets" element={<AssetBookPage />} />
        <Route path="/master-data" element={<MasterDataPage />} />
      </Route>
    </Routes>
  );
}
