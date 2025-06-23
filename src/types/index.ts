export interface User {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  senha_hash: string;
  data_cadastro: string;
  isAdmin?: boolean;
}

export interface Comprovante {
  id: string;
  id_usuario: string;
  valor_informado: number;
  imagem_comprovante: string;
  valor_lido?: number;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  data_envio: string;
  usuario_nome?: string;
  cupom_usado?: string;
  desconto_aplicado?: number;
}

export interface NumeroRifa {
  id: string;
  id_usuario: string;
  id_sorteio: string;
  numero_gerado: string;
}

export interface Premio {
  id: string;
  nome: string;
  quantidade_numeros: number;
  ordem: number; // 1 = principal, 2 = segundo, etc.
}

export interface Sorteio {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim?: string;
  status: 'aberto' | 'encerrado';
  ganhador_id?: string;
  video_link?: string;
  numeros_premiados?: string[];
  premios?: Premio[];
  configuracao?: {
    total_numeros: number;
    numero_minimo: number;
    numero_maximo: number;
    numeros_por_usuario?: number;
  };
}

export interface Cupom {
  id: string;
  codigo: string;
  tipo: 'quantidade' | 'percentual';
  valor: number; // quantidade de números extras ou % de desconto
  ativo: boolean;
  data_criacao: string;
  data_expiracao?: string;
  uso_maximo?: number;
  uso_atual: number;
}

export interface HistoricoVencedor {
  id: string;
  id_usuario: string;
  id_sorteio: string;
  numeros_premiados: string[];
  data: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'data_cadastro' | 'senha_hash'> & { senha: string }) => Promise<boolean>;
  logout: () => void;
}