import React, { useState, useEffect } from 'react';
import { Settings, Bot, CheckCircle, XCircle, Save, Palette, Upload, Eye, EyeOff, User, Edit, Trash2, X } from 'lucide-react';
import { User as UserType } from '../../types';
import { hashPassword } from '../../utils/auth';

interface SystemConfig {
  aiValidationEnabled: boolean;
  minDepositAmount: number;
  numbersPerBlock: number;
  blockValue: number;
  systemName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
}

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    aiValidationEnabled: true,
    minDepositAmount: 100,
    numbersPerBlock: 10,
    blockValue: 100,
    systemName: 'Sistema de Rifas',
    primaryColor: '#059669',
    secondaryColor: '#3B82F6',
    accentColor: '#F59E0B',
    logoUrl: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState<UserType | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    // Load system configuration
    const savedConfig = localStorage.getItem('systemConfig');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig({
        aiValidationEnabled: parsed.aiValidationEnabled ?? true,
        minDepositAmount: parsed.minDepositAmount ?? 100,
        numbersPerBlock: parsed.numbersPerBlock ?? 10,
        blockValue: parsed.blockValue ?? 100,
        systemName: parsed.systemName ?? 'Sistema de Rifas',
        primaryColor: parsed.primaryColor ?? '#059669',
        secondaryColor: parsed.secondaryColor ?? '#3B82F6',
        accentColor: parsed.accentColor ?? '#F59E0B',
        logoUrl: parsed.logoUrl ?? ''
      });
      
      if (parsed.logoUrl) {
        setLogoPreview(parsed.logoUrl);
      }

      // Apply colors immediately on load
      if (parsed.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', parsed.primaryColor);
      }
      if (parsed.secondaryColor) {
        document.documentElement.style.setProperty('--secondary-color', parsed.secondaryColor);
      }
      if (parsed.accentColor) {
        document.documentElement.style.setProperty('--accent-color', parsed.accentColor);
      }
    }

    // Load users
    const allUsers: UserType[] = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(allUsers.filter(u => !u.isAdmin));
  }, []);

  const handleSave = () => {
    setSaving(true);
    
    // Save configuration
    localStorage.setItem('systemConfig', JSON.stringify(config));
    
    // Apply CSS custom properties for colors
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', config.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', config.accentColor);
    
    // Update page title
    document.title = config.systemName;
    
    // Force a re-render by updating a class on the body
    document.body.className = document.body.className;
    
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));

    // Apply colors immediately when changed
    if (key === 'primaryColor' || key === 'secondaryColor' || key === 'accentColor') {
      const cssVar = key === 'primaryColor' ? '--primary-color' : 
                    key === 'secondaryColor' ? '--secondary-color' : '--accent-color';
      document.documentElement.style.setProperty(cssVar, value);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        handleConfigChange('logoUrl', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (user: UserType) => {
    if (!newPassword.trim()) return;

    const updatedUsers = users.map(u => 
      u.id === user.id 
        ? { ...u, senha_hash: hashPassword(newPassword) }
        : u
    );

    // Update all users including admins
    const allUsers: UserType[] = JSON.parse(localStorage.getItem('users') || '[]');
    const finalUsers = allUsers.map(u => {
      const updated = updatedUsers.find(uu => uu.id === u.id);
      return updated || u;
    });

    localStorage.setItem('users', JSON.stringify(finalUsers));
    setUsers(updatedUsers);
    setShowPasswordModal(null);
    setNewPassword('');
  };

  const deleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      const allUsers: UserType[] = JSON.parse(localStorage.getItem('users') || '[]');
      const filteredUsers = allUsers.filter(u => u.id !== userId);
      
      localStorage.setItem('users', JSON.stringify(filteredUsers));
      setUsers(filteredUsers.filter(u => !u.isAdmin));
      
      // Also remove user's data
      const comprovantes = JSON.parse(localStorage.getItem('comprovantes') || '[]');
      const numeros = JSON.parse(localStorage.getItem('numerosRifa') || '[]');
      
      localStorage.setItem('comprovantes', JSON.stringify(comprovantes.filter((c: any) => c.id_usuario !== userId)));
      localStorage.setItem('numerosRifa', JSON.stringify(numeros.filter((n: any) => n.id_usuario !== userId)));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações do Sistema</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Gerencie as configurações globais do sistema de rifas</p>
      </div>

      <div className="space-y-8">
        {/* System Branding */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Identidade Visual</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Sistema
                </label>
                <input
                  type="text"
                  value={config.systemName}
                  onChange={(e) => handleConfigChange('systemName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Sistema de Rifas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo do Sistema
                </label>
                <div className="flex items-center space-x-4">
                  {logoPreview && (
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-16 h-16 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Logo
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cor Primária
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                    placeholder="#059669"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cor Secundária
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.secondaryColor}
                    onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cor de Destaque
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={(e) => handleConfigChange('accentColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.accentColor}
                    onChange={(e) => handleConfigChange('accentColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                    placeholder="#F59E0B"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Prévia das Cores</h4>
            <div className="flex space-x-4">
              <div 
                className="w-16 h-16 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center justify-center"
                style={{ backgroundColor: config.primaryColor }}
                title="Cor Primária"
              >
                <span className="text-white font-bold text-xs">PRIM</span>
              </div>
              <div 
                className="w-16 h-16 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center justify-center"
                style={{ backgroundColor: config.secondaryColor }}
                title="Cor Secundária"
              >
                <span className="text-white font-bold text-xs">SEC</span>
              </div>
              <div 
                className="w-16 h-16 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center justify-center"
                style={{ backgroundColor: config.accentColor }}
                title="Cor de Destaque"
              >
                <span className="text-white font-bold text-xs">DEST</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Validation Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Validação por IA</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Ativar Validação Automática por IA</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Quando ativado, os comprovantes são validados automaticamente pela IA antes da aprovação manual
                </p>
              </div>
              <button
                onClick={() => handleConfigChange('aiValidationEnabled', !config.aiValidationEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.aiValidationEnabled ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.aiValidationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className={`p-4 rounded-lg border ${
              config.aiValidationEnabled 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-center space-x-2">
                {config.aiValidationEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  config.aiValidationEnabled ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  Validação por IA {config.aiValidationEnabled ? 'ATIVADA' : 'DESATIVADA'}
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                config.aiValidationEnabled ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {config.aiValidationEnabled 
                  ? 'Comprovantes serão validados automaticamente pela IA quando possível'
                  : 'Todos os comprovantes precisarão de aprovação manual'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Raffle Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações da Rifa</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor Mínimo de Depósito (R$)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={config.minDepositAmount}
                onChange={(e) => handleConfigChange('minDepositAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valor mínimo que um usuário pode depositar</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor do Bloco (R$)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={config.blockValue}
                onChange={(e) => handleConfigChange('blockValue', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valor de cada bloco para geração de números</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Números por Bloco
              </label>
              <input
                type="number"
                min="1"
                value={config.numbersPerBlock}
                onChange={(e) => handleConfigChange('numbersPerBlock', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quantos números são gerados por bloco</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Exemplo de Cálculo</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Com as configurações atuais: R$ {config.blockValue.toFixed(2)} = {config.numbersPerBlock} números
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Um depósito de R$ {(config.blockValue * 2).toFixed(2)} geraria {config.numbersPerBlock * 2} números
            </p>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gerenciar Usuários</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.cpf}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setShowPasswordModal(user)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        title="Alterar senha"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        title="Excluir usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum usuário cadastrado</p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center space-x-2 px-6 py-2 rounded-md font-medium transition-colors ${
              saved 
                ? 'bg-green-600 dark:bg-green-500 text-white'
                : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white disabled:opacity-50'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Salvo!</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Alterar Senha - {showPasswordModal.nome}
                </h3>
                <button
                  onClick={() => setShowPasswordModal(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Digite a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowPasswordModal(null)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handlePasswordChange(showPasswordModal)}
                    disabled={!newPassword.trim()}
                    className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    Alterar Senha
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;