import React, { useState, useEffect } from 'react';
import { Users, FileText, Trophy, TrendingUp, DollarSign, CheckCircle, XCircle, Clock, BarChart3, PieChart, Hash } from 'lucide-react';
import { Comprovante, Sorteio, User } from '../../types';
import { formatCurrency, formatDate } from '../../utils/raffle';
import RaffleNumberManagement from './RaffleNumberManagement';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVouchers: 0,
    approvedVouchers: 0,
    rejectedVouchers: 0,
    activeRaffles: 0,
    totalRevenue: 0,
    totalDeposited: 0
  });

  const [recentActivity, setRecentActivity] = useState<Comprovante[]>([]);
  const [topUsers, setTopUsers] = useState<Array<{user: User, totalDeposited: number, totalApproved: number}>>([]);
  const [monthlyData, setMonthlyData] = useState<Array<{month: string, deposits: number, revenue: number}>>([]);
  const [currentRaffle, setCurrentRaffle] = useState<Sorteio | null>(null);
  const [showNumberManagement, setShowNumberManagement] = useState(false);

  useEffect(() => {
    const loadStats = () => {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const comprovantes: Comprovante[] = JSON.parse(localStorage.getItem('comprovantes') || '[]');
      const sorteios: Sorteio[] = JSON.parse(localStorage.getItem('sorteios') || '[]');

      const regularUsers = users.filter(u => !u.isAdmin);
      const pendingVouchers = comprovantes.filter(c => c.status === 'pendente').length;
      const approvedVouchers = comprovantes.filter(c => c.status === 'aprovado').length;
      const rejectedVouchers = comprovantes.filter(c => c.status === 'rejeitado').length;
      const activeRaffles = sorteios.filter(s => s.status === 'aberto').length;
      
      const totalDeposited = comprovantes.reduce((sum, c) => sum + c.valor_informado, 0);
      const totalRevenue = comprovantes
        .filter(c => c.status === 'aprovado')
        .reduce((sum, c) => sum + c.valor_informado, 0);

      setStats({
        totalUsers: regularUsers.length,
        pendingVouchers,
        approvedVouchers,
        rejectedVouchers,
        activeRaffles,
        totalRevenue,
        totalDeposited
      });

      // Get current raffle
      const current = sorteios.find(s => s.status === 'aberto');
      setCurrentRaffle(current || null);

      // Get recent activity (last 5 vouchers)
      const recent = comprovantes
        .sort((a, b) => new Date(b.data_envio).getTime() - new Date(a.data_envio).getTime())
        .slice(0, 5);
      setRecentActivity(recent);

      // Calculate top users by deposit volume
      const userStats = regularUsers.map(user => {
        const userVouchers = comprovantes.filter(c => c.id_usuario === user.id);
        const totalDeposited = userVouchers.reduce((sum, c) => sum + c.valor_informado, 0);
        const totalApproved = userVouchers
          .filter(c => c.status === 'aprovado')
          .reduce((sum, c) => sum + c.valor_informado, 0);
        
        return { user, totalDeposited, totalApproved };
      }).filter(u => u.totalDeposited > 0)
        .sort((a, b) => b.totalDeposited - a.totalDeposited)
        .slice(0, 5);

      setTopUsers(userStats);

      // Generate monthly data for charts
      const monthlyStats = generateMonthlyData(comprovantes);
      setMonthlyData(monthlyStats);
    };

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateMonthlyData = (comprovantes: Comprovante[]) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    return months.map(month => {
      const monthDeposits = Math.floor(Math.random() * 50000) + 10000;
      const monthRevenue = Math.floor(monthDeposits * 0.8);
      return { month, deposits: monthDeposits, revenue: monthRevenue };
    });
  };

  return (
    <div className="w-full max-w-none mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Painel Administrativo</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Visão geral do sistema de rifas</p>
      </div>

      {/* Current Raffle Management */}
      {currentRaffle && (
        <div className="mb-6 lg:mb-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100">Rifa Atual</h2>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-blue-800 dark:text-blue-200 mb-1">{currentRaffle.nome}</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm sm:text-base">
                Status: <span className="font-medium">Aberta para participação</span>
              </p>
            </div>
            <button
              onClick={() => setShowNumberManagement(true)}
              className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              <Hash className="w-4 h-4" />
              <span>Gerenciar Números</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Users className="w-4 h-4 sm:w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm truncate">Usuários Ativos</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <Clock className="w-4 h-4 sm:w-5 h-5 lg:w-6 lg:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingVouchers}</p>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm truncate">Pendentes</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Trophy className="w-4 h-4 sm:w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.activeRaffles}</p>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm truncate">Sorteios Ativos</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <DollarSign className="w-4 h-4 sm:w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
              <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm truncate">Receita Aprovada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 lg:mb-8">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Receita Mensal</h3>
            <BarChart3 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-3">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300 w-8">{data.month}</span>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(data.revenue / 50000) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                  {formatCurrency(data.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Status dos Comprovantes</h3>
            <PieChart className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Aprovados</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.approvedVouchers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Pendentes</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.pendingVouchers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Rejeitados</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.rejectedVouchers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Depositado</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalDeposited)}</p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aprovados</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.approvedVouchers}</p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejeitados</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejectedVouchers}</p>
            </div>
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 dark:text-red-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('vouchers')}
              className="w-full p-3 sm:p-4 text-left bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">Aprovar Comprovantes</span>
                </div>
                {stats.pendingVouchers > 0 && (
                  <span className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full text-xs sm:text-sm font-medium ml-2 flex-shrink-0">
                    {stats.pendingVouchers}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => onNavigate('raffles')}
              className="w-full p-3 sm:p-4 text-left bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700 transition-colors"
            >
              <div className="flex items-center">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Gerenciar Sorteios</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('search')}
              className="w-full p-3 sm:p-4 text-left bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors"
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Buscar Jogadores</span>
              </div>
            </button>
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Usuários por Volume</h3>
          {topUsers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum usuário com depósitos ainda</p>
          ) : (
            <div className="space-y-3">
              {topUsers.map((userStat, index) => (
                <div key={userStat.user.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 dark:text-green-400 font-medium text-xs sm:text-sm">{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userStat.user.nome}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userStat.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(userStat.totalDeposited)}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">{formatCurrency(userStat.totalApproved)} aprovado</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 lg:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Atividade Recente</h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma atividade recente</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((comprovante) => (
              <div key={comprovante.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    comprovante.status === 'aprovado' ? 'bg-green-400 dark:bg-green-500' :
                    comprovante.status === 'rejeitado' ? 'bg-red-400 dark:bg-red-500' :
                    'bg-yellow-400 dark:bg-yellow-500'
                  }`}></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {comprovante.usuario_nome} - {formatCurrency(comprovante.valor_informado)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comprovante.data_envio)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${
                  comprovante.status === 'aprovado' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                  comprovante.status === 'rejeitado' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                  'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                }`}>
                  {comprovante.status === 'aprovado' ? 'Aprovado' :
                   comprovante.status === 'rejeitado' ? 'Rejeitado' :
                   'Pendente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Number Management Modal */}
      {showNumberManagement && currentRaffle && (
        <RaffleNumberManagement
          sorteio={currentRaffle}
          onClose={() => setShowNumberManagement(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;