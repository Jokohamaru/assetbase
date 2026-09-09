import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { AppUser } from '../../types';

interface UserRouteProps {
  user: AppUser | null;
}

export function UserRoute({ user }: UserRouteProps) {
  if (!user || user.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
