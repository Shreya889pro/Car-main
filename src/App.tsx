import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import { Layout } from './components/layout';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/auth';
import { SkeletonStats } from './components/ui/Skeleton';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const EmployeesListPage = lazy(() => import('./pages/employees/EmployeesListPage'));
const EmployeeProfilePage = lazy(() => import('./pages/employees/EmployeeProfilePage'));
const DepartmentsPage = lazy(() => import('./pages/departments/DepartmentsPage'));
const PlantsPage = lazy(() => import('./pages/plants/PlantsPage'));
const ProductionOrdersPage = lazy(() => import('./pages/production/ProductionOrdersPage'));
const WorkflowBoardPage = lazy(() => import('./pages/workflow/WorkflowBoardPage'));
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const CalendarPage = lazy(() => import('./pages/calendar/CalendarPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const DocumentsPage = lazy(() => import('./pages/documents/DocumentsPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

// Placeholder pages for routes not yet fully implemented
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-96">
    <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
    <p className="text-text-muted mt-2">This module is coming soon</p>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const PageLoader: React.FC = () => (
  <div className="p-6">
    <SkeletonStats count={4} />
  </div>
);

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'bg-card border border-white/10 text-text-primary',
              duration: 4000,
              style: {
                background: '#1E293B',
                color: '#F8FAFC',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              },
            }}
          />
          <Routes>
            {/* Auth routes (without layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* App routes (with layout) */}
            <Route
              path="/"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/employees"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <EmployeesListPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <EmployeeProfilePage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/departments"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <DepartmentsPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/roles"
              element={
                <Layout>
                  <PlaceholderPage title="Roles & Permissions" />
                </Layout>
              }
            />
            <Route
              path="/plants"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <PlantsPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/production"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <ProductionOrdersPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/workflow"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <WorkflowBoardPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/inventory"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <InventoryPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/warehouse"
              element={
                <Layout>
                  <PlaceholderPage title="Warehouse Management" />
                </Layout>
              }
            />
            <Route
              path="/suppliers"
              element={
                <Layout>
                  <PlaceholderPage title="Suppliers" />
                </Layout>
              }
            />
            <Route
              path="/customers"
              element={
                <Layout>
                  <PlaceholderPage title="Customers" />
                </Layout>
              }
            />
            <Route
              path="/imports"
              element={
                <Layout>
                  <PlaceholderPage title="Import Management" />
                </Layout>
              }
            />
            <Route
              path="/exports"
              element={
                <Layout>
                  <PlaceholderPage title="Export Management" />
                </Layout>
              }
            />
            <Route
              path="/dispatch"
              element={
                <Layout>
                  <PlaceholderPage title="Dispatch Management" />
                </Layout>
              }
            />
            <Route
              path="/quality"
              element={
                <Layout>
                  <PlaceholderPage title="Quality Control" />
                </Layout>
              }
            />
            <Route
              path="/maintenance"
              element={
                <Layout>
                  <PlaceholderPage title="Maintenance" />
                </Layout>
              }
            />
            <Route
              path="/reports"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <ReportsPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/analytics"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <AnalyticsPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/documents"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <DocumentsPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/notifications"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <NotificationsPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/calendar"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <CalendarPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <SettingsPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <ProfilePage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/help"
              element={
                <Layout>
                  <PlaceholderPage title="Help Center" />
                </Layout>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
