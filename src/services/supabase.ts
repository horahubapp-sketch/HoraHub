import { createClient } from '@supabase/supabase-js';

// ============================================================
// Inicialização centralizada do cliente Supabase (Singleton)
// ============================================================
const globalProcess = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL || globalProcess?.env?.VITE_SUPABASE_URL) as string;
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY || globalProcess?.env?.VITE_SUPABASE_ANON_KEY) as string;

// Chaves reais padrão para garantir funcionamento em produção caso variáveis de ambiente não estejam injetadas
const defaultUrl = 'https://wxrkanrzxsjopcnnaxoe.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cmthbnJ6eHNqb3Bjbm5heG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzU0NzIsImV4cCI6MjA5OTYxMTQ3Mn0.OczrHQUB129oWN347ev-hDvGMElnqYju7TyZ1MuEbbc';

const activeUrl = supabaseUrl || defaultUrl;
const activeKey = supabaseAnonKey || defaultKey;

export const supabase = createClient(activeUrl, activeKey);
export const MOCK_TENANT_ID = 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'; // Usado enquanto não há login
