import React, { useState, useEffect } from 'react';
import { Search, User, Hash, Trophy, Calendar, DollarSign } from 'lucide-react';
import { User as UserType, NumeroRifa, Sorteio, Comprovante } from '../../types';
import { formatDate, formatCurrency } from '../../utils/raffle';

const PlayerSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'email' | 'cpf' | 'number'>('name');
  const [users, setUsers] = useState<UserType[]>([]);
  const [numbers, setNumbers] = useState<NumeroRifa[]>([]);
  const [sorteios, setSorteios] = useState<Sorteio[]>([]);
  const [comprovantes, setComprovantes] = useState<Comprovante[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const allUsers: UserType[] = JSON.parse(localStorage.getItem('users') || '[]');
      const allNumbers: NumeroRifa[] = JSON.parse(localStorage.getItem('numerosRifa') || '[]');
      const allSorteios: Sorteio[] = JSON.parse(localStorage.getItem('sorteios') || '[]');
      const allComprovantes: Comprovante[] = JSON.parse(localStorage.getItem('comprovantes') || '[]');

      setUsers(allUsers.filter(u => !u.isAdmin));
      setNumbers(allNumbers);
      setSorteios(allSorteios);
      setComprovantes(allComprovantes);
    };

    loadData();
  }, []);

  const performSearch = () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const term = searchTerm.toLowerCase().trim();

    let searchResults: any[] = [];

    if (searchType === 'number') {
      // Search by raffle number
      const matchingNumbers = numbers.filter(n => 
        n.numero_gerado.includes(term)
      );

      searchResults = matchingNumbers.map(numero => {
        const user = users.find(u => u.id === numero.id_usuario);
        const sorteio = sorteios.find(s => s.id === numero.id_sorteio);
        const userStats = getUserStats(numero.id_usuario);
        
        return {
          type: 'number',
          numero,
          user,
          sorteio,
          userStats
        };
      });
    } else {
      // Search by user data
      const matchingUsers = users.filter(user => {
        switch (searchType) {
          case 'name':
            return user.nome.toLowerCase().includes(term);
          case 'email':
            return user.email.toLowerCase().includes(term);
          case 'cpf':
            return user.cpf.replace(/\D/g, '').includes(term.replace(/\D/g, ''));
          default:
            return false;
        }
      });

      searchResults = matchingUsers.map(user => {
        const userNumbers = numbers.filter(n => n.id_usuario === user.id);
        const userStats = getUserStats(user.id);
        
        return {
          type: 'user',
          user,
          numbers: userNumbers,
          userStats
        };
      });
    }

    setResults(searchResults);
    setLoading(false);
  };

  const getUserStats = (userId: string) => {
    const userVouchers = comprovantes.filter(c => c.id_usuario === userId);
    const userNumbers = numbers.filter(n => n.id_usuario === userId);
    
    const totalDeposited = userVouchers.reduce((sum, c) => sum + c.valor_informado, 0);
    const totalApproved = userVouchers
      .filter(c => c.status === 'aprovado')
      .reduce((sum, c) => sum + c.valor_informado, 0);
    
    return {
      totalDeposited,
      totalApproved,
      numbersCount: userNumbers.length,
      vouchersCount: userVouchers.length
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buscar Jogadores</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Encontre jogadores por nome, email, CPF ou número da rifa</p>
      </div>

      {/* Search Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={
                  searchType === 'name' ? 'Digite o nome do jogador...' :
                  searchType === 'email' ? 'Digite o email do jogador...' :
                  searchType === 'cpf' ? 'Digite o CPF do jogador...' :
                  'Digite o número da rifa...'
                }
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="name">Nome</option>
              <option value="email">Email</option>
              <option value="cpf">CPF</option>
              <option value="number">Número da Rifa</option>
            </select>
            
            <button
              onClick={performSearch}
              disabled={loading}
              className="px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {results.length === 0 && searchTerm && !loading && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-600 dark:text-gray-300">Tente ajustar os termos de busca ou o tipo de pesquisa.</p>
          </div>
        )}

        {results.map((result, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {result.type === 'user' ? (
              // User result
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{result.user.nome}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{result.user.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{result.user.cpf}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cadastrado em</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(result.user.data_cadastro)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                    <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{formatCurrency(result.userStats.totalDeposited)}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Total Depositado</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-green-900 dark:text-green-100">{formatCurrency(result.userStats.totalApproved)}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Aprovado</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                    <Hash className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{result.userStats.numbersCount}</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Números</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <Trophy className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{result.userStats.vouchersCount}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Comprovantes</p>
                  </div>
                </div>

                {result.numbers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Números da Rifa ({result.numbers.length})</h4>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                      {result.numbers.slice(0, 24).map((numero: NumeroRifa) => (
                        <div
                          key={numero.id}
                          className="bg-gray-100 dark:bg-gray-700 text-center py-1 px-2 rounded text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {numero.numero_gerado}
                        </div>
                      ))}
                      {result.numbers.length > 24 && (
                        <div className="bg-gray-200 dark:bg-gray-600 text-center py-1 px-2 rounded text-sm text-gray-600 dark:text-gray-300">
                          +{result.numbers.length - 24}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Number result
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Hash className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{result.numero.numero_gerado}</h3>
                      <p className="text-gray-600 dark:text-gray-300">Número da Rifa</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sorteio</p>
                    <p className="font-medium text-gray-900 dark:text-white">{result.sorteio?.nome || 'Sorteio não encontrado'}</p>
                  </div>
                </div>

                {result.user && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Proprietário do Número</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{result.user.nome}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{result.user.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{result.user.cpf}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(result.userStats.totalApproved)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Aprovado</p>
                      </div>
                    </div>
                  </div>
                )}

                {result.sorteio && (
                  <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Início: {formatDate(result.sorteio.data_inicio)}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      result.sorteio.status === 'aberto' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {result.sorteio.status === 'aberto' ? 'Em andamento' : 'Finalizado'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerSearch;