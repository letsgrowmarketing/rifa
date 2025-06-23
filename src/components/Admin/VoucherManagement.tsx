import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Calendar, DollarSign, User } from 'lucide-react';
import { Comprovante, NumeroRifa, Sorteio } from '../../types';
import { formatCurrency, formatDate, generateRaffleNumbers } from '../../utils/raffle';

const VoucherManagement: React.FC = () => {
  const [comprovantes, setComprovantes] = useState<Comprovante[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Comprovante | null>(null);
  const [filter, setFilter] = useState<'all' | 'pendente' | 'aprovado' | 'rejeitado'>('pendente');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const loadComprovantes = () => {
      const stored: Comprovante[] = JSON.parse(localStorage.getItem('comprovantes') || '[]');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Add user names to vouchers
      const withUserNames = stored.map(c => ({
        ...c,
        usuario_nome: users.find((u: any) => u.id === c.id_usuario)?.nome || 'Usuário não encontrado'
      }));
      
      setComprovantes(withUserNames);
    };

    loadComprovantes();
    const interval = setInterval(loadComprovantes, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredComprovantes = comprovantes.filter(c => 
    filter === 'all' || c.status === filter
  );

  const handleApprove = async (comprovante: Comprovante) => {
    setLoading(comprovante.id);
    
    // Update voucher status
    const updatedComprovante = { ...comprovante, status: 'aprovado' as const };
    const allComprovantes = comprovantes.map(c => 
      c.id === comprovante.id ? updatedComprovante : c
    );
    
    setComprovantes(allComprovantes);
    localStorage.setItem('comprovantes', JSON.stringify(allComprovantes));

    // Generate raffle numbers
    const numbers = generateRaffleNumbers(comprovante.valor_informado);
    const sorteios: Sorteio[] = JSON.parse(localStorage.getItem('sorteios') || '[]');
    const currentRaffle = sorteios.find(s => s.status === 'aberto');
    
    if (currentRaffle) {
      const numerosRifa: NumeroRifa[] = numbers.map(numero => ({
        id: `${Date.now()}-${numero}-${Math.random()}`,
        id_usuario: comprovante.id_usuario,
        id_sorteio: currentRaffle.id,
        numero_gerado: numero
      }));
      
      const existingNumbers = JSON.parse(localStorage.getItem('numerosRifa') || '[]');
      localStorage.setItem('numerosRifa', JSON.stringify([...existingNumbers, ...numerosRifa]));
    }

    setSelectedVoucher(null);
    setLoading(null);
  };

  const handleReject = (comprovante: Comprovante) => {
    setLoading(comprovante.id);
    
    const updatedComprovante = { ...comprovante, status: 'rejeitado' as const };
    const allComprovantes = comprovantes.map(c => 
      c.id === comprovante.id ? updatedComprovante : c
    );
    
    setComprovantes(allComprovantes);
    localStorage.setItem('comprovantes', JSON.stringify(allComprovantes));
    setSelectedVoucher(null);
    setLoading(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Comprovantes</h1>
        <p className="text-gray-600 mt-1">Aprove ou rejeite comprovantes de pagamento</p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2">
          {[
            { key: 'pendente', label: 'Pendentes', count: comprovantes.filter(c => c.status === 'pendente').length },
            { key: 'aprovado', label: 'Aprovados', count: comprovantes.filter(c => c.status === 'aprovado').length },
            { key: 'rejeitado', label: 'Rejeitados', count: comprovantes.filter(c => c.status === 'rejeitado').length },
            { key: 'all', label: 'Todos', count: comprovantes.length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredComprovantes.length === 0 ? (
          <div className="p-8 text-center">
            <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum comprovante encontrado</h3>
            <p className="text-gray-600">
              {filter === 'pendente' 
                ? 'Não há comprovantes pendentes de aprovação.'
                : `Não há comprovantes com status "${filter}".`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComprovantes.map((comprovante) => (
                  <tr key={comprovante.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-full mr-3">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {comprovante.usuario_nome}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {formatCurrency(comprovante.valor_informado)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(comprovante.data_envio)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        comprovante.status === 'aprovado' 
                          ? 'bg-green-100 text-green-800'
                          : comprovante.status === 'rejeitado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {comprovante.status === 'aprovado' ? 'Aprovado' :
                         comprovante.status === 'rejeitado' ? 'Rejeitado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedVoucher(comprovante)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {comprovante.status === 'pendente' && (
                        <>
                          <button
                            onClick={() => handleApprove(comprovante)}
                            disabled={loading === comprovante.id}
                            className="text-green-600 hover:text-green-700 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(comprovante)}
                            disabled={loading === comprovante.id}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Voucher Preview Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Comprovante de Pagamento</h3>
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Usuário</label>
                    <p className="text-gray-900">{selectedVoucher.usuario_nome}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Valor Informado</label>
                    <p className="text-gray-900">{formatCurrency(selectedVoucher.valor_informado)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Envio</label>
                    <p className="text-gray-900">{formatDate(selectedVoucher.data_envio)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedVoucher.status === 'aprovado' 
                        ? 'bg-green-100 text-green-800'
                        : selectedVoucher.status === 'rejeitado'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedVoucher.status === 'aprovado' ? 'Aprovado' :
                       selectedVoucher.status === 'rejeitado' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Comprovante</label>
                  <img 
                    src={selectedVoucher.imagem_comprovante} 
                    alt="Comprovante" 
                    className="max-w-full h-auto rounded border"
                  />
                </div>

                {selectedVoucher.status === 'pendente' && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => handleApprove(selectedVoucher)}
                      disabled={loading === selectedVoucher.id}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {loading === selectedVoucher.id ? 'Aprovando...' : 'Aprovar'}
                    </button>
                    <button
                      onClick={() => handleReject(selectedVoucher)}
                      disabled={loading === selectedVoucher.id}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {loading === selectedVoucher.id ? 'Rejeitando...' : 'Rejeitar'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherManagement;