import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { AppUser } from '../../types';

interface AdminRouteProps {
  user: AppUser | null;
}

export function AdminRoute({ user }: AdminRouteProps) {
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/my-assets" replace />;
  }

  return <Outlet />;
}
