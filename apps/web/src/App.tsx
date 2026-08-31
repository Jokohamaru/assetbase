import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LoginScreen } from './features/auth/LoginScreen';
import { MasterDataPage } from './features/master-data/MasterDataPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { AssetBookPage } from './features/assets/AssetBookPage';
import { TransactionHistoryPage } from './features/reports/TransactionHistoryPage';
import { ScannerPage } from './features/scanner/ScannerPage';
import { InventoryListPage } from './features/inventory/InventoryListPage';
import { InventoryDetailPage } from './features/inventory/InventoryDetailPage';
import { ImportPage } from './features/import/ImportPage';
import { IncidentListPage } from './features/incidents/IncidentListPage';
import { IncidentDetailPage } from './features/incidents/IncidentDetailPage';
import { InventoryScanPage } from './features/inventory/InventoryScanPage';
import { DigitalListPage } from './features/digital/DigitalListPage';
import { DigitalDetailPage } from './features/digital/DigitalDetailPage';
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

  const handleLogin = async (username: string, password?: string) => {
    try {
      // Import apiClient locally to avoid circular deps if any
      const { apiClient } = await import('./lib/api-client');
      const response = await apiClient.post('/auth/login', { username, password });
      
      const user = response.data.data.user;
      
      setCurrentUser({
        id: user.id,
        username: user.username,
        name: user.fullName || user.username,
        email: user.email,
        role: user.role,
        departmentScope: ['*']
      });
      return true;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
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
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/inventory" element={<InventoryListPage />} />
        <Route path="/inventory/:id" element={<InventoryDetailPage />} />
        <Route path="/inventory/:id/scan" element={<InventoryScanPage />} />
        <Route path="/imports" element={<ImportPage />} />
        
        {/* Incidents */}
        <Route path="/incidents" element={<IncidentListPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />

        {/* Digital Entitlements */}
        <Route path="/entitlements" element={<DigitalListPage />} />
        <Route path="/entitlements/:id" element={<DigitalDetailPage />} />

        <Route path="/master-data" element={<MasterDataPage />} />
        <Route path="/history" element={<TransactionHistoryPage />} />
      </Route>
    </Routes>
  );
}
