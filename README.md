# Sistema de Rifas com Supabase

Sistema completo de gerenciamento de rifas com autenticação, banco de dados real e interface administrativa.

## 🚀 Funcionalidades

### 👥 **Usuários**
- Autenticação segura com Supabase Auth
- Cadastro com validação de CPF
- Perfis de usuário e administrador

### 🎫 **Sistema de Rifas**
- Criação e gerenciamento de sorteios
- Configuração flexível de números
- Múltiplos prêmios por sorteio
- Geração automática de números

### 💰 **Comprovantes**
- Upload de comprovantes de pagamento
- Validação automática por IA (simulada)
- Aprovação manual por administradores
- Sistema de cupons de desconto

### 🎯 **Números da Rifa**
- Geração automática baseada no valor
- Visualização em tempo real
- Controle de números entregues/disponíveis
- Seleção manual de ganhadores

### 🏆 **Administração**
- Dashboard completo com estatísticas
- Gerenciamento de usuários
- Controle de comprovantes
- Configurações do sistema
- Busca avançada de jogadores

## 🛠 **Tecnologias**

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL com RLS
- **UI**: Lucide React Icons

## 📦 **Configuração**

### 1. **Configurar Supabase**

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrações SQL em `supabase/migrations/`
3. Configure as variáveis de ambiente

### 2. **Variáveis de Ambiente**

Crie um arquivo `.env` baseado no `.env.example`:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. **Instalação**

```bash
npm install
npm run dev
```

## 🗄️ **Estrutura do Banco**

### **Tabelas Principais**
- `users` - Perfis de usuários
- `sorteios` - Sorteios/rifas
- `premios` - Prêmios de cada sorteio
- `comprovantes` - Comprovantes de pagamento
- `numeros_rifa` - Números gerados
- `cupons` - Cupons de desconto
- `system_config` - Configurações do sistema

### **Segurança**
- Row Level Security (RLS) habilitado
- Políticas específicas para usuários/admins
- Autenticação via Supabase Auth

## 🔐 **Contas de Teste**

**Administrador:**
- Email: `admin@rifa.com`
- Senha: `admin123`

## 🎯 **Funcionalidades Avançadas**

### **Geração de Números**
- Função PostgreSQL para geração automática
- Configuração flexível por sorteio
- Prevenção de duplicatas

### **Sistema de Cupons**
- Cupons de quantidade (números extras)
- Cupons de desconto percentual
- Controle de uso e expiração

### **Validação IA**
- Simulação de validação automática
- Fallback para aprovação manual
- Configurável via admin

### **Dashboard Administrativo**
- Estatísticas em tempo real
- Gráficos de receita
- Top usuários por volume
- Atividade recente

## 📱 **Responsividade**

Interface totalmente responsiva com:
- Design mobile-first
- Breakpoints otimizados
- Navegação adaptativa
- Componentes flexíveis

## 🎨 **Temas**

- Modo claro/escuro
- Cores customizáveis via admin
- CSS variables dinâmicas
- Persistência de preferências

## 🔄 **Migração de Dados**

O sistema inclui:
- Migrações SQL completas
- Triggers para auditoria
- Funções de banco otimizadas
- Índices para performance

## 📈 **Performance**

- Queries otimizadas
- Índices estratégicos
- Paginação automática
- Cache de configurações

## 🛡️ **Segurança**

- RLS em todas as tabelas
- Validação de entrada
- Sanitização de dados
- Políticas granulares

## 🚀 **Deploy**

O sistema está pronto para deploy em:
- Vercel
- Netlify
- Qualquer provedor que suporte React

Certifique-se de configurar as variáveis de ambiente no provedor escolhido.