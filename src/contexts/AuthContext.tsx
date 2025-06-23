import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, getCurrentUserProfile } from '../lib/supabase';
import { Database } from '../types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    nome: string;
    email: string;
    cpf: string;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setSupabaseUser(session.user);
        const profile = await getCurrentUserProfile();
        setUser(profile);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          const profile = await getCurrentUserProfile();
          setUser(profile);
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao fazer login' };
    }
  };

  const register = async (userData: {
    nome: string;
    email: string;
    cpf: string;
    senha: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.senha,
        options: {
          data: {
            nome: userData.nome,
            cpf: userData.cpf,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao criar conta' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      loading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};