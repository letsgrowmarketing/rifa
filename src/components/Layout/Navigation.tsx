import React from 'react';
import { Home, Upload, Hash, History, Settings, Users, FileText, Trophy, Search, Cog, Ticket } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const { user } = useAuth();

  const userMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Enviar Comprovante', icon: Upload },
    { id: 'numbers', label: 'Meus Números', icon: Hash },
    { id: 'history', label: 'Histórico', icon: History },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'vouchers', label: 'Comprovantes', icon: FileText },
    { id: 'raffles', label: 'Sorteios', icon: Trophy },
    { id: 'search', label: 'Buscar Jogadores', icon: Search },
    { id: 'coupons', label: 'Cupons', icon: Ticket },
    { id: 'settings', label: 'Configurações', icon: Cog },
  ];

  const menuItems = user?.isAdmin ? adminMenuItems : userMenuItems;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 w-16 md:w-64 min-h-screen">
      <div className="p-2 md:p-4">
        <ul className="space-y-1 md:space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-center md:justify-start space-x-0 md:space-x-3 px-2 md:px-3 py-2 md:py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden md:inline truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;