import React, { useState, useEffect } from 'react';
import { LogOut, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [systemConfig, setSystemConfig] = useState({
    systemName: 'Sistema de Rifas',
    logoUrl: ''
  });

  useEffect(() => {
    loadSystemConfig();
  }, []);

  const loadSystemConfig = () => {
    const config = JSON.parse(localStorage.getItem('systemConfig') || '{}');
    setSystemConfig({
      systemName: config.systemName || 'Sistema de Rifas',
      logoUrl: config.logoUrl || ''
    });

    // Update page title
    document.title = config.systemName || 'Sistema de Rifas';
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex-shrink-0">
              {systemConfig.logoUrl ? (
                <img 
                  src={systemConfig.logoUrl} 
                  alt="Logo" 
                  className="w-8 h-8 object-contain rounded-lg"
                />
              ) : (
                <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
              )}
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">{title}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="hidden sm:flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-400 dark:text-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-200 truncate max-w-32">{user?.nome}</span>
              {user?.role === 'admin' && (
                <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                  Admin
                </span>
              )}
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-2 sm:px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;