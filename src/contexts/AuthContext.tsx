import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { hashPassword, verifyPassword } from '../utils/auth';

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

  useEffect(() => {
    // Initialize default admin user if it doesn't exist
    const initializeAdmin = () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const adminExists = users.find((u: User) => u.email === 'admin@rifa.com');
      
      if (!adminExists) {
        const adminUser: User = {
          id: 'admin-001',
          nome: 'Administrador',
          email: 'admin@rifa.com',
          cpf: '000.000.000-00',
          senha_hash: hashPassword('admin123'),
          data_cadastro: new Date().toISOString(),
          isAdmin: true
        };
        
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
      }
    };

    initializeAdmin();

    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: User) => u.email === email);
    
    if (foundUser && verifyPassword(password, foundUser.senha_hash)) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id' | 'data_cadastro' | 'senha_hash'> & { senha: string }): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find((u: User) => u.email === userData.email || u.cpf === userData.cpf)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      nome: userData.nome,
      email: userData.email,
      cpf: userData.cpf,
      senha_hash: hashPassword(userData.senha),
      data_cadastro: new Date().toISOString(),
      isAdmin: userData.email === 'admin@rifa.com' // Make admin if using admin email
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};