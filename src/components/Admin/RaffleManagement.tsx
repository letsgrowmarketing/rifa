import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Calendar, Users, Play, X, Link, Settings, Dice1, Globe, Edit } from 'lucide-react';
import { Sorteio, NumeroRifa, User } from '../../types';
import { formatDate } from '../../utils/raffle';

const RaffleManagement: React.FC = () => {
  const [sorteios, setSorteios] = useState<Sorteio[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState<Sorteio | null>(null);
  const [showResultModal, setShowResultModal] = useState<Sorteio | null>(null);
  const [resultType, setResultType] = useState<'manual' | 'auto' | 'federal'>('auto');
  const [manualNumbers, setManualNumbers] = useState('');
  const [newRaffle, setNewRaffle] = useState({
    nome: '',
    video_link: ''
  });

  useEffect(() => {
    const loadSorteios = () => {
      const stored: Sorteio[] = JSON.parse(localStorage.getItem('sorteios') || '[]');
      setSorteios(stored);
    };

    loadSorteios();
  }, []);

  const createRaffle = () => {
    if (!newRaffle.nome.trim()) return;

    // Close any existing open raffles
    const updatedSorteios = sorteios.map(s => 
      s.status === 'aberto' ? { ...s, status: 'encerrado' as const, data_fim: new Date().toISOString() } : s
    );

    const novoSorteio: Sorteio = {
      id: Date.now().toString(),
      nome: newRaffle.nome.trim(),
      data_inicio: new Date().toISOString(),
      status: 'aberto',
      video_link: newRaffle.video_link.trim() ? convertToIframe(newRaffle.video_link.trim()) : undefined
    };

    const allSorteios = [...updatedSorteios, novoSorteio];
    setSorteios(allSorteios);
    localStorage.setItem('sorteios', JSON.stringify(allSorteios));

    setNewRaffle({ nome: '', video_link: '' });
    setShowCreateModal(false);
  };

  const convertToIframe = (url: string): string => {
    // Convert YouTube URL to embed format
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    
    return `<iframe width="560" height="315" src="${embedUrl}?controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  };

  const finishRaffle = (sorteio: Sorteio) => {
    setShowResultModal(sorteio);
  };

  const processRaffleResult = () => {
    if (!showResultModal) return;

    const numeros: NumeroRifa[] = JSON.parse(localStorage.getItem('numerosRifa') || '[]');
    const raffleNumbers = numeros.filter(n => n.id_sorteio === showResultModal.id);
    
    if (raffleNumbers.length === 0) {
      alert('Este sorteio não possui números para sortear.');
      return;
    }

    let winningNumbers: string[] = [];

    if (resultType === 'manual') {
      winningNumbers = manualNumbers.split(',').map(n => n.trim()).filter(n => n);
      if (winningNumbers.length === 0) {
        alert('Digite pelo menos um número vencedor.');
        return;
      }
    } else if (resultType === 'auto') {
      // Automatic draw - pick random winning numbers
      const winningCount = Math.min(3, raffleNumbers.length);
      const shuffled = [...raffleNumbers].sort(() => 0.5 - Math.random());
      const winners = shuffled.slice(0, winningCount);
      winningNumbers = winners.map(w => w.numero_gerado);
    } else if (resultType === 'federal') {
      // Simulate federal lottery scraping
      winningNumbers = generateFederalNumbers();
    }

    const winnerId = raffleNumbers.find(n => winningNumbers.includes(n.numero_gerado))?.id_usuario;

    const updatedSorteio: Sorteio = {
      ...showResultModal,
      status: 'encerrado',
      data_fim: new Date().toISOString(),
      ganhador_id: winnerId,
      numeros_premiados: winningNumbers
    };

    const updatedSorteios = sorteios.map(s => 
      s.id === showResultModal.id ? updatedSorteio : s
    );

    setSorteios(updatedSorteios);
    localStorage.setItem('sorteios', JSON.stringify(updatedSorteios));
    setShowResultModal(null);
    setManualNumbers('');
  };

  const generateFederalNumbers = (): string[] => {
    // Simulate federal lottery numbers
    const numbers = [];
    for (let i = 0; i < 5; i++) {
      numbers.push(Math.floor(10000 + Math.random() * 90000).toString());
    }
    return numbers;
  };

  const updateVideoLink = (sorteio: Sorteio, videoLink: string) => {
    const iframeCode = videoLink.trim() ? convertToIframe(videoLink.trim()) : undefined;

    const updatedSorteio = { ...sorteio, video_link: iframeCode };
    const updatedSorteios = sorteios.map(s => 
      s.id === sorteio.id ? updatedSorteio : s
    );

    setSorteios(updatedSorteios);
    localStorage.setItem('sorteios', JSON.stringify(updatedSorteios));
    setShowVideoModal(null);
  };

  const getRaffleStats = (sorteio: Sorteio) => {
    const numeros: NumeroRifa[] = JSON.parse(localStorage.getItem('numerosRifa') || '[]');
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    
    const raffleNumbers = numeros.filter(n => n.id_sorteio === sorteio.id);
    const uniqueUsers = new Set(raffleNumbers.map(n => n.id_usuario));
    
    return {
      totalNumbers: raffleNumbers.length,
      participants: uniqueUsers.size
    };
  };

  return (
    <div className="w-full max-w-none mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
      <div className="mb-6 lg:mb-8 flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Sorteios</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Crie novos sorteios e gerencie os existentes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Novo Sorteio</span>
        </button>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {sorteios.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum sorteio criado</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Crie seu primeiro sorteio para começar</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              Criar Sorteio
            </button>
          </div>
        ) : (
          sorteios.map((sorteio) => {
            const stats = getRaffleStats(sorteio);
            return (
              <div
                key={sorteio.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 p-4 sm:p-6 ${
                  sorteio.status === 'aberto' ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        sorteio.status === 'aberto' ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <Trophy className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          sorteio.status === 'aberto' ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-300'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold truncate ${
                          sorteio.status === 'aberto' ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-white'
                        }`}>
                          {sorteio.nome}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Início: {formatDate(sorteio.data_inicio)}
                          </div>
                          {sorteio.data_fim && (
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Fim: {formatDate(sorteio.data_fim)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4">
                      <div className="bg-white dark:bg-gray-700 p-2 sm:p-3 rounded border dark:border-gray-600">
                        <div className="flex items-center">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400 mr-1 sm:mr-2" />
                          <div>
                            <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">{stats.participants}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">Participantes</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-2 sm:p-3 rounded border dark:border-gray-600">
                        <div className="flex items-center">
                          <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 dark:text-green-400 mr-1 sm:mr-2" />
                          <div>
                            <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">{stats.totalNumbers}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">Números</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-2 sm:p-3 rounded border dark:border-gray-600">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          sorteio.status === 'aberto' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {sorteio.status === 'aberto' ? 'Em Andamento' : 'Finalizado'}
                        </span>
                      </div>
                      {sorteio.numeros_premiados && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 sm:p-3 rounded border border-yellow-200 dark:border-yellow-700">
                          <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">Números Sorteados:</p>
                          <div className="flex flex-wrap gap-1">
                            {sorteio.numeros_premiados.slice(0, 2).map((numero, i) => (
                              <span key={i} className="px-1 py-0.5 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                                {numero}
                              </span>
                            ))}
                            {sorteio.numeros_premiados.length > 2 && (
                              <span className="text-xs text-yellow-600 dark:text-yellow-300">
                                +{sorteio.numeros_premiados.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      {sorteio.status === 'aberto' && stats.totalNumbers > 0 && (
                        <button
                          onClick={() => finishRaffle(sorteio)}
                          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-red-600 dark:bg-red-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors text-xs sm:text-sm"
                        >
                          <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Finalizar Sorteio</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => setShowVideoModal(sorteio)}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                      >
                        <Link className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Vídeo</span>
                      </button>

                      {sorteio.video_link && (
                        <button
                          onClick={() => {
                            // Extract src from iframe
                            const srcMatch = sorteio.video_link.match(/src="([^"]+)"/);
                            if (srcMatch) {
                              window.open(srcMatch[1], '_blank');
                            }
                          }}
                          className="w-full sm:w-auto flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs sm:text-sm"
                        >
                          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Ver Vídeo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Raffle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-90vh overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Criar Novo Sorteio</h3>
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
                    Nome do Sorteio
                  </label>
                  <input
                    type="text"
                    value={newRaffle.nome}
                    onChange={(e) => setNewRaffle({...newRaffle, nome: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Ex: Sorteio Dezembro 2024"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link do Vídeo (opcional)
                  </label>
                  <input
                    type="url"
                    value={newRaffle.video_link}
                    onChange={(e) => setNewRaffle({...newRaffle, video_link: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Será convertido automaticamente para iframe
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createRaffle}
                    disabled={!newRaffle.nome.trim()}
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

      {/* Video Link Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-90vh overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Link do Vídeo</h3>
                <button
                  onClick={() => setShowVideoModal(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {showVideoModal.nome}
                  </label>
                  <input
                    type="url"
                    defaultValue={showVideoModal.video_link ? showVideoModal.video_link.match(/src="([^"]+)"/)?.[1] || '' : ''}
                    onChange={(e) => {
                      const updatedModal = { ...showVideoModal, video_link: e.target.value };
                      setShowVideoModal(updatedModal);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Será convertido automaticamente para iframe
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowVideoModal(null)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => updateVideoLink(showVideoModal, showVideoModal.video_link || '')}
                    className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-90vh overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Finalizar Sorteio</h3>
                <button
                  onClick={() => setShowResultModal(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Resultado
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="auto"
                        checked={resultType === 'auto'}
                        onChange={(e) => setResultType(e.target.value as any)}
                        className="mr-2"
                      />
                      <Dice1 className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Resultado Automático</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="manual"
                        checked={resultType === 'manual'}
                        onChange={(e) => setResultType(e.target.value as any)}
                        className="mr-2"
                      />
                      <Edit className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Resultado Manual</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="federal"
                        checked={resultType === 'federal'}
                        onChange={(e) => setResultType(e.target.value as any)}
                        className="mr-2"
                      />
                      <Globe className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Loteria Federal</span>
                    </label>
                  </div>
                </div>

                {resultType === 'manual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Números Vencedores (separados por vírgula)
                    </label>
                    <input
                      type="text"
                      value={manualNumbers}
                      onChange={(e) => setManualNumbers(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="12345, 67890, 54321"
                    />
                  </div>
                )}

                {resultType === 'federal' && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Os números serão obtidos automaticamente do site da Loteria Federal.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowResultModal(null)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={processRaffleResult}
                    className="flex-1 bg-red-600 dark:bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                  >
                    Finalizar
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

export default RaffleManagement;