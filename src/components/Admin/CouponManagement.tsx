import React, { useState, useEffect } from 'react';
import { Plus, Ticket, Edit, Trash2, Eye, Calendar, Percent, Hash, X } from 'lucide-react';
import { Cupom } from '../../types';
import { formatDate } from '../../utils/raffle';

const CouponManagement: React.FC = () => {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Cupom | null>(null);
  const [newCoupon, setNewCoupon] = useState({
    codigo: '',
    tipo: 'quantidade' as 'quantidade' | 'percentual',
    valor: 0,
    uso_maximo: undefined as number | undefined,
    data_expiracao: ''
  });

  useEffect(() => {
    const loadCupons = () => {
      const stored: Cupom[] = JSON.parse(localStorage.getItem('cupons') || '[]');
      setCupons(stored);
    };

    loadCupons();
  }, []);

  const createCoupon = () => {
    if (!newCoupon.codigo.trim() || newCoupon.valor <= 0) return;

    const cupom: Cupom = {
      id: Date.now().toString(),
      codigo: newCoupon.codigo.trim().toUpperCase(),
      tipo: newCoupon.tipo,
      valor: newCoupon.valor,
      ativo: true,
      data_criacao: new Date().toISOString(),
      data_expiracao: newCoupon.data_expiracao ? new Date(newCoupon.data_expiracao).toISOString() : undefined,
      uso_maximo: newCoupon.uso_maximo,
      uso_atual: 0
    };

    const allCupons = [...cupons, cupom];
    setCupons(allCupons);
    localStorage.setItem('cupons', JSON.stringify(allCupons));

    setNewCoupon({
      codigo: '',
      tipo: 'quantidade',
      valor: 0,
      uso_maximo: undefined,
      data_expiracao: ''
    });
    setShowCreateModal(false);
  };

  const updateCoupon = (cupom: Cupom) => {
    const updatedCupons = cupons.map(c => c.id === cupom.id ? cupom : c);
    setCupons(updatedCupons);
    localStorage.setItem('cupons', JSON.stringify(updatedCupons));
    setEditingCoupon(null);
  };

  const deleteCoupon = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cupom?')) {
      const updatedCupons = cupons.filter(c => c.id !== id);
      setCupons(updatedCupons);
      localStorage.setItem('cupons', JSON.stringify(updatedCupons));
    }
  };

  const toggleCouponStatus = (id: string) => {
    const updatedCupons = cupons.map(c => 
      c.id === id ? { ...c, ativo: !c.ativo } : c
    );
    setCupons(updatedCupons);
    localStorage.setItem('cupons', JSON.stringify(updatedCupons));
  };

  const isExpired = (cupom: Cupom) => {
    if (!cupom.data_expiracao) return false;
    return new Date(cupom.data_expiracao) < new Date();
  };

  const isMaxUsageReached = (cupom: Cupom) => {
    if (!cupom.uso_maximo) return false;
    return cupom.uso_atual >= cupom.uso_maximo;
  };

  const getCouponStatus = (cupom: Cupom) => {
    if (!cupom.ativo) return { text: 'Inativo', color: 'gray' };
    if (isExpired(cupom)) return { text: 'Expirado', color: 'red' };
    if (isMaxUsageReached(cupom)) return { text: 'Esgotado', color: 'red' };
    return { text: 'Ativo', color: 'green' };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Cupons</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Crie e gerencie cupons de desconto para os usuários</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 flex items-center space-x-2 bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Cupom</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cupons.map((cupom) => {
          const status = getCouponStatus(cupom);
          return (
            <div
              key={cupom.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cupom.codigo}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {cupom.tipo === 'quantidade' ? 'Números extras' : 'Desconto percentual'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  status.color === 'green' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                  status.color === 'red' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                  {status.text}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Valor:</span>
                  <div className="flex items-center">
                    {cupom.tipo === 'quantidade' ? (
                      <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1" />
                    ) : (
                      <Percent className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cupom.valor} {cupom.tipo === 'quantidade' ? 'números' : '%'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Uso:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {cupom.uso_atual}{cupom.uso_maximo ? `/${cupom.uso_maximo}` : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Criado:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatDate(cupom.data_criacao)}
                  </span>
                </div>

                {cupom.data_expiracao && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Expira:</span>
                    <span className={`text-sm ${isExpired(cupom) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {formatDate(cupom.data_expiracao)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingCoupon(cupom)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => toggleCouponStatus(cupom.id)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md transition-colors text-sm ${
                    cupom.ativo 
                      ? 'bg-yellow-600 dark:bg-yellow-500 text-white hover:bg-yellow-700 dark:hover:bg-yellow-600'
                      : 'bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>{cupom.ativo ? 'Desativar' : 'Ativar'}</span>
                </button>
                <button
                  onClick={() => deleteCoupon(cupom.id)}
                  className="px-3 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {cupons.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Ticket className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum cupom criado</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Crie seu primeiro cupom para oferecer descontos aos usuários</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            Criar Cupom
          </button>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Criar Novo Cupom</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código do Cupom
                  </label>
                  <input
                    type="text"
                    value={newCoupon.codigo}
                    onChange={(e) => setNewCoupon({...newCoupon, codigo: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="DESCONTO10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Cupom
                  </label>
                  <select
                    value={newCoupon.tipo}
                    onChange={(e) => setNewCoupon({...newCoupon, tipo: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="quantidade">Números Extras</option>
                    <option value="percentual">Desconto Percentual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor {newCoupon.tipo === 'quantidade' ? '(números extras)' : '(% de desconto)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={newCoupon.tipo === 'percentual' ? 100 : undefined}
                    value={newCoupon.valor}
                    onChange={(e) => setNewCoupon({...newCoupon, valor: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Uso Máximo (opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCoupon.uso_maximo || ''}
                    onChange={(e) => setNewCoupon({...newCoupon, uso_maximo: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Deixe vazio para uso ilimitado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data de Expiração (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={newCoupon.data_expiracao}
                    onChange={(e) => setNewCoupon({...newCoupon, data_expiracao: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createCoupon}
                    disabled={!newCoupon.codigo.trim() || newCoupon.valor <= 0}
                    className="flex-1 bg-green-600 dark:bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    Criar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Cupom</h3>
                <button
                  onClick={() => setEditingCoupon(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código do Cupom
                  </label>
                  <input
                    type="text"
                    value={editingCoupon.codigo}
                    onChange={(e) => setEditingCoupon({...editingCoupon, codigo: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Cupom
                  </label>
                  <select
                    value={editingCoupon.tipo}
                    onChange={(e) => setEditingCoupon({...editingCoupon, tipo: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="quantidade">Números Extras</option>
                    <option value="percentual">Desconto Percentual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor {editingCoupon.tipo === 'quantidade' ? '(números extras)' : '(% de desconto)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={editingCoupon.tipo === 'percentual' ? 100 : undefined}
                    value={editingCoupon.valor}
                    onChange={(e) => setEditingCoupon({...editingCoupon, valor: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Uso Máximo (opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingCoupon.uso_maximo || ''}
                    onChange={(e) => setEditingCoupon({...editingCoupon, uso_maximo: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Deixe vazio para uso ilimitado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data de Expiração (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={editingCoupon.data_expiracao ? new Date(editingCoupon.data_expiracao).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingCoupon({...editingCoupon, data_expiracao: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setEditingCoupon(null)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => updateCoupon(editingCoupon)}
                    disabled={!editingCoupon.codigo.trim() || editingCoupon.valor <= 0}
                    className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    Salvar
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

export default CouponManagement;