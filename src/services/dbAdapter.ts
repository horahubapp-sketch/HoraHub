import { supabase } from './supabase';
import { isDevEnvironment } from '../config/env';
import { compressImageFile } from '../utils/imageUtils';

// ============================================================
// ADAPTADOR CENTRALIZADO DE BANCO DE DADOS (dbAdapter)
// Roteia 100% das operações de Leitura e Escrita do App.
// - Localhost (5173): Opera exclusivamente em LocalStorage isolado.
// - Produção (Netlify): Opera exclusivamente no Supabase Cloud.
// ============================================================

export const dbAdapter = {
  // ------------------------------------------------------------
  // 1. EMPRESAS
  // ------------------------------------------------------------
  empresas: {
    async getAll() {
      if (isDevEnvironment()) {
        const localData = localStorage.getItem('encaixe_superadmin_empresas');
        let list: any[] = localData ? JSON.parse(localData) : [];

        if (!list || list.length === 0) {
          list = [
            { id: 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', nome: 'Empresa Testes Encaixe', email: 'horahubapp@gmail.com', slug: 'encaixe-teste', plano_status: 'ativo', plano_nome: 'Bronze', valor_mensalidade: 99.9, saldo_devedor: 0, data_renovacao: '2026-08-15' },
            { id: '7e89dc5a-e809-46cd-8a82-737c6f148f43', nome: 'Barbearia Neiva', email: 'weber@encaixe.com.br', slug: 'barbearianeiva', plano_status: 'ativo', plano_nome: 'Bronze', valor_mensalidade: 99.9, saldo_devedor: 0, data_renovacao: '2026-08-22' },
            { id: '46d49ef1-448b-4f16-a812-ddb9bfc38583', nome: 'Estudio Le', email: 'le@studio.com.br', slug: 'estudiole', plano_status: 'ativo', plano_nome: 'Bronze', valor_mensalidade: 99.9, saldo_devedor: 0, data_renovacao: '2026-08-29' }
          ];
        }

        // Garante que a Barbearia João Cortes esteja presente como cadastro pendente no final da lista
        const temJoao = list.some((e: any) => e.id === 'e-joao-cortes-local' || e.nome?.toLowerCase().includes('joão') || e.nome?.toLowerCase().includes('joao'));
        if (!temJoao) {
          list.push({
            id: 'e-joao-cortes-local',
            nome: 'Barbearia João Cortes',
            email: 'joaocortes@encaixe.com.br',
            slug: 'barbeariajoaocortes',
            plano_status: 'pendente',
            plano_nome: 'Bronze',
            valor_mensalidade: 99.9,
            saldo_devedor: 0,
            data_renovacao: '2026-08-30'
          });
        }

        // Deduplicação estrita por ID e mesclagem de overrides por tenantId (encaixe_empresa_${id})
        const uniqueMap = new Map<string, any>();
        list.forEach((item: any) => {
          if (item && item.id) {
            const localKey = `encaixe_empresa_${item.id}`;
            const storedOverride = localStorage.getItem(localKey);
            if (storedOverride) {
              try {
                const parsedOverride = JSON.parse(storedOverride);
                item = { ...item, ...parsedOverride };
              } catch (e) {
                // ignore
              }
            }
            uniqueMap.set(item.id, item);
          }
        });
        const dedupedList = Array.from(uniqueMap.values());

        // Garante que a Empresa Testes Encaixe do SuperAdmin seja a posição 0 do array
        const adminIndex = dedupedList.findIndex((e: any) => e.id === 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7');
        if (adminIndex > 0) {
          const [adminItem] = dedupedList.splice(adminIndex, 1);
          dedupedList.unshift(adminItem);
        }

        localStorage.setItem('encaixe_superadmin_empresas', JSON.stringify(dedupedList));
        return dedupedList;
      }

      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome', { ascending: true });
      if (error) throw error;
      return data || [];
    },

    async getById(tenantId: string) {
      if (isDevEnvironment()) {
        const empresas = await this.getAll();
        const emp = empresas.find((e: any) => e.id === tenantId);

        const localKey = `encaixe_empresa_${tenantId}`;
        const localData = localStorage.getItem(localKey);
        let localObj = null;
        if (localData) {
          try {
            localObj = JSON.parse(localData);
          } catch (e) {}
        }

        if (emp || localObj) {
          return { ...(emp || {}), ...(localObj || {}) };
        }

        return empresas[0] || null;
      }

      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', tenantId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    async checkSlug(slug: string, currentEmpresaId?: string) {
      const slugNorm = slug.trim().toLowerCase();
      if (isDevEnvironment()) {
        const empresas = await this.getAll();
        const ocupado = empresas.some((e: any) => e.slug?.toLowerCase() === slugNorm && e.id !== currentEmpresaId);
        return !ocupado;
      }

      let query = supabase
        .from('empresas')
        .select('id')
        .ilike('slug', slugNorm);

      if (currentEmpresaId) {
        query = query.neq('id', currentEmpresaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).length === 0;
    },

    async saveConfig(tenantId: string, payload: any) {
      if (isDevEnvironment()) {
        const empresas = await this.getAll();
        const existing = empresas.find((e: any) => e.id === tenantId) || {};
        const finalData = { ...existing, id: tenantId, ...payload };

        const localKey = `encaixe_empresa_${tenantId}`;
        localStorage.setItem(localKey, JSON.stringify(finalData));

        const listStr = localStorage.getItem('encaixe_superadmin_empresas');
        let list: any[] = listStr ? JSON.parse(listStr) : empresas;
        
        let found = false;
        list = list.map((e: any) => {
          if (e.id === tenantId) {
            found = true;
            return { ...e, ...payload };
          }
          return e;
        });

        if (!found) {
          list.push(finalData);
        }

        localStorage.setItem('encaixe_superadmin_empresas', JSON.stringify(list));
        return finalData;
      }

      const { data, error } = await supabase
        .from('empresas')
        .update(payload)
        .eq('id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async updateStatus(tenantId: string, novoStatus: 'ativo' | 'bloqueado' | 'pendente') {
      if (isDevEnvironment()) {
        const list = await this.getAll();
        const updated = list.map((e: any) => e.id === tenantId ? { ...e, plano_status: novoStatus } : e);
        localStorage.setItem('encaixe_superadmin_empresas', JSON.stringify(updated));

        const localKey = `encaixe_empresa_${tenantId}`;
        const stored = localStorage.getItem(localKey);
        if (stored) {
          const item = JSON.parse(stored);
          item.plano_status = novoStatus;
          localStorage.setItem(localKey, JSON.stringify(item));
        }

        return updated;
      }

      const { data, error } = await supabase
        .from('empresas')
        .update({ plano_status: novoStatus })
        .eq('id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async resetPassword(empOrId: any) {
      if (isDevEnvironment()) {
        return true;
      }

      const donoId = typeof empOrId === 'string' ? empOrId : empOrId?.dono_id;
      const userEmail = typeof empOrId === 'object' ? empOrId?.email : null;

      if (donoId) {
        try {
          const { error } = await supabase.rpc('reset_user_password', {
            target_dono_id: donoId,
            new_password: '@Mudar.123'
          });
          if (!error) return true;
        } catch (e) {
          console.warn('[Encaixe] RPC reset_user_password não executou, tentando envio via Auth...', e);
        }
      }

      if (userEmail) {
        const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
          redirectTo: `${window.location.origin}/login`
        });
        if (error) throw error;
        return true;
      }

      return true;
    },

    async register(nomeDono: string, email: string, senha: string, nomeEmpresa: string, slugDesejado: string, cpfCnpj?: string) {
      if (isDevEnvironment()) {
        const mockId = `e-local-${Date.now()}`;
        const novaEmpresa = {
          id: mockId,
          nome: nomeEmpresa,
          email,
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

        const list = await this.getAll();
        const updated = [novaEmpresa, ...list];
        localStorage.setItem('encaixe_superadmin_empresas', JSON.stringify(updated));

        return {
          user: { id: `u-local-${Date.now()}`, email, user_metadata: { nome_dono: nomeDono } },
          empresa: novaEmpresa
        };
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome_dono: nomeDono } }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao registrar usuário.');

      const insertPayload: any = {
        nome: nomeEmpresa,
        email,
        slug: slugDesejado,
        dono_id: authData.user.id,
        cor_primaria: '#00E676',
        cor_secundaria: '#121214'
      };

      if (cpfCnpj) insertPayload.cpf_cnpj = cpfCnpj;

      let { data: empData, error: empError } = await supabase
        .from('empresas')
        .insert(insertPayload)
        .select()
        .single();

      if (empError) throw empError;
      return { user: authData.user, empresa: empData };
    }
  },

  // ------------------------------------------------------------
  // 2. SERVIÇOS
  // ------------------------------------------------------------
  servicos: {
    async getByTenant(tenantId: string) {
      if (isDevEnvironment()) {
        const localKey = `encaixe_servicos_demo_${tenantId}`;
        const localData = localStorage.getItem(localKey);
        if (localData) return JSON.parse(localData);

        const inicialMock = [
          { id: 's-mock-1', nome: 'Corte Degradê', duracao_minutos: 45, preco: 60.00 },
          { id: 's-mock-2', nome: 'Barboterapia', duracao_minutos: 30, preco: 45.00 },
          { id: 's-mock-3', nome: 'Corte Degradê + Barba', duracao_minutos: 60, preco: 95.00 }
        ];
        localStorage.setItem(localKey, JSON.stringify(inicialMock));
        return inicialMock;
      }

      const { data, error } = await supabase
        .from('servicos')
        .select('id, nome, duracao_minutos, preco')
        .eq('tenant_id', tenantId)
        .order('nome', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    async save(tenantId: string, servico: any) {
      if (isDevEnvironment()) {
        const list = await this.getByTenant(tenantId);
        const localKey = `encaixe_servicos_demo_${tenantId}`;
        let novaLista;

        if (servico.id) {
          novaLista = list.map((s: any) => s.id === servico.id ? { ...s, ...servico } : s);
        } else {
          const novo = { id: `s-local-${Date.now()}`, ...servico };
          novaLista = [...list, novo];
        }

        localStorage.setItem(localKey, JSON.stringify(novaLista));
        return novaLista;
      }

      if (servico.id) {
        const { data, error } = await supabase
          .from('servicos')
          .update(servico)
          .eq('id', servico.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('servicos')
          .insert({ tenant_id: tenantId, ...servico })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },

    async delete(tenantId: string, id: string) {
      if (isDevEnvironment()) {
        const list = await this.getByTenant(tenantId);
        const localKey = `encaixe_servicos_demo_${tenantId}`;
        const novaLista = list.filter((s: any) => s.id !== id);
        localStorage.setItem(localKey, JSON.stringify(novaLista));
        return novaLista;
      }

      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }
  },

  // ------------------------------------------------------------
  // 3. FUNCIONÁRIOS (PROFISSIONAIS)
  // ------------------------------------------------------------
  funcionarios: {
    async getByTenant(tenantId: string) {
      if (isDevEnvironment()) {
        const localKey = `encaixe_funcionarios_demo_${tenantId}`;
        const localData = localStorage.getItem(localKey);
        if (localData) return JSON.parse(localData);

        const funcsMock = [
          { id: 'f-mock-1', nome: 'Bruno Silva', especialidade: 'Cabelo & Barba Sênior', comissao_percentual: 50, foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150' },
          { id: 'f-mock-2', nome: 'Lucas Nogueira', especialidade: 'Corte Moderno & Tintura', comissao_percentual: 40, foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150' },
          { id: 'f-mock-3', nome: 'Ana Costa', especialidade: 'Barba Clássica & Visagismo', comissao_percentual: 45, foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150' },
          { id: 'f-mock-4', nome: 'Mateus Santos', especialidade: 'Cortes Clássicos & Infantil', comissao_percentual: 50, foto_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150&h=150' }
        ];
        localStorage.setItem(localKey, JSON.stringify(funcsMock));
        return funcsMock;
      }

      const { data, error } = await supabase
        .from('funcionarios')
        .select('id, nome, especialidade, comissao_percentual, foto_url')
        .eq('tenant_id', tenantId)
        .order('nome', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    async getVinculos(funcionarioId: string) {
      if (isDevEnvironment()) {
        return [];
      }
      const { data, error } = await supabase
        .from('funcionario_servicos')
        .select('servico_id')
        .eq('funcionario_id', funcionarioId);
      if (error) throw error;
      return (data || []).map((v: any) => v.servico_id);
    },

    async getJornadas(funcionarioId: string) {
      if (isDevEnvironment()) {
        return [];
      }
      const { data, error } = await supabase
        .from('jornadas_trabalho')
        .select('dia_semana, hora_inicio, hora_fim, almoco_inicio, almoco_fim')
        .eq('funcionario_id', funcionarioId);
      if (error) throw error;
      return data || [];
    },

    async save(tenantId: string, funcionario: any) {
      if (isDevEnvironment()) {
        const list = await this.getByTenant(tenantId);
        const localKey = `encaixe_funcionarios_demo_${tenantId}`;
        let novaLista;

        if (funcionario.id) {
          novaLista = list.map((f: any) => f.id === funcionario.id ? { ...f, ...funcionario } : f);
        } else {
          const novo = { id: `f-local-${Date.now()}`, ...funcionario };
          novaLista = [...list, novo];
        }

        localStorage.setItem(localKey, JSON.stringify(novaLista));
        return novaLista;
      }

      if (funcionario.id) {
        const { data, error } = await supabase
          .from('funcionarios')
          .update(funcionario)
          .eq('id', funcionario.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('funcionarios')
          .insert({ tenant_id: tenantId, ...funcionario })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },

    async delete(tenantId: string, id: string) {
      if (isDevEnvironment()) {
        const list = await this.getByTenant(tenantId);
        const localKey = `encaixe_funcionarios_demo_${tenantId}`;
        const novaLista = list.filter((f: any) => f.id !== id);
        localStorage.setItem(localKey, JSON.stringify(novaLista));
        return novaLista;
      }

      const { error } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }
  },

  // ------------------------------------------------------------
  // 4. AGENDAMENTOS
  // ------------------------------------------------------------
  agendamentos: {
    async getByDate(tenantId: string, dataKey: string) {
      if (isDevEnvironment()) {
        const localKey = `encaixe_agendamentos_${tenantId}_${dataKey}`;
        const localData = localStorage.getItem(localKey);
        if (localData) return JSON.parse(localData);

        const funcs = await dbAdapter.funcionarios.getByTenant(tenantId);
        const bloqueiosPadrao = funcs.map((f: any, index: number) => {
          const horasAlmoco = [['12:00', '13:00'], ['13:00', '14:00'], ['12:30', '13:30'], ['12:00', '13:00']];
          const [inicio, fim] = horasAlmoco[index % horasAlmoco.length];
          return {
            id: `bloqueio-almoco-${f.id}-${dataKey}`,
            funcionarioId: f.id,
            clienteNome: 'Almoço',
            servicoNome: 'Intervalo',
            horarioInicio: inicio,
            horarioFim: fim,
            status: 'bloqueio' as const
          };
        });

        localStorage.setItem(localKey, JSON.stringify(bloqueiosPadrao));
        return bloqueiosPadrao;
      }

      const inicioDia = `${dataKey}T00:00:00Z`;
      const fimDia = `${dataKey}T23:59:59Z`;

      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          funcionario_id,
          cliente_name,
          horario_inicio,
          horario_fim,
          status,
          servicos ( nome, preco )
        `)
        .eq('tenant_id', tenantId)
        .gte('horario_inicio', inicioDia)
        .lte('horario_inicio', fimDia)
        .neq('status', 'cancelado');

      if (error) throw error;
      return data || [];
    },

    async create(tenantId: string, dataKey: string, agendamento: any) {
      if (isDevEnvironment()) {
        const list = await this.getByDate(tenantId, dataKey);
        const localKey = `encaixe_agendamentos_${tenantId}_${dataKey}`;
        const novo = { id: `ag-local-${Date.now()}`, ...agendamento };
        const novaLista = [...list, novo];
        localStorage.setItem(localKey, JSON.stringify(novaLista));
        return novaLista;
      }

      const { data, error } = await supabase
        .from('agendamentos')
        .insert({ tenant_id: tenantId, ...agendamento })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async updateStatus(tenantId: string, dataKey: string, id: string, novoStatus: string) {
      if (isDevEnvironment()) {
        const list = await this.getByDate(tenantId, dataKey);
        const localKey = `encaixe_agendamentos_${tenantId}_${dataKey}`;
        const updated = list.map((a: any) => a.id === id ? { ...a, status: novoStatus } : a);
        localStorage.setItem(localKey, JSON.stringify(updated));
        return updated;
      }

      const { data, error } = await supabase
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(tenantId: string, dataKey: string, id: string) {
      if (isDevEnvironment()) {
        const list = await this.getByDate(tenantId, dataKey);
        const localKey = `encaixe_agendamentos_${tenantId}_${dataKey}`;
        const updated = list.filter((a: any) => a.id !== id);
        localStorage.setItem(localKey, JSON.stringify(updated));
        return updated;
      }

      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }
  },

  // ------------------------------------------------------------
  // 5. STORAGE / UPLOADS
  // ------------------------------------------------------------
  storage: {
    async upload(bucket: string, path: string, file: File) {
      if (isDevEnvironment()) {
        return compressImageFile(file, 400, 400, 0.8);
      }

      try {
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
        return publicUrl;
      } catch (err) {
        console.warn('[Encaixe Storage] Falha no upload Supabase Cloud, aplicando fallback de imagem comprimida:', err);
        return compressImageFile(file, 400, 400, 0.8);
      }
    }
  }
};
