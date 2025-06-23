import React, { useState } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import UserDashboard from './components/Dashboard/UserDashboard';
import VoucherUpload from './components/Upload/VoucherUpload';
import UserNumbers from './components/Numbers/UserNumbers';
import UserHistory from './components/History/UserHistory';
import AdminDashboard from './components/Admin/AdminDashboard';
import VoucherManagement from './components/Admin/VoucherManagement';
import RaffleManagement from './components/Admin/RaffleManagement';
import UserManagement from './components/Admin/UserManagement';
import PlayerSearch from './components/Admin/PlayerSearch';
import SystemSettings from './components/Admin/SystemSettings';
import CouponManagement from './components/Admin/CouponManagement';
import { Loader } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {authMode === 'login' ? (
            <LoginForm onToggleMode={() => setAuthMode('register')} />
          ) : (
            <RegisterForm onToggleMode={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (user.role === 'admin') {
      switch (currentPage) {
        case 'dashboard':
          return <AdminDashboard onNavigate={setCurrentPage} />;
        case 'users':
          return <UserManagement />;
        case 'vouchers':
          return <VoucherManagement />;
        case 'raffles':
          return <RaffleManagement />;
        case 'search':
          return <PlayerSearch />;
        case 'coupons':
          return <CouponManagement />;
        case 'settings':
          return <SystemSettings />;
        default:
          return <AdminDashboard onNavigate={setCurrentPage} />;
      }
    } else {
      switch (currentPage) {
        case 'dashboard':
          return <UserDashboard onNavigate={setCurrentPage} />;
        case 'upload':
          return <VoucherUpload />;
        case 'numbers':
          return <UserNumbers />;
        case 'history':
          return <UserHistory />;
        default:
          return <UserDashboard onNavigate={setCurrentPage} />;
      }
    }
  };

  const getPageTitle = () => {
    if (user.role === 'admin') {
      switch (currentPage) {
        case 'dashboard': return 'Painel Administrativo';
        case 'users': return 'Gerenciar Usuários';
        case 'vouchers': return 'Gerenciar Comprovantes';
        case 'raffles': return 'Gerenciar Sorteios';
        case 'search': return 'Buscar Jogadores';
        case 'coupons': return 'Gerenciar Cupons';
        case 'settings': return 'Configurações do Sistema';
        default: return 'Painel Administrativo';
      }
    } else {
      switch (currentPage) {
        case 'dashboard': return 'Dashboard';
        case 'upload': return 'Enviar Comprovante';
        case 'numbers': return 'Meus Números';
        case 'history': return 'Histórico';
        default: return 'Sistema de Rifas';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header title={getPageTitle()} />
      <div className="flex">
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="flex-1 min-h-screen">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;