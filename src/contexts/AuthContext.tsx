import { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface Empresa {
  id: string;
  nome: string;
  email: string | null;
  slug: string | null;
  cor_primaria: string | null;
  cor_secundaria: string | null;
  logo_url: string | null;
  plano_status: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  tenantId: string | null;
  empresa: Empresa | null;
  loading: boolean;
  signIn: (email: string, senhha: string) => Promise<any>;
  signUp: (nomeDono: string, email: string, senha: string, nomeEmpresa: string, slugDesejado: string) => Promise<any>;
  signOut: () => Promise<void>;
  refreshEmpresa: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar Empresa baseada no dono_id
  const fetchEmpresaParaUsuario = async (userId: string): Promise<Empresa | null> => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, email, slug, cor_primaria, cor_secundaria, logo_url, plano_status')
        .eq('dono_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[HoraHub] Erro ao buscar empresa do dono:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('[HoraHub] Erro ao buscar empresa do dono:', err);
      return null;
    }
  };

  const refreshEmpresa = async () => {
    if (user) {
      const emp = await fetchEmpresaParaUsuario(user.id);
      if (emp) {
        setEmpresa(emp);
        setTenantId(emp.id);
      }
    }
  };

  useEffect(() => {
    // 1. Escuta alterações na sessão (login, logout, refresh token)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const emp = await fetchEmpresaParaUsuario(session.user.id);
        if (emp) {
          setEmpresa(emp);
          setTenantId(emp.id);
        } else {
          // Fallback temporário para tenant mock de seed local
          // Isso ajuda nos testes locais caso o usuário de seed precise carregar
          setTenantId('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7');
        }
      } else {
        setEmpresa(null);
        setTenantId(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const emp = await fetchEmpresaParaUsuario(session.user.id);
        if (emp) {
          setEmpresa(emp);
          setTenantId(emp.id);
        } else {
          setTenantId('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7');
        }
      } else {
        setEmpresa(null);
        setTenantId(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helpers de Autenticação
  const signIn = async (email: string, senha: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (
    nomeDono: string, 
    email: string, 
    senha: string, 
    nomeEmpresa: string, 
    slugDesejado: string
  ) => {
    // 1. Cadastro no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome_dono: nomeDono
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Não foi possível inicializar o usuário.');

    // 2. Criação automática da Empresa multi-tenant vinculada
    const { data: empData, error: empError } = await supabase
      .from('empresas')
      .insert({
        nome: nomeEmpresa,
        email: email,
        slug: slugDesejado,
        dono_id: authData.user.id,
        cor_primaria: '#00E676',
        cor_secundaria: '#121214'
      })
      .select()
      .single();

    if (empError) {
      console.error('[HoraHub] Erro ao cadastrar empresa na trigger:', empError);
      throw empError;
    }

    return { user: authData.user, empresa: empData };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setTenantId(null);
    setEmpresa(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      tenantId,
      empresa,
      loading,
      signIn,
      signUp,
      signOut,
      refreshEmpresa
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
