import React, { useState, useEffect } from 'react';
import { Upload, Hash, History, Play, TrendingUp, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Comprovante, NumeroRifa, Sorteio } from '../../types';
import DashboardCard from './DashboardCard';
import { formatCurrency } from '../../utils/raffle';

interface UserDashboardProps {
  onNavigate: (page: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    comprovantes: 0,
    numeros: 0,
    pendentes: 0,
    valorTotal: 0
  });
  const [currentRaffle, setCurrentRaffle] = useState<Sorteio | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    const loadStats = () => {
      const comprovantes: Comprovante[] = JSON.parse(localStorage.getItem('comprovantes') || '[]');
      const numeros: NumeroRifa[] = JSON.parse(localStorage.getItem('numerosRifa') || '[]');
      const sorteios: Sorteio[] = JSON.parse(localStorage.getItem('sorteios') || '[]');

      const userComprovantes = comprovantes.filter(c => c.id_usuario === user?.id);
      const userNumeros = numeros.filter(n => n.id_usuario === user?.id);
      const pendentes = userComprovantes.filter(c => c.status === 'pendente').length;
      const valorTotal = userComprovantes
        .filter(c => c.status === 'aprovado')
        .reduce((sum, c) => sum + c.valor_informado, 0);

      setStats({
        comprovantes: userComprovantes.length,
        numeros: userNumeros.length,
        pendentes,
        valorTotal
      });

      const current = sorteios.find(s => s.status === 'aberto');
      setCurrentRaffle(current || null);
    };

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const extractVideoUrl = (iframe: string): string => {
    const srcMatch = iframe.match(/src="([^"]+)"/);
    return srcMatch ? srcMatch[1] : '';
  };

  return (
    <div className="w-full max-w-none mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Bem-vindo, {user?.nome}!</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Gerencie seus comprovantes e acompanhe seus números da sorte</p>
      </div>

      {currentRaffle && (
        <div className="mb-6 lg:mb-8 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center space-x-3 mb-3">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-base sm:text-lg font-semibold text-green-900 dark:text-green-100">Sorteio Atual</h2>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-green-800 dark:text-green-200 mb-2">{currentRaffle.nome}</h3>
          <p className="text-green-700 dark:text-green-300 text-sm sm:text-base">
            Status: <span className="font-medium">Aberto para participação</span>
          </p>
          {currentRaffle.video_link && (
            <button
              onClick={() => setShowVideoModal(true)}
              className="mt-3 flex items-center space-x-2 bg-green-600 dark:bg-green-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm sm:text-base"
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Ver vídeo do sorteio</span>
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Upload className="w-4 h-4 sm:w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.comprovantes}</p>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm lg:text-base truncate">Comprovantes</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Hash className="w-4 h-4 sm:w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.numeros}</p>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm lg:text-base truncate">Números</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <Upload className="w-4 h-4 sm:w-5 h-5 lg:w-6 lg:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.pendentes}</p>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm lg:text-base truncate">Pendentes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <DashboardCard
          title="Enviar Comprovante"
          description="Faça upload do comprovante de pagamento para gerar números"
          icon={Upload}
          onClick={() => onNavigate('upload')}
          badge={stats.pendentes > 0 ? `${stats.pendentes} pendente${stats.pendentes > 1 ? 's' : ''}` : undefined}
          badgeColor="yellow"
        />

        <DashboardCard
          title="Meus Números"
          description={`Visualize seus ${stats.numeros} números da sorte`}
          icon={Hash}
          onClick={() => onNavigate('numbers')}
          badge={stats.numeros > 0 ? `${stats.numeros} números` : 'Nenhum número'}
          badgeColor={stats.numeros > 0 ? 'green' : 'red'}
        />

        <DashboardCard
          title="Histórico"
          description="Veja o histórico de sorteios anteriores"
          icon={History}
          onClick={() => onNavigate('history')}
        />
      </div>

      {/* Video Modal */}
      {showVideoModal && currentRaffle?.video_link && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-90vh overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Vídeo do Sorteio: {currentRaffle.nome}
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={extractVideoUrl(currentRaffle.video_link)}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Sorteio:</strong> {currentRaffle.nome}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Status:</strong> {currentRaffle.status === 'aberto' ? 'Em andamento' : 'Finalizado'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;