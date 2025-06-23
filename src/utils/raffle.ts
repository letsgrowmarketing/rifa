export const generateRaffleNumbers = (valor: number, sorteioConfig?: any): string[] => {
  // Get system configuration
  const config = JSON.parse(localStorage.getItem('systemConfig') || '{}');
  const blockValue = config.blockValue || 100;
  const numbersPerBlock = config.numbersPerBlock || 10;
  
  const blocosDe100 = Math.floor(valor / blockValue);
  const totalNumeros = blocosDe100 * numbersPerBlock;
  const numeros: string[] = [];
  
  // Use raffle configuration if available
  const minNum = sorteioConfig?.numero_minimo || 1;
  const maxNum = sorteioConfig?.numero_maximo || 99999;
  
  for (let i = 0; i < totalNumeros; i++) {
    let numero: string;
    
    if (maxNum <= 99999) {
      // For smaller ranges, generate within the specified range
      const randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      numero = randomNum.toString().padStart(5, '0');
    } else {
      // For larger ranges, use the original method
      numero = Math.floor(10000 + Math.random() * 90000).toString();
    }
    
    // Ensure no duplicates
    if (!numeros.includes(numero)) {
      numeros.push(numero);
    } else {
      i--; // Try again if duplicate
    }
  }
  
  return numeros;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Simulate AI validation of payment vouchers
export const simulateAIValidation = async (valor_informado: number, imagemBase64: string): Promise<{
  valor_lido: number;
  aprovado: boolean;
}> => {
  // Check if AI validation is enabled
  const config = JSON.parse(localStorage.getItem('systemConfig') || '{}');
  const aiEnabled = config.aiValidationEnabled !== false; // Default to true
  
  if (!aiEnabled) {
    // If AI is disabled, always return as not approved for manual review
    return {
      valor_lido: valor_informado,
      aprovado: false
    };
  }
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate AI reading with 90% accuracy
  const accuracy = Math.random();
  if (accuracy > 0.1) {
    return {
      valor_lido: valor_informado,
      aprovado: true
    };
  } else {
    return {
      valor_lido: valor_informado * 0.8, // Simulate reading error
      aprovado: false
    };
  }
};