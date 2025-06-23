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
}

export interface NumeroRifa {
  id: string;
  id_usuario: string;
  id_sorteio: string;
  numero_gerado: string;
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
  configuracao?: {
    total_numeros: number;
    numero_minimo: number;
    numero_maximo: number;
    numeros_por_usuario?: number;
  };
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