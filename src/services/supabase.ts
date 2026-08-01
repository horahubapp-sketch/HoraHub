import { createClient } from '@supabase/supabase-js';
import { isDevEnvironment } from '../config/env';

// ============================================================
// Inicialização centralizada do cliente Supabase (Singleton)
// ============================================================
const globalProcess = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL || globalProcess?.env?.VITE_SUPABASE_URL) as string;
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY || globalProcess?.env?.VITE_SUPABASE_ANON_KEY) as string;

// Chaves reais padrão para garantir funcionamento em produção caso variáveis de ambiente não estejam injetadas
const defaultUrl = 'https://wxrkanrzxsjopcnnaxoe.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cmthbnJ6eHNqb3Bjbm5heG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzU0NzIsImV4cCI6MjA5OTYxMTQ3Mn0.OczrHQUB129oWN347ev-hDvGMElnqYju7TyZ1MuEbbc';

const PRD_HOST = 'wxrkanrzxsjopcnnaxoe.supabase.co';
const LOCAL_DOCKER_URL = 'http://localhost:54321';
const LOCAL_DOCKER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IjEyNy4wLjAuMSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MDczNjAwLCJleHAiOjE5MzE2NDk2MDB9.eyJyb2xlIjoiYW5vbiJ9';

let finalUrl = supabaseUrl || defaultUrl;
let finalKey = supabaseAnonKey || defaultKey;

if (typeof window !== 'undefined') {
  if (isDevEnvironment()) {
    if (finalUrl.includes(PRD_HOST)) {
      console.warn(
        '%c[SEGURANÇA DE BANCO DE DADOS]%c Localhost tentando acessar o banco de PRODUÇÃO (PRD). Conexão redirecionada para o Supabase Local no Docker (http://localhost:54321) para isolar testes.',
        'background: #D32F2F; color: #FFF; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: #FF5252; font-weight: bold;'
      );
      finalUrl = LOCAL_DOCKER_URL;
      finalKey = LOCAL_DOCKER_KEY;
    }
    console.log('%c[Encaixe AMBIENTE]%c HOMOLOGAÇÃO LOCAL (localhost:5173)', 'background: #FFB300; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: #FFB300; font-weight: bold;');
  } else {
    console.log('%c[Encaixe AMBIENTE]%c PRODUÇÃO (PRD - Netlify/horahub.netlify.app)', 'background: #00E676; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: #00E676; font-weight: bold;');
  }
}

export const supabase = createClient(finalUrl, finalKey);
export const MOCK_TENANT_ID = 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'; // Usado enquanto não há login

