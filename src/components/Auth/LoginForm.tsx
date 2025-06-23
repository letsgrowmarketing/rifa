import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/auth';
import { supabase } from '../../lib/supabase';

interface LoginFormProps {
  onToggleMode: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [systemConfig, setSystemConfig] = useState({
    systemName: 'Sistema de Rifas',
    logoUrl: ''
  });
  const { login } = useAuth();

  useEffect(() => {
    loadSystemConfig();
  }, []);

  const loadSystemConfig = async () => {
    try {
      const { data } = await supabase
        .from('system_config')
        .select('key, value')
        .in('key', ['system_name', 'logo_url']);

      const config = data?.reduce((acc, item) => {
        acc[item.key] = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
        return acc;
      }, {} as any) || {};

      setSystemConfig({
        systemName: config.system_name || 'Sistema de Rifas',
        logoUrl: config.logo_url || ''
      });

      // Update page title
      document.title = config.system_name || 'Sistema de Rifas';
    } catch (error) {
      console.error('Error loading system config:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email) {
      setError('Email é obrigatório');
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Email inválido');
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Senha é obrigatória');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error || 'Email ou senha incorretos');
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          {systemConfig.logoUrl ? (
            <img 
              src={systemConfig.logoUrl} 
              alt="Logo" 
              className="w-16 h-16 object-contain"
            />
          ) : (
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{systemConfig.systemName}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Entre na sua conta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-3">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Não tem uma conta?{' '}
          <button
            onClick={onToggleMode}
            className="text-green-600 hover:text-green-700 font-medium"
            disabled={loading}
          >
            Criar conta
          </button>
        </p>
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Conta de teste Admin:</strong><br />
          Email: admin@rifa.com<br />
          Senha: admin123
        </p>
      </div>
    </div>
  );
};

export default LoginForm;