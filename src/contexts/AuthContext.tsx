import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { hashPassword, verifyPassword } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    senha: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = () => {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('currentUser');
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Get users from localStorage
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find user by email
      const foundUser = users.find(u => u.email === email);
      
      if (!foundUser) {
        return { success: false, error: 'Email não encontrado' };
      }
      
      // Verify password
      if (!verifyPassword(password, foundUser.senha_hash)) {
        return { success: false, error: 'Senha incorreta' };
      }
      
      // Set current user
      const userWithoutPassword = { ...foundUser };
      delete (userWithoutPassword as any).senha_hash;
      
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    senha: string;
  }) => {
    try {
      setLoading(true);
      
      // Get existing users
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email already exists
      if (users.some(u => u.email === userData.email)) {
        return { success: false, error: 'Email já cadastrado' };
      }
      
      // Check if CPF already exists
      if (users.some(u => u.cpf === userData.cpf)) {
        return { success: false, error: 'CPF já cadastrado' };
      }
      
      // Create new user
      const newUser: User & { senha_hash: string } = {
        id: Date.now().toString(),
        nome: userData.nome,
        email: userData.email,
        cpf: userData.cpf,
        telefone: userData.telefone,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        senha_hash: hashPassword(userData.senha)
      };
      
      // Add to users array
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Set current user (without password)
      const userWithoutPassword = { ...newUser };
      delete (userWithoutPassword as any).senha_hash;
      
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};