import { createClient } from '@supabase/supabase-js';
import { isDevEnvironment } from '../config/env';

// ============================================================
// Inicialização centralizada do cliente Supabase (Singleton)
// HML (localhost:5173) → Docker local (porta 54321)
// PRD (horahub.netlify.app) → Supabase Cloud (variáveis Netlify)
// NUNCA usar fallback hardcoded para PRD em código-fonte.
// ============================================================
const globalProcess = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL || globalProcess?.env?.VITE_SUPABASE_URL) as string;
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY || globalProcess?.env?.VITE_SUPABASE_ANON_KEY) as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[HoraHub] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.\n' +
    'HML: configure .env.local apontando para http://127.0.0.1:54321\n' +
    'PRD: configure as variáveis de ambiente no Netlify.'
  );
}

if (typeof window !== 'undefined') {
  if (isDevEnvironment()) {
    console.log('%c[HoraHub AMBIENTE]%c 🟡 HOMOLOGAÇÃO LOCAL → Docker Supabase (127.0.0.1:54321)', 'background: #FFB300; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: #FFB300; font-weight: bold;');
    console.log('%c[HoraHub]%c Banco LOCAL isolado. Dados de PRD protegidos.', 'color: #FFB300; font-weight: bold;', 'color: #888;');
  } else {
    console.log('%c[HoraHub AMBIENTE]%c 🟢 PRODUÇÃO → Supabase Cloud (horahub.netlify.app)', 'background: #00E676; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: #00E676; font-weight: bold;');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const MOCK_TENANT_ID = 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'; // Usado enquanto não há login

