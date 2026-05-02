import React from 'react';
import { useAuth } from '../context/AuthContext';
import ManufacturerDashboard from './ManufacturerDashboard';
import DistributorDashboard from './DistributorDashboard';
import PharmacistDashboard from './PharmacistDashboard';
import PublicVerify from './PublicVerify';

export default function DashboardRouter() {
  const { profile } = useAuth();

  if (!profile) return null;

  switch (profile.role) {
    case 'manufacturer':
      return <ManufacturerDashboard />;
    case 'distributor':
      return <DistributorDashboard />;
    case 'pharmacist':
      return <PharmacistDashboard />;
    case 'patient':
      return <PublicVerify />;
    default:
      return <PublicVerify />;
  }
}
