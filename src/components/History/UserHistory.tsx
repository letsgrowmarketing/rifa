import React, { useState, useEffect } from 'react';
import { History, Trophy, Play, Calendar, Hash, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NumeroRifa, Sorteio, HistoricoVencedor } from '../../types';
import { formatDate } from '../../utils/raffle';

const UserHistory: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<(Sorteio & { userNumbers: NumeroRifa[], isWinner: boolean })[]>([]);
  const [showVideoModal, setShowVideoModal] = useState<Sorteio | null>(null);

  useEffect(() => {
    const loadHistory = () => {
      const allNumbers: NumeroRifa[] = JSON.parse(localStorage.getItem('numerosRifa') || '[]');
      const allSorteios: Sorteio[] = JSON.parse(localStorage.getItem('sorteios') || '[]');

      const userNumbers = allNumbers.filter(n => n.id_usuario === user?.id);
      
      const userHistory = allSorteios.map(sorteio => {
        const numbersInRaffle = userNumbers.filter(n => n.id_sorteio === sorteio.id);
        const isWinner = numbersInRaffle.some(n => 
          sorteio.numeros_premiados?.includes(n.numero_gerado)
        );
        
        return {
          ...sorteio,
          userNumbers: numbersInRaffle,
          isWinner
        };
      }).filter(h => h.userNumbers.length > 0);

      userHistory.sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime());
      
      setHistory(userHistory);
    };

    loadHistory();
  }, [user?.id]);

  const extractVideoUrl = (iframe: string): string => {
    const srcMatch = iframe.match(/src="([^"]+)"/);
    return srcMatch ? srcMatch[1] : '';
  };

  if (history.length === 0) {
    return (
      <div className="w-full max-w-none mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Histórico</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Veja o histórico dos seus sorteios</p>
        </div>
        
        <div className="text-center py-8 sm:py-12">
          <History className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum histórico encontrado</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Você ainda não participou de nenhum sorteio. Envie um comprovante para começar!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Histórico</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Veja o histórico dos seus sorteios</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {history.map((item) => (
          <div
            key={item.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 p-4 sm:p-6 transition-all ${
              item.isWinner 
                ? 'border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                : item.status === 'aberto'
                ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex flex-col space-y-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    item.isWinner 
                      ? 'bg-yellow-200 dark:bg-yellow-800'
                      : item.status === 'aberto'
                      ? 'bg-blue-200 dark:bg-blue-800'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {item.isWinner ? (
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-700 dark:text-yellow-200" />
                    ) : (
                      <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold truncate ${
                      item.isWinner ? 'text-yellow-900 dark:text-yellow-100' : 'text-gray-900 dark:text-white'
                    }`}>
                      {item.nome}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {formatDate(item.data_inicio)}
                      </div>
                      <div className="flex items-center">
                        <Hash className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {item.userNumbers.length} números
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 mb-4">
                  {item.userNumbers.map((numero) => {
                    const isWinning = item.numeros_premiados?.includes(numero.numero_gerado);
                    return (
                      <div
                        key={numero.id}
                        className={`text-center py-1 sm:py-2 px-1 rounded text-xs sm:text-sm font-medium ${
                          isWinning
                            ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 border-2 border-yellow-400 dark:border-yellow-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {numero.numero_gerado}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${
                      item.status === 'aberto'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}>
                      {item.status === 'aberto' ? 'Em andamento' : 'Finalizado'}
                    </span>
                    
                    {item.isWinner && (
                      <span className="px-3 py-1 text-xs sm:text-sm font-medium bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full flex items-center">
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Ganhador!
                      </span>
                    )}
                  </div>

                  {item.video_link && (
                    <button
                      onClick={() => setShowVideoModal(item)}
                      className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                    >
                      <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Ver Sorteio</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {item.numeros_premiados && item.numeros_premiados.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Números sorteados:</p>
                <div className="flex flex-wrap gap-2">
                  {item.numeros_premiados.map((numero, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-sm font-medium rounded"
                    >
                      {numero}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {showVideoModal && showVideoModal.video_link && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-90vh overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Vídeo do Sorteio: {showVideoModal.nome}
              </h3>
              <button
                onClick={() => setShowVideoModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={extractVideoUrl(showVideoModal.video_link)}
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
                <strong>Sorteio:</strong> {showVideoModal.nome}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Status:</strong> {showVideoModal.status === 'aberto' ? 'Em andamento' : 'Finalizado'}
              </p>
              {showVideoModal.data_fim && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Finalizado em:</strong> {formatDate(showVideoModal.data_fim)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHistory;