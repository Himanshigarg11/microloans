import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import PublicLayout from './layouts/PublicLayout';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelection from './pages/RoleSelection';
import CompleteBorrowerProfile from './pages/CompleteBorrowerProfile';
import CompleteLenderProfile from './pages/CompleteLenderProfile';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import LoanDetails from './pages/LoanDetails';
import CreateLoan from './pages/CreateLoan';
import Profile from './pages/Profile';
import Repayments from './pages/Repayments';
import Chat from './pages/Chat';
import MyInvestments from './pages/MyInvestments';

// Context
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Landing Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Role Selection (Auth but no role yet) */}
          <Route path="/select-role" element={
            <ProtectedRoute>
              <RoleSelection />
            </ProtectedRoute>
          } />

          {/* Role Onboarding */}
          <Route path="/complete-borrower-profile" element={
            <ProtectedRoute>
              <CompleteBorrowerProfile />
            </ProtectedRoute>
          } />
          <Route path="/complete-lender-profile" element={
            <ProtectedRoute>
              <CompleteLenderProfile />
            </ProtectedRoute>
          } />

          {/* Main Authenticated Application Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            {/* Shared routes — accessible to all roles */}
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="chat" element={<Chat />} />
            <Route path="marketplace/:id" element={<LoanDetails />} />

            {/* Borrower-only routes */}
            <Route path="create-loan" element={
              <RoleRoute allowedRoles={['borrower']}>
                <CreateLoan />
              </RoleRoute>
            } />
            <Route path="repayments" element={
              <RoleRoute allowedRoles={['borrower']}>
                <Repayments />
              </RoleRoute>
            } />

            {/* Lender-only routes */}
            <Route path="marketplace" element={
              <RoleRoute allowedRoles={['lender']}>
                <Marketplace />
              </RoleRoute>
            } />
            <Route path="investments" element={
              <RoleRoute allowedRoles={['lender']}>
                <MyInvestments />
              </RoleRoute>
            } />
          </Route>

          {/* Fallback/Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
    </ToastProvider>
  );
}

export default App;
