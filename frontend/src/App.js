import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import ApprovalRules from './pages/Admin/ApprovalRules';
import CompanySettings from './pages/Admin/CompanySettings';
import ExpensesOverview from './pages/Admin/ExpensesOverview';
import ManagerDashboard from './pages/Manager/Dashboard';
import TeamAnalytics from './pages/Manager/TeamAnalytics';
import BulkApproval from './pages/Manager/BulkApproval';
import EmployeeDashboard from './pages/Employee/Dashboard';
import './styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/approval-rules" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ApprovalRules />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/company-settings" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CompanySettings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/expenses-overview" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ExpensesOverview />
                  </ProtectedRoute>
                } 
              />
              
              {/* Manager Routes */}
              <Route 
                path="/manager/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['cfo', 'director', 'manager', 'financer']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager/team-analytics" 
                element={
                  <ProtectedRoute allowedRoles={['cfo', 'director', 'manager', 'financer']}>
                    <TeamAnalytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager/bulk-approval" 
                element={
                  <ProtectedRoute allowedRoles={['cfo', 'director', 'manager', 'financer']}>
                    <BulkApproval />
                  </ProtectedRoute>
                } 
              />
              
              {/* Employee Routes */}
              <Route 
                path="/employee/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default Routes */}
              <Route path="/dashboard" element={<Navigate to="/login" replace />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;