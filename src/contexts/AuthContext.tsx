import { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { dbAdapter } from '../services/dbAdapter';
import { isDevEnvironment } from '../config/env';

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
  signUp: (nomeDono: string, email: string, senha: string, nomeEmpresa: string, slugDesejado: string, cpfCnpj?: string) => Promise<any>;
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

  // Carregar Empresa baseada no dono_id ou email (via dbAdapter)
  const fetchEmpresaParaUsuario = async (userId: string, userEmail?: string): Promise<Empresa | null> => {
    if (isDevEnvironment()) {
      const empresas = await dbAdapter.empresas.getAll();

      const emailLower = userEmail?.toLowerCase() || '';

      // 1. Mapeamento explícito de contas SuperAdmin para a Empresa Testes Encaixe
      if (emailLower === 'admin@horahub.com' || emailLower === 'admin@encaixe.com' || emailLower === 'horahubapp@gmail.com') {
        const adminEmp = empresas.find((e: any) => e.id === 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7' || e.email === 'horahubapp@gmail.com');
        if (adminEmp) return adminEmp;
      }

      // 2. Busca direta por E-mail do Estabelecimento
      if (emailLower) {
        const empByEmail = empresas.find((e: any) => e.email?.toLowerCase() === emailLower);
        if (empByEmail) return empByEmail;
      }

      // 3. Busca por ID da Empresa / Dono ID
      const empById = empresas.find((e: any) => e.id === userId || e.dono_id === userId);
      if (empById) return empById;

      // 4. Retorna a empresa padrão do seed (Empresa Testes Encaixe) sem forçar outra empresa de clientes
      const defaultAdmin = empresas.find((e: any) => e.id === 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7') || empresas[0];
      return defaultAdmin || null;
    }

    try {
      const emailLower = userEmail?.toLowerCase() || '';

      // 1. Mapeamento explícito de contas SuperAdmin para a Empresa Testes Encaixe em Produção
      if (emailLower === 'admin@horahub.com' || emailLower === 'admin@encaixe.com' || emailLower === 'horahubapp@gmail.com') {
        const { data: adminEmp } = await supabase
          .from('empresas')
          .select('id, nome, email, slug, cor_primaria, cor_secundaria, logo_url, plano_status')
          .or(`id.eq.e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7,slug.eq.encaixe-teste`)
          .limit(1)
          .maybeSingle();

        if (adminEmp) return adminEmp;
      }

      // 2. Busca padrão por dono_id
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, email, slug, cor_primaria, cor_secundaria, logo_url, plano_status')
        .eq('dono_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Encaixe] Erro ao buscar empresa do dono:', error);
      }
      if (data) return data;

      // 3. Fallback por E-mail
      if (userEmail) {
        const { data: empByEmail } = await supabase
          .from('empresas')
          .select('id, nome, email, slug, cor_primaria, cor_secundaria, logo_url, plano_status')
          .eq('email', userEmail)
          .maybeSingle();

        if (empByEmail) return empByEmail;
      }

      return null;
    } catch (err) {
      console.error('[Encaixe] Erro ao buscar empresa do dono:', err);
      return null;
    }
  };

  // Buscar empresa com retry automático para tratar a assincronia pós-cadastro
  const fetchEmpresaComRetry = async (userId: string, userEmail?: string, retries = 5, delay = 500): Promise<Empresa | null> => {
    for (let i = 0; i < retries; i++) {
      const emp = await fetchEmpresaParaUsuario(userId, userEmail);
      if (emp) return emp;
      
      if (userEmail === 'admin@encaixe.com' || userEmail === 'admin@horahub.com') {
        break;
      }
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return null;
  };

  const refreshEmpresa = async () => {
    const currentEmail = user?.email || undefined;
    const currentId = user?.id || tenantId || '';
    const emp = await fetchEmpresaParaUsuario(currentId, currentEmail);
    if (emp) {
      setEmpresa(emp);
      setTenantId(emp.id);
    }
  };

  useEffect(() => {
    // 1. Escuta alterações na sessão (login, logout, refresh token)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const emp = await fetchEmpresaComRetry(session.user.id, session.user.email);
        if (emp) {
          setEmpresa(emp);
          setTenantId(emp.id);
        } else if (session.user.email === 'admin@encaixe.com' || session.user.email === 'admin@horahub.com') {
          // Apenas atrela o mock do seed se for especificamente o usuário de seed
          setTenantId('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7');
        } else {
          // Se já estiver populado de forma síncrona pelo signUp, não limpa!
          setEmpresa(prev => prev && prev.id ? prev : null);
          setTenantId(prev => prev ? prev : null);
        }
      } else {
        if (isDevEnvironment()) {
          const emp = await fetchEmpresaParaUsuario('', 'admin@horahub.com');
          if (emp) {
            setEmpresa(emp);
            setTenantId(emp.id);
          }
        } else {
          setEmpresa(null);
          setTenantId(null);
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const emp = await fetchEmpresaComRetry(session.user.id, session.user.email);
        if (emp) {
          setEmpresa(emp);
          setTenantId(emp.id);
        } else if (session.user.email === 'admin@encaixe.com' || session.user.email === 'admin@horahub.com') {
          // Apenas atrela o mock do seed se for especificamente o usuário de seed
          setTenantId('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7');
        } else {
          // Se já estiver populado de forma síncrona pelo signUp, não limpa!
          setEmpresa(prev => prev && prev.id ? prev : null);
          setTenantId(prev => prev ? prev : null);
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
    if (isDevEnvironment()) {
      const mockUser: any = {
        id: `u-local-${Date.now()}`,
        email,
        user_metadata: {}
      };

      const empresas = await dbAdapter.empresas.getAll();
      const emp = empresas.find((e: any) => e.email?.toLowerCase() === email.toLowerCase()) || 
                  empresas.find((e: any) => e.nome?.toLowerCase().includes('joão') || e.nome?.toLowerCase().includes('joao')) || 
                  empresas[0];

      setUser(mockUser);
      setSession({ user: mockUser } as any);
      setEmpresa(emp);
      setTenantId(emp.id);

      return { user: mockUser, session: { user: mockUser } };
    }

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
    slugDesejado: string,
    cpfCnpj?: string
  ) => {
    if (isDevEnvironment()) {
      const mockId = `e-local-${Date.now()}`;
      const novaEmpresa: any = {
        id: mockId,
        nome: nomeEmpresa,
        email: email,
        slug: slugDesejado,
        cpf_cnpj: cpfCnpj || null,
        plano_status: 'pendente',
        plano_nome: 'Bronze',
        valor_mensalidade: 99.90,
        saldo_devedor: 0,
        data_renovacao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cor_primaria: '#00E676',
        cor_secundaria: '#121214'
      };

      const localEmpresasStr = localStorage.getItem('encaixe_superadmin_empresas');
      const empresasExistentes = localEmpresasStr ? JSON.parse(localEmpresasStr) : [];
      const listaAtualizada = [novaEmpresa, ...empresasExistentes];
      localStorage.setItem('encaixe_superadmin_empresas', JSON.stringify(listaAtualizada));
      localStorage.setItem(`encaixe_empresa_${mockId}`, JSON.stringify(novaEmpresa));

      const mockUser: any = {
        id: `u-local-${Date.now()}`,
        email: email,
        user_metadata: { nome_dono: nomeDono }
      };

      setUser(mockUser);
      setEmpresa(novaEmpresa);
      setTenantId(mockId);

      return { user: mockUser, empresa: novaEmpresa };
    }

    // 1. Cadastro no Auth com suporte a re-vínculo se a conta já existir no Supabase Auth
    let authUser: any = null;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome_dono: nomeDono
        }
      }
    });

    if (authError && (authError.message?.includes('User already registered') || authError.message?.includes('already registered'))) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });
      if (signInError) {
        throw new Error('Este e-mail já possui um registro de conta. Digite a senha correta para acessar ou use outro e-mail.');
      }
      authUser = signInData.user;
    } else if (authError) {
      throw authError;
    } else {
      authUser = authData.user;
    }

    if (!authUser) throw new Error('Não foi possível inicializar o usuário.');

    // Verificar se a empresa já existe para este dono
    const { data: empExistente } = await supabase
      .from('empresas')
      .select('*')
      .eq('dono_id', authUser.id)
      .maybeSingle();

    if (empExistente) {
      setEmpresa(empExistente);
      setTenantId(empExistente.id);
      return { user: authUser, empresa: empExistente };
    }

    // 2. Criação automática da Empresa multi-tenant vinculada
    const insertPayload: any = {
      nome: nomeEmpresa,
      email: email,
      slug: slugDesejado,
      dono_id: authUser.id,
      cor_primaria: '#00E676',
      cor_secundaria: '#121214'
    };

    if (cpfCnpj) {
      insertPayload.cpf_cnpj = cpfCnpj;
    }

    let { data: empData, error: empError } = await supabase
      .from('empresas')
      .insert(insertPayload)
      .select()
      .single();

    // Fallback caso a coluna cpf_cnpj ainda não tenha sido aplicada no banco de dados
    if (empError && empError.message?.includes('cpf_cnpj')) {
      console.warn('[Encaixe] Coluna cpf_cnpj não encontrada no banco, tentando cadastro sem este campo...');
      delete insertPayload.cpf_cnpj;
      const retry = await supabase
        .from('empresas')
        .insert(insertPayload)
        .select()
        .single();

      empData = retry.data;
      empError = retry.error;
    }

    if (empError) {
      console.error('[Encaixe] Erro ao cadastrar empresa:', empError);
      throw empError;
    }

    // Atualiza estados na mesma hora síncronamente para evitar qualquer flash no redirecionamento
    setEmpresa(empData);
    setTenantId(empData.id);
    setUser(authData.user);

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
