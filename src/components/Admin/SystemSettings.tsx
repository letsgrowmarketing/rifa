import React, { useState, useEffect } from 'react';
import { Settings, Bot, CheckCircle, XCircle, Save } from 'lucide-react';

interface SystemConfig {
  aiValidationEnabled: boolean;
  minDepositAmount: number;
  numbersPerBlock: number;
  blockValue: number;
}

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    aiValidationEnabled: true,
    minDepositAmount: 100,
    numbersPerBlock: 10,
    blockValue: 100
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load system configuration
    const savedConfig = localStorage.getItem('systemConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    
    // Save configuration
    localStorage.setItem('systemConfig', JSON.stringify(config));
    
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
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações do Sistema</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Gerencie as configurações globais do sistema de rifas</p>
      </div>

      <div className="space-y-6">
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
    </div>
  );
};

export default SystemSettings;