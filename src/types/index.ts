export interface User {
  id: string;
  nome: string;
  cpf: string;
  telefone?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  auth_id?: string;
}

export interface Comprovante {
  id: string;
  user_id: string;
  valor_informado: number;
  imagem_comprovante: string;
  valor_lido?: number;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: string;
  updated_at: string;
  usuario_nome?: string;
  cupom_usado?: string;
  desconto_aplicado?: number;
}

export interface NumeroRifa {
  id: string;
  user_id: string;
  sorteio_id: string;
  numero_gerado: string;
  created_at: string;
}

export interface Premio {
  id: string;
  sorteio_id?: string;
  nome: string;
  quantidade_numeros: number;
  ordem: number;
  created_at?: string;
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
  created_at: string;
  updated_at: string;
}

export interface Cupom {
  id: string;
  codigo: string;
  tipo: 'quantidade' | 'percentual';
  valor: number;
  ativo: boolean;
  data_criacao: string;
  data_expiracao?: string;
  uso_maximo?: number;
  uso_atual: number;
  created_at: string;
  updated_at: string;
}

export interface HistoricoVencedor {
  id: string;
  user_id: string;
  sorteio_id: string;
  numeros_premiados: string[];
  data: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & { senha: string; email: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}