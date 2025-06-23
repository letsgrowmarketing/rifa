import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, CreditCard, Calendar, DollarSign, Hash } from 'lucide-react';
import { User, Comprovante, NumeroRifa } from '../../types';
import { formatCurrency, formatDate } from '../../utils/raffle';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [comprovantes, setComprovantes] = useState<Comprovante[]>([]);
  const [numeros, setNumeros] = useState<NumeroRifa[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const loadData = () => {
      const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const allComprovantes: Comprovante[] = JSON.parse(localStorage.getItem('comprovantes') || '[]');
      const allNumeros: NumeroRifa[] = JSON.parse(localStorage.getItem('numerosRifa') || '[]');

      // Filter out admin users
      const regularUsers = allUsers.filter(u => !u.isAdmin);
      
      setUsers(regularUsers);
      setComprovantes(allComprovantes);
      setNumeros(allNumeros);
    };

    loadData();
  }, []);

  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.cpf.includes(searchTerm)
  );

  const getUserStats = (userId: string) => {
    const userVouchers = comprovantes.filter(c => c.id_usuario === userId);
    const userNumbers = numeros.filter(n => n.id_usuario === userId);
    
    const totalDeposited = userVouchers.reduce((sum, c) => sum + c.valor_informado, 0);
    const totalApproved = userVouchers
      .filter(c => c.status === 'aprovado')
      .reduce((sum, c) => sum + c.valor_informado, 0);
    const pendingCount = userVouchers.filter(c => c.status === 'pendente').length;
    
    return {
      totalDeposited,
      totalApproved,
      pendingCount,
      numbersCount: userNumbers.length,
      vouchersCount: userVouchers.length
    };
  };

  const getUserDetails = (user: User) => {
    const userVouchers = comprovantes.filter(c => c.id_usuario === user.id);
    const userNumbers = numeros.filter(n => n.id_usuario === user.id);
    const stats = getUserStats(user.id);
    
    return {
      user,
      vouchers: userVouchers.sort((a, b) => new Date(b.data_envio).getTime() - new Date(a.data_envio).getTime()),
      numbers: userNumbers,
      stats
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
        <p className="text-gray-600 mt-1">Visualize e gerencie todos os usuários do sistema</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Buscar por nome, email ou CPF..."
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const stats = getUserStats(user.id);
          return (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.nome}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                {stats.pendingCount > 0 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {stats.pendingCount} pendente{stats.pendingCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span>{user.cpf}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Cadastro: {formatDate(user.data_cadastro)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(stats.totalDeposited)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Total Depositado</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-center mb-1">
                    <Hash className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-lg font-bold text-gray-900">{stats.numbersCount}</span>
                  </div>
                  <p className="text-xs text-gray-500">Números</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Aprovado:</span>
                  <span className="font-medium text-green-600">{formatCurrency(stats.totalApproved)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Comprovantes:</span>
                  <span className="font-medium text-gray-900">{stats.vouchersCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Tente ajustar os termos de busca.' : 'Nenhum usuário cadastrado ainda.'}
          </p>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Detalhes do Usuário</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {(() => {
                const details = getUserDetails(selectedUser);
                return (
                  <div className="space-y-6">
                    {/* User Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Nome</label>
                          <p className="text-gray-900">{details.user.nome}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900">{details.user.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">CPF</label>
                          <p className="text-gray-900">{details.user.cpf}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Data de Cadastro</label>
                          <p className="text-gray-900">{formatDate(details.user.data_cadastro)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Total Depositado</label>
                          <p className="text-2xl font-bold text-gray-900">{formatCurrency(details.stats.totalDeposited)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Total Aprovado</label>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(details.stats.totalApproved)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Hash className="w-5 h-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-2xl font-bold text-blue-900">{details.stats.numbersCount}</p>
                            <p className="text-sm text-blue-600">Números Gerados</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                          <div>
                            <p className="text-2xl font-bold text-green-900">{details.stats.vouchersCount}</p>
                            <p className="text-sm text-green-600">Comprovantes</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-yellow-600 mr-2" />
                          <div>
                            <p className="text-2xl font-bold text-yellow-900">{details.stats.pendingCount}</p>
                            <p className="text-sm text-yellow-600">Pendentes</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vouchers History */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Histórico de Comprovantes</h4>
                      {details.vouchers.length === 0 ? (
                        <p className="text-gray-500">Nenhum comprovante enviado</p>
                      ) : (
                        <div className="space-y-3">
                          {details.vouchers.map((voucher) => (
                            <div key={voucher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{formatCurrency(voucher.valor_informado)}</p>
                                <p className="text-sm text-gray-500">{formatDate(voucher.data_envio)}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                voucher.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                                voucher.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {voucher.status === 'aprovado' ? 'Aprovado' :
                                 voucher.status === 'rejeitado' ? 'Rejeitado' :
                                 'Pendente'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;