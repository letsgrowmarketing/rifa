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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          setSupabaseUser(session.user);
          
          // Wait a bit for the trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            const profile = await getCurrentUserProfile();
            setUser(profile);
          } catch (error) {
            console.error('Error getting user profile:', error);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setSupabaseUser(session.user);
          
          // Wait for profile creation on signup
          if (event === 'SIGNED_UP' || event === 'SIGNED_IN') {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          try {
            const profile = await getCurrentUserProfile();
            setUser(profile);
          } catch (error) {
            console.error('Error getting user profile:', error);
            setUser(null);
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
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setSupabaseUser(data.user);
        
        try {
          const profile = await getCurrentUserProfile();
          setUser(profile);
        } catch (profileError) {
          console.error('Error getting profile after login:', profileError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Login exception:', error);
      return { success: false, error: 'Erro inesperado ao fazer login' };
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
      
      console.log('Registering user:', userData.email);
      
      // Check if user already exists by CPF
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('cpf')
          .eq('cpf', userData.cpf)
          .maybeSingle();

        if (existingUser) {
          return { success: false, error: 'CPF já cadastrado no sistema' };
        }
      } catch (error) {
        // Ignore error if table doesn't exist or no permission
        console.log('Could not check existing user, proceeding with signup');
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
        
        if (error.message.includes('User already registered')) {
          return { success: false, error: 'Email já cadastrado no sistema' };
        }
        
        if (error.message.includes('over_email_send_rate_limit')) {
          return { success: false, error: 'Muitas tentativas de cadastro. Aguarde alguns minutos antes de tentar novamente.' };
        }
        
        return { success: false, error: error.message };
      }

      if (data.user) {
        setSupabaseUser(data.user);
        
        // Wait for profile creation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          const profile = await getCurrentUserProfile();
          setUser(profile);
        } catch (profileError) {
          console.error('Error getting profile after registration:', profileError);
        }
      }

      console.log('Registration successful:', data);
      return { success: true };
    } catch (error) {
      console.error('Registration exception:', error);
      return { success: false, error: 'Erro inesperado ao criar conta' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      clearAuthState();
    } catch (error) {
      console.error('Logout error:', error);
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