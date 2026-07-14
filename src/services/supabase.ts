import { createClient } from '@supabase/supabase-js';

// ============================================================
// Inicialização centralizada do cliente Supabase (Singleton)
// ============================================================
const globalProcess = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL || globalProcess?.env?.VITE_SUPABASE_URL) as string;
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY || globalProcess?.env?.VITE_SUPABASE_ANON_KEY) as string;

// Mock values para testes unitários ou build quando as chaves não forem fornecidas
const defaultUrl = 'https://wxrkanrzxsjopcnnaxoe.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cmthbnJ6eHNqb3Bjbm5heG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.mockKey';

const activeUrl = supabaseUrl || defaultUrl;
const activeKey = supabaseAnonKey || defaultKey;

export const supabase = createClient(activeUrl, activeKey);
export const MOCK_TENANT_ID = 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'; // Usado enquanto não há login
