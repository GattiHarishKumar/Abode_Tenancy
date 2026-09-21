import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import { OwnerLayout } from './components/layout/OwnerLayout';
import { TenantLayout } from './components/layout/TenantLayout';
import { CookLayout } from './components/layout/CookLayout';

// Auth & Public Pages
import { LoginPage } from './pages/auth/LoginPage';
import { PublicPGPage } from './pages/public/PublicPGPage';

// Owner Pages
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { RoomGridPage } from './pages/owner/RoomGridPage';
import { TenantsPage } from './pages/owner/TenantsPage';
import { RentPage } from './pages/owner/RentPage';
import { FoodCommandPage } from './pages/owner/FoodCommandPage';
import { ComplaintsPage } from './pages/owner/ComplaintsPage';
import { ApplicationsPage } from './pages/owner/ApplicationsPage';
import { QRSettingsPage } from './pages/owner/QRSettingsPage';

// Tenant Pages
import { TenantTodayPage } from './pages/tenant/TenantTodayPage';
import { TenantMealsPage } from './pages/tenant/TenantMealsPage';
import { TenantRentPage } from './pages/tenant/TenantRentPage';
import { TenantIssuesPage } from './pages/tenant/TenantIssuesPage';
import { TenantProfilePage } from './pages/tenant/TenantProfilePage';

// Cook Pages
import { CookDashboardPage } from './pages/cook/CookDashboardPage';

// Role-Based Route Protection
const ProtectedRoute: React.FC<{ 
  allowedRoles?: string[]; 
  children: React.ReactNode; 
}> = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'OWNER') return <Navigate to="/owner" replace />;
    if (user.role === 'TENANT') return <Navigate to="/tenant/today" replace />;
    if (user.role === 'COOK') return <Navigate to="/cook" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Root Redirect Component
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'OWNER' || user.role === 'SUPER_ADMIN') {
    return <Navigate to="/owner" replace />;
  }
  if (user.role === 'TENANT') {
    return <Navigate to="/tenant/today" replace />;
  }
  if (user.role === 'COOK') {
    return <Navigate to="/cook" replace />;
  }

  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/p/:slug" element={<PublicPGPage />} />

          {/* Owner Portal */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'SUPER_ADMIN']}>
                <OwnerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OwnerDashboard />} />
            <Route path="rooms" element={<RoomGridPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="rent" element={<RentPage />} />
            <Route path="food" element={<FoodCommandPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="qr" element={<QRSettingsPage />} />
          </Route>

          {/* Tenant Portal */}
          <Route
            path="/tenant"
            element={
              <ProtectedRoute allowedRoles={['TENANT']}>
                <TenantLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/tenant/today" replace />} />
            <Route path="today" element={<TenantTodayPage />} />
            <Route path="meals" element={<TenantMealsPage />} />
            <Route path="rent" element={<TenantRentPage />} />
            <Route path="issues" element={<TenantIssuesPage />} />
            <Route path="profile" element={<TenantProfilePage />} />
          </Route>

          {/* Cook Kitchen App */}
          <Route
            path="/cook"
            element={
              <ProtectedRoute allowedRoles={['COOK', 'OWNER', 'SUPER_ADMIN']}>
                <CookLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CookDashboardPage />} />
          </Route>

          {/* Default Root Redirect */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

