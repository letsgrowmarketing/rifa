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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthState = () => {
    setUser(null);
    setSupabaseUser(null);
  };

  const handleAuthError = async (error: any) => {
    console.error('Auth error:', error);
    
    // Check if it's a refresh token error
    if (error?.message?.includes('refresh_token_not_found') || 
        error?.message?.includes('Invalid Refresh Token') ||
        error?.code === 'refresh_token_not_found') {
      
      console.log('Invalid refresh token detected, clearing session...');
      
      // Clear the invalid session
      await supabase.auth.signOut();
      clearAuthState();
      
      // Clear any stored tokens from localStorage
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          await handleAuthError(error);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          setSupabaseUser(session.user);
          const profile = await getCurrentUserProfile();
          setUser(profile);
        }
      } catch (error) {
        await handleAuthError(error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'TOKEN_REFRESHED' && !session) {
          // Token refresh failed, clear auth state
          clearAuthState();
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          setSupabaseUser(session.user);
          
          // Wait a bit for the trigger to create the user profile
          if (event === 'SIGNED_UP') {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          try {
            const profile = await getCurrentUserProfile();
            setUser(profile);
          } catch (error) {
            console.error('Error getting user profile:', error);
            await handleAuthError(error);
          }
        } else {
          clearAuthState();
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
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Login exception:', error);
      return { success: false, error: 'Erro inesperado ao fazer login' };
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
      console.log('Registering user:', userData.email);
      
      // First, check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('cpf')
        .eq('cpf', userData.cpf)
        .single();

      if (existingUser) {
        return { success: false, error: 'CPF já cadastrado no sistema' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.senha,
        options: {
          data: {
            nome: userData.nome,
            cpf: userData.cpf,
            telefone: userData.telefone,
          },
        },
      });

      if (error) {
        console.error('Registration error:', error);
        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          return { success: false, error: 'Email já cadastrado no sistema' };
        }
        
        if (error.message.includes('over_email_send_rate_limit')) {
          return { success: false, error: 'Muitas tentativas de cadastro. Aguarde alguns minutos antes de tentar novamente.' };
        }
        
        return { success: false, error: error.message };
      }

      // If signup was successful but user needs email confirmation
      if (data.user && !data.session) {
        return { success: false, error: 'Verifique seu email para confirmar a conta' };
      }

      console.log('Registration successful:', data);
      return { success: true };
    } catch (error) {
      console.error('Registration exception:', error);
      return { success: false, error: 'Erro inesperado ao criar conta' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      clearAuthState();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      clearAuthState();
    }
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