// ============================================================
// CONFIGURAÇÃO CENTRALIZADA DE AMBIENTES (HOMOLOGAÇÃO VS PRODUÇÃO)
// HoraHub / Encaixe
// ============================================================

export const isDevEnvironment = (): boolean => {
  if (typeof window === 'undefined') {
    const proc = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
    return proc?.env?.NODE_ENV === 'development';
  }
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

export const isProdEnvironment = (): boolean => {
  return !isDevEnvironment();
};

/**
 * Retorna a URL Base dinâmica da aplicação respeitando o ambiente atual:
 * Dev / Homologação: http://localhost:5173
 * Produção: https://horahub.com.br ou https://horahub.netlify.app
 */
export const getAppBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return isDevEnvironment() ? 'http://localhost:5173' : 'https://horahub.com.br';
};

/**
 * Helper para gerar link público de agendamento por slug no ambiente atual
 */
export const getAgendamentoPublicUrl = (slug: string): string => {
  const baseUrl = getAppBaseUrl();
  return `${baseUrl}/agendar/${slug}`;
};
