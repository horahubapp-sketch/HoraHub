import { useState, useEffect } from 'react';
import { dbAdapter } from '../services/dbAdapter';
import { useAuth } from '../contexts/AuthContext';
import { Cake, Phone, Calendar as CalendarIcon, MessageCircle } from 'lucide-react';
import './AniversariantesPage.css';

interface ClienteAniversariante {
  nome: string;
  whatsapp: string;
  dataNascimento: string;
  diaAniversario: number;
  mesAniversario: number;
  totalAtendimentos: number;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function AniversariantesPage() {
  const { tenantId, empresa } = useAuth();
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth() + 1);
  const [aniversariantes, setAniversariantes] = useState<ClienteAniversariante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAniversariantes() {
      if (!tenantId) return;
      setLoading(true);

      try {
        const data = await dbAdapter.agendamentos.getByDate(tenantId, '2026-08-01');
        const mapa = new Map<string, ClienteAniversariante>();

        data?.forEach((a: any) => {
          if (!a.cliente_data_nascimento) return;

          const dateObj = new Date(a.cliente_data_nascimento + 'T12:00:00');
          const mes = dateObj.getMonth() + 1;
          const dia = dateObj.getDate();

          if (mes === mesSelecionado) {
            const chave = a.cliente_whatsapp || a.cliente_name;
            if (mapa.has(chave)) {
              mapa.get(chave)!.totalAtendimentos++;
            } else {
              mapa.set(chave, {
                nome: a.cliente_name,
                whatsapp: a.cliente_whatsapp || '',
                dataNascimento: a.cliente_data_nascimento,
                diaAniversario: dia,
                mesAniversario: mes,
                totalAtendimentos: 1
              });
            }
          }
        });

        // Ordenar por dia do aniversário
        const lista = Array.from(mapa.values()).sort((a, b) => a.diaAniversario - b.diaAniversario);
        setAniversariantes(lista);
      } catch (err) {
        console.error('[Encaixe] Erro ao carregar aniversariantes:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAniversariantes();
  }, [tenantId, mesSelecionado]);

  return (
    <div className="aniversariantes-wrapper">
      <header className="aniversariantes-header">
        <div className="aniversariantes-title-block">
          <h1>
            <Cake size={28} style={{ color: '#00E676' }} />
            Aniversariantes do Mês
          </h1>
          <p>Envie felicitações e cupons especiais de presente via WhatsApp para seus clientes VIP.</p>
        </div>

        <div className="month-selector-badge">
          <label>Mês:</label>
          <select 
            className="month-select-dropdown"
            value={mesSelecionado}
            onChange={e => setMesSelecionado(Number(e.target.value))}
          >
            {MESES.map((m, index) => (
              <option key={m} value={index + 1}>{m}</option>
            ))}
          </select>
        </div>
      </header>

      {loading ? (
        <div className="aniversariantes-loading">Buscando aniversariantes...</div>
      ) : aniversariantes.length === 0 ? (
        <div className="empty-aniversariantes-card">
          <Cake size={48} style={{ color: '#64748B', opacity: 0.5 }} />
          <h3>Nenhum aniversariante cadastrado em {MESES[mesSelecionado - 1]}</h3>
          <p>Os clientes que informarem a data de nascimento no agendamento aparecerão automaticamente nesta lista.</p>
        </div>
      ) : (
        <div className="aniversariantes-grid">
          {aniversariantes.map((c, idx) => {
            const zapClean = c.whatsapp.replace(/\D/g, '');
            const msg = encodeURIComponent(
              `Olá ${c.nome}! 🎉 Parabéns pelo seu aniversário neste mês de ${MESES[mesSelecionado - 1]}! A equipe de ${empresa?.nome || 'nossa equipe'} deseja muita saúde e realizações! Para comemorar, temos um presente especial para você em seu próximo agendamento!`
            );
            const zapUrl = zapClean ? `https://wa.me/55${zapClean}?text=${msg}` : '#';

            return (
              <div key={idx} className="aniversariante-card">
                <div className="aniversariante-card-header">
                  <div className="aniversariante-avatar-circle">
                    {c.nome.charAt(0)}
                  </div>
                  <div className="aniversariante-info">
                    <h3>{c.nome}</h3>
                    <div className="aniversariante-date-badge">
                      <CalendarIcon size={14} />
                      Dia {c.diaAniversario} de {MESES[mesSelecionado - 1]}
                    </div>
                  </div>
                </div>

                <div className="aniversariante-details">
                  <div className="detail-row">
                    <Phone size={14} />
                    <span>{c.whatsapp || 'WhatsApp não informado'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Atendimentos na casa: <strong>{c.totalAtendimentos}</strong></span>
                  </div>
                </div>

                {zapClean && (
                  <a 
                    href={zapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-whatsapp-parabens"
                  >
                    <MessageCircle size={18} />
                    <span>Parabenizar no WhatsApp</span>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
