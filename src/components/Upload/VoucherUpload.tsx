import React, { useState, useEffect } from 'react';
import { Upload, Image, DollarSign, AlertCircle, CheckCircle, Clock, Ticket, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { simulateAIValidation, formatCurrency, generateRaffleNumbers } from '../../utils/raffle';
import { Comprovante, NumeroRifa, Sorteio, Cupom } from '../../types';

const VoucherUpload: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    valor: '',
    imagem: null as File | null,
    cupom: ''
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [systemConfig, setSystemConfig] = useState({
    minDepositAmount: 100,
    blockValue: 100,
    numbersPerBlock: 10
  });
  const [cupomValidation, setCupomValidation] = useState<{
    valid: boolean;
    cupom?: Cupom;
    message: string;
  } | null>(null);

  useEffect(() => {
    loadSystemConfig();
  }, []);

  const loadSystemConfig = () => {
    const config = JSON.parse(localStorage.getItem('systemConfig') || '{}');
    setSystemConfig({
      minDepositAmount: config.minDepositAmount || 100,
      blockValue: config.blockValue || 100,
      numbersPerBlock: config.numbersPerBlock || 10
    });
  };

  const validateCoupon = (codigo: string) => {
    if (!codigo.trim()) {
      setCupomValidation(null);
      return;
    }

    const cupons: Cupom[] = JSON.parse(localStorage.getItem('cupons') || '[]');
    const cupom = cupons.find(c => 
      c.codigo.toUpperCase() === codigo.toUpperCase() && 
      c.ativo
    );

    if (!cupom) {
      setCupomValidation({
        valid: false,
        message: 'Cupom não encontrado'
      });
      return;
    }

    if (cupom.data_expiracao && new Date(cupom.data_expiracao) < new Date()) {
      setCupomValidation({
        valid: false,
        message: 'Cupom expirado'
      });
      return;
    }

    if (cupom.uso_maximo && cupom.uso_atual >= cupom.uso_maximo) {
      setCupomValidation({
        valid: false,
        message: 'Cupom esgotado'
      });
      return;
    }

    setCupomValidation({
      valid: true,
      cupom,
      message: cupom.tipo === 'quantidade' 
        ? `+${cupom.valor} números extras`
        : `${cupom.valor}% de desconto`
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({...formData, imagem: file});
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.valor || !formData.imagem || !user) return;

    setLoading(true);
    setMessage({ type: 'info', text: 'Processando comprovante...' });

    try {
      let valor = parseFloat(formData.valor);
      let descontoAplicado = 0;
      let cupomUsado = '';
      let bonusNumbers = 0;

      // Apply coupon if valid
      if (cupomValidation?.valid && cupomValidation.cupom) {
        const cupom = cupomValidation.cupom;
        cupomUsado = cupom.codigo;

        if (cupom.tipo === 'percentual') {
          descontoAplicado = valor * (cupom.valor / 100);
          valor = valor - descontoAplicado;
        } else if (cupom.tipo === 'quantidade') {
          bonusNumbers = cupom.valor;
        }

        // Update coupon usage
        const cupons: Cupom[] = JSON.parse(localStorage.getItem('cupons') || '[]');
        const updatedCupons = cupons.map(c => 
          c.id === cupom.id ? { ...c, uso_atual: c.uso_atual + 1 } : c
        );
        localStorage.setItem('cupons', JSON.stringify(updatedCupons));
      }
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        setMessage({ type: 'info', text: 'Validando comprovante com IA...' });
        const validation = await simulateAIValidation(valor, base64);
        
        // Create comprovante
        const comprovante: Comprovante = {
          id: Date.now().toString(),
          id_usuario: user.id,
          valor_informado: parseFloat(formData.valor),
          valor_lido: validation.valor_lido,
          imagem_comprovante: base64,
          status: validation.aprovado ? 'aprovado' : 'pendente',
          data_envio: new Date().toISOString(),
          cupom_usado: cupomUsado || undefined,
          desconto_aplicado: descontoAplicado > 0 ? descontoAplicado : undefined,
          usuario_nome: user.nome
        };

        // Save comprovante
        const comprovantes: Comprovante[] = JSON.parse(localStorage.getItem('comprovantes') || '[]');
        comprovantes.push(comprovante);
        localStorage.setItem('comprovantes', JSON.stringify(comprovantes));
        
        if (validation.aprovado) {
          // Get current raffle
          const sorteios: Sorteio[] = JSON.parse(localStorage.getItem('sorteios') || '[]');
          const currentRaffle = sorteios.find(s => s.status === 'aberto');
          
          if (currentRaffle) {
            // Generate numbers
            const numbers = generateRaffleNumbers(valor, currentRaffle.configuracao);
            
            // Add bonus numbers
            for (let i = 0; i < bonusNumbers; i++) {
              const bonusNumber = Math.floor(10000 + Math.random() * 90000).toString();
              if (!numbers.includes(bonusNumber)) {
                numbers.push(bonusNumber);
              }
            }
            
            const numerosRifa: NumeroRifa[] = numbers.map(numero => ({
              id: `${Date.now()}-${numero}-${Math.random()}`,
              id_usuario: user.id,
              id_sorteio: currentRaffle.id,
              numero_gerado: numero,
              data_geracao: new Date().toISOString()
            }));
            
            const existingNumbers = JSON.parse(localStorage.getItem('numerosRifa') || '[]');
            localStorage.setItem('numerosRifa', JSON.stringify([...existingNumbers, ...numerosRifa]));
          }
          
          let successMessage = 'Comprovante aprovado! Números gerados automaticamente.';
          if (cupomUsado) {
            successMessage += ` Cupom ${cupomUsado} aplicado com sucesso!`;
          }
          
          setMessage({ 
            type: 'success', 
            text: successMessage
          });
        } else {
          setMessage({ 
            type: 'info', 
            text: 'Comprovante enviado para análise manual. Você será notificado quando for aprovado.' 
          });
        }

        setFormData({ valor: '', imagem: null, cupom: '' });
        setPreview(null);
        setCupomValidation(null);
      };
      
      reader.readAsDataURL(formData.imagem);
    } catch (error) {
      console.error('Error processing voucher:', error);
      setMessage({ type: 'error', text: 'Erro ao processar comprovante. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const calculateNumbers = (valor: string) => {
    const valorNum = parseFloat(valor) || 0;
    let finalValue = valorNum;

    // Apply coupon discount
    if (cupomValidation?.valid && cupomValidation.cupom?.tipo === 'percentual') {
      const desconto = valorNum * (cupomValidation.cupom.valor / 100);
      finalValue = valorNum - desconto;
    }

    const blocks = Math.floor(finalValue / systemConfig.blockValue);
    let totalNumbers = blocks * systemConfig.numbersPerBlock;

    // Add bonus numbers from coupon
    if (cupomValidation?.valid && cupomValidation.cupom?.tipo === 'quantidade') {
      totalNumbers += cupomValidation.cupom.valor;
    }

    return { totalNumbers, finalValue, discount: valorNum - finalValue };
  };

  const numbersInfo = calculateNumbers(formData.valor);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Enviar Comprovante</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Faça upload do comprovante de pagamento para gerar seus números</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor Depositado
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="number"
                step="0.01"
                min={systemConfig.minDepositAmount}
                value={formData.valor}
                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0,00"
                disabled={loading}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-1 space-y-1 sm:space-y-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Valor mínimo: {formatCurrency(systemConfig.minDepositAmount)} • Cada {formatCurrency(systemConfig.blockValue)} = {systemConfig.numbersPerBlock} números
              </p>
              {formData.valor && (
                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                  {numbersInfo.discount > 0 && (
                    <div className="text-blue-600 dark:text-blue-400">
                      Desconto: {formatCurrency(numbersInfo.discount)}
                    </div>
                  )}
                  <div>= {numbersInfo.totalNumbers} números</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cupom de Desconto (opcional)
            </label>
            <div className="relative">
              <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={formData.cupom}
                onChange={(e) => {
                  setFormData({...formData, cupom: e.target.value});
                  validateCoupon(e.target.value);
                }}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Digite o código do cupom"
                disabled={loading}
              />
            </div>
            {cupomValidation && (
              <div className={`mt-2 p-2 rounded-md text-sm ${
                cupomValidation.valid 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
              }`}>
                {cupomValidation.message}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comprovante de Pagamento
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-green-400 dark:hover:border-green-500 transition-colors">
              <div className="space-y-1 text-center">
                {preview ? (
                  <div className="mb-4">
                    <img src={preview} alt="Preview" className="max-w-full max-h-48 mx-auto rounded" />
                  </div>
                ) : (
                  <Image className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                )}
                <div className="flex text-sm text-gray-600 dark:text-gray-300">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                  >
                    <span>{preview ? 'Alterar imagem' : 'Selecionar arquivo'}</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                      disabled={loading}
                      required
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG até 10MB</p>
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' :
              message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700' :
              'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />}
                {message.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />}
                {message.type === 'info' && <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />}
                <p className={`text-sm ${
                  message.type === 'success' ? 'text-green-700 dark:text-green-300' :
                  message.type === 'error' ? 'text-red-700 dark:text-red-300' :
                  'text-blue-700 dark:text-blue-300'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.valor || !formData.imagem}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 dark:bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Enviar Comprovante</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 lg:mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">Como funciona?</h3>
        <ul className="space-y-2 text-blue-700 dark:text-blue-300">
          <li className="flex items-start">
            <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <span className="text-sm sm:text-base">Cada {formatCurrency(systemConfig.blockValue)} depositados geram {systemConfig.numbersPerBlock} números únicos</span>
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <span className="text-sm sm:text-base">Use cupons para ganhar números extras ou descontos</span>
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <span className="text-sm sm:text-base">O comprovante é validado automaticamente por IA</span>
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <span className="text-sm sm:text-base">Números são gerados instantaneamente após aprovação</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VoucherUpload;