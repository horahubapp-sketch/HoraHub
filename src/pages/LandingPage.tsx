import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  ShieldCheck, 
  Users, 
  QrCode, 
  Gift, 
  CheckCircle2, 
  ChevronDown, 
  Smartphone, 
  ArrowRight,
  Scissors,
  Award,
  Zap,
  Stethoscope,
  HeartHandshake,
  Sparkle,
  Dog,
  Check
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="landing-container light-theme">
      {/* NAVBAR */}
      <header className="landing-navbar">
        <div className="landing-nav-content">
          <div className="landing-brand" onClick={() => navigate('/landing')}>
            <img src={logoImg} alt="Encaixe Logo" className="landing-logo-img" />
            <span className="brand-name">Encaixe</span>
          </div>

          <nav className="landing-nav-links">
            <a href="#recursos">Recursos</a>
            <a href="#para-quem">Para Quem É</a>
            <a href="#planos">Planos & Preços</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="landing-nav-actions">
            <button className="btn-nav-secondary" onClick={() => navigate('/login')}>
              Entrar
            </button>
            <button className="btn-nav-primary" onClick={() => navigate('/cadastro')}>
              Testar 14 Dias Grátis
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            <span>O Sistema de Agendamento #1 para Serviços por Hora</span>
          </div>

          <h1>
            Simplifique seus agendamentos e <br />
            <span className="text-gradient">faça seu negócio crescer.</span>
          </h1>

          <p className="hero-description">
            Diga adeus à desorganização no WhatsApp. O Encaixe é a solução moderna de agendamento online, 
            gestão de equipe, comissões e fidelização de clientes direto no celular.
          </p>

          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={() => navigate('/cadastro')}>
              <span>Começar Teste Grátis</span>
              <ArrowRight size={18} />
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate('/app')}>
              <Smartphone size={18} />
              <span>Ver App do Cliente</span>
            </button>
          </div>

          <div className="hero-benefits-pills">
            <div className="pill-item">
              <CheckCircle2 size={16} />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="pill-item">
              <CheckCircle2 size={16} />
              <span>Instalação PWA instantânea</span>
            </div>
            <div className="pill-item">
              <CheckCircle2 size={16} />
              <span>Suporte em Português</span>
            </div>
          </div>
        </div>

        {/* HERO MOCKUP CARD */}
        <div className="hero-mockup-wrapper">
          <div className="hero-glass-card">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="mockup-url">encaixe.netlify.app/app</div>
            </div>
            <div className="mockup-body">
              <div className="preview-app-card">
                <div className="preview-brand-header">
                  <img src={logoImg} alt="Encaixe" className="preview-logo-thumb" />
                  <div>
                    <h4>LuluBarber & Estética</h4>
                    <span className="preview-status-online">● Online agora</span>
                  </div>
                </div>

                <div className="preview-service-item">
                  <div className="service-info">
                    <h5>Corte Degradê + Barba</h5>
                    <span className="service-duration">⏱️ 45 min</span>
                  </div>
                  <strong className="service-price">R$ 80,00</strong>
                </div>

                <div className="preview-slot-selected">
                  <Calendar size={14} />
                  <span>Hoje às 15:30 • Profissional Bruno</span>
                </div>

                <button className="btn-mockup-confirm">
                  <Check size={16} />
                  <span>Agendar em 1 Clique</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICAS IMPRESSIONANTES */}
      <section className="metrics-bar">
        <div className="metric-item">
          <h2>+100.000</h2>
          <p>Agendamentos Realizados</p>
        </div>
        <div className="metric-divider"></div>
        <div className="metric-item">
          <h2>80%</h2>
          <p>Redução de Faltas (No-Shows)</p>
        </div>
        <div className="metric-divider"></div>
        <div className="metric-item">
          <h2>24/7</h2>
          <p>Atendimento Automático</p>
        </div>
        <div className="metric-divider"></div>
        <div className="metric-item">
          <h2>4.9 ★</h2>
          <p>Satisfação dos Estabelecimentos</p>
        </div>
      </section>

      {/* RECURSOS PRINCIPAIS */}
      <section id="recursos" className="features-section">
        <div className="section-title">
          <h2>Tudo o que seu estabelecimento precisa em um só lugar</h2>
          <p>Recursos pensados para economizar seu tempo e aumentar o faturamento do seu negócio.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Smartphone size={24} />
            </div>
            <h3>App do Cliente PWA Sem Baixar Nada</h3>
            <p>Seus clientes acessam o link da sua empresa, escolhem o serviço e o horário sem precisar baixar nada nas lojas de aplicativos.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <ShieldCheck size={24} />
            </div>
            <h3>Zero Conflitos de Horários (Anti-Double Booking)</h3>
            <p>Motor inteligente rodando no banco de dados que impede fisicamente que dois clientes agendem no mesmo minuto para o mesmo profissional.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Users size={24} />
            </div>
            <h3>Gestão da Equipe & Comissões</h3>
            <p>Cadastre seus colaboradores, configure jornadas de trabalho individuais e calcule o percentual de comissão automaticamente.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <QrCode size={24} />
            </div>
            <h3>QR Code de Balcão Imprimível</h3>
            <p>Gere o QR Code exclusivo da sua loja para colocar na recepção e permitir que clientes agendem a próxima visita em segundos.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Gift size={24} />
            </div>
            <h3>Relatório de Aniversariantes do Mês</h3>
            <p>Fidelize seus clientes oferecendo mimos e descontos no mês de aniversário diretamente pelo painel administrativo.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Calendar size={24} />
            </div>
            <h3>Agenda Interativa & Presencial</h3>
            <p>Alterne entre a grade diária e semanal, altere status e insira agendamentos presenciais rápidos no balcão.</p>
          </div>
        </div>
      </section>

      {/* SEÇÃO PARA QUEM É (ÍCONES PROFISSIONAIS REFINADOS) */}
      <section id="para-quem" className="nicho-section">
        <div className="section-title">
          <h2>Perfeito para qualquer tipo de serviço por agendamento</h2>
          <p>O Encaixe foi desenhado para se adaptar perfeitamente ao fluxo de trabalho do seu segmento.</p>
        </div>

        <div className="nicho-grid">
          <div className="nicho-card">
            <div className="nicho-icon-box">
              <Scissors size={26} />
            </div>
            <h3>Barbearias</h3>
            <p>Cortes, barba, barboterapia e combos com controle de comissão de barbeiros.</p>
          </div>

          <div className="nicho-card">
            <div className="nicho-icon-box">
              <Sparkle size={26} />
            </div>
            <h3>Salões de Beleza</h3>
            <p>Cabelo, tintura, mechas e penteados com gestão da equipe por especialidade.</p>
          </div>

          <div className="nicho-card">
            <div className="nicho-icon-box">
              <HeartHandshake size={26} />
            </div>
            <h3>Estética & Manicure</h3>
            <p>Design de sobrancelhas, harmonização, unhas e limpeza de pele.</p>
          </div>

          <div className="nicho-card">
            <div className="nicho-icon-box">
              <Dog size={26} />
            </div>
            <h3>Pet Shops & Banho</h3>
            <p>Agendamento de banho e tosa para animais de estimação com agilidade.</p>
          </div>

          <div className="nicho-card">
            <div className="nicho-icon-box">
              <Stethoscope size={26} />
            </div>
            <h3>Consultórios & Estúdios</h3>
            <p>Fisioterapia, pilates, personal trainer e consultas agendadas.</p>
          </div>
        </div>
      </section>

      {/* PLANOS E PREÇOS */}
      <section id="planos" className="pricing-section">
        <div className="section-title">
          <h2>Planos transparentes que cabem no seu bolso</h2>
          <p>Escolha o plano ideal para o tamanho da sua equipe. Cancele quando quiser.</p>
        </div>

        <div className="pricing-grid">
          {/* PLANO STARTER */}
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Plano Solo / Starter</h3>
              <p>Ideal para profissionais autônomos e consultórios individuais.</p>
              <div className="price-box">
                <span className="currency">R$</span>
                <span className="amount">49</span>
                <span className="cents">,90</span>
                <span className="period">/mês</span>
              </div>
            </div>

            <ul className="pricing-features">
              <li><CheckCircle2 size={16} /> <strong>1 Profissional</strong> cadastrado</li>
              <li><CheckCircle2 size={16} /> Agendamentos <strong>Ilimitados</strong></li>
              <li><CheckCircle2 size={16} /> App do Cliente PWA (`/app`)</li>
              <li><CheckCircle2 size={16} /> Painel Admin Completo</li>
              <li><CheckCircle2 size={16} /> Motor Anti-Double Booking</li>
              <li><CheckCircle2 size={16} /> QR Code de Balcão</li>
            </ul>

            <button className="btn-pricing-secondary" onClick={() => navigate('/cadastro')}>
              Assinar Plano Starter
            </button>
          </div>

          {/* PLANO PROFISSIONAL (DESTAQUE) */}
          <div className="pricing-card featured">
            <div className="popular-badge">
              <Award size={14} />
              <span>MAIS POPULAR</span>
            </div>

            <div className="pricing-header">
              <h3>Plano Profissional</h3>
              <p>Perfeito para barbearias, salões e clínicas em expansão.</p>
              <div className="price-box">
                <span className="currency">R$</span>
                <span className="amount">99</span>
                <span className="cents">,90</span>
                <span className="period">/mês</span>
              </div>
            </div>

            <ul className="pricing-features">
              <li><CheckCircle2 size={16} /> <strong>Até 5 Profissionais</strong> na equipe</li>
              <li><CheckCircle2 size={16} /> Agendamentos <strong>Ilimitados</strong></li>
              <li><CheckCircle2 size={16} /> Cálculo Automático de <strong>Comissões</strong></li>
              <li><CheckCircle2 size={16} /> Relatórios de <strong>Aniversariantes</strong></li>
              <li><CheckCircle2 size={16} /> App do Cliente PWA (`/app`)</li>
              <li><CheckCircle2 size={16} /> Motor Anti-Double Booking Físico</li>
              <li><CheckCircle2 size={16} /> Suporte Prioritário por WhatsApp</li>
            </ul>

            <button className="btn-pricing-primary" onClick={() => navigate('/cadastro')}>
              Começar 14 Dias Grátis
            </button>
          </div>

          {/* PLANO ELITE */}
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Plano Elite / Redes</h3>
              <p>Para grandes estabelecimentos e redes multi-unidades.</p>
              <div className="price-box">
                <span className="currency">R$</span>
                <span className="amount">199</span>
                <span className="cents">,90</span>
                <span className="period">/mês</span>
              </div>
            </div>

            <ul className="pricing-features">
              <li><CheckCircle2 size={16} /> <strong>Profissionais Ilimitados</strong></li>
              <li><CheckCircle2 size={16} /> Agendamentos <strong>Ilimitados</strong></li>
              <li><CheckCircle2 size={16} /> Cálculo de Comissões por Colaborador</li>
              <li><CheckCircle2 size={16} /> Gestão de Multi-Empresas</li>
              <li><CheckCircle2 size={16} /> Relatórios de Desempenho Avançados</li>
              <li><CheckCircle2 size={16} /> Gerente de Conta VIP Exclusivo</li>
            </ul>

            <button className="btn-pricing-secondary" onClick={() => navigate('/cadastro')}>
              Falar com Consultor
            </button>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section id="faq" className="faq-section">
        <div className="section-title">
          <h2>Perguntas Frequentes (FAQ)</h2>
          <p>Tire suas dúvidas e veja como é simples começar a usar o Encaixe.</p>
        </div>

        <div className="faq-container">
          {[
            {
              q: 'O meu cliente precisa baixar algum aplicativo na Google Play ou App Store?',
              a: 'Não! O Encaixe utiliza tecnologia PWA (Progressive Web App). O cliente abre o link ou lê o QR Code e agenda diretamente pelo navegador do celular em segundos.'
            },
            {
              q: 'O que acontece se dois clientes tentarem agendar no mesmo horário?',
              a: 'Nosso sistema possui um motor anti-double booking no banco de dados PostgreSQL. Ele bloqueia instantaneamente qualquer colisão de horários, garantindo que dois clientes nunca agendem o mesmo profissional no mesmo minuto.'
            },
            {
              q: 'Posso cadastrar mais de um profissional na minha barbearia ou salão?',
              a: 'Sim! O Plano Profissional permite cadastrar até 5 colaboradores com jornadas de trabalho individuais e percentual de comissão configurável.'
            },
            {
              q: 'Como funciona o teste grátis de 14 dias?',
              a: 'Você cria sua conta em menos de 2 minutos sem precisar cadastrar cartão de crédito e já tem acesso total ao painel administrativo e ao App do Cliente.'
            }
          ].map((item, idx) => (
            <div key={idx} className={`faq-item ${openFaq === idx ? 'open' : ''}`} onClick={() => toggleFaq(idx)}>
              <div className="faq-question">
                <h3>{item.q}</h3>
                <ChevronDown size={20} className="faq-arrow" />
              </div>
              {openFaq === idx && (
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="landing-brand">
              <img src={logoImg} alt="Encaixe Logo" className="landing-logo-img" />
              <span className="brand-name">Encaixe</span>
            </div>
            <p>O aplicativo de agendamento online e gestão inteligente para estabelecimentos e profissionais de serviços.</p>
          </div>

          <div className="footer-links">
            <h4>Navegação</h4>
            <a href="#recursos">Recursos</a>
            <a href="#para-quem">Para Quem É</a>
            <a href="#planos">Planos & Preços</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="footer-links">
            <h4>Acesso Rápido</h4>
            <Link to="/login">Painel do Administrador</Link>
            <Link to="/cadastro">Criar Minha Conta</Link>
            <Link to="/app">Portal do Cliente</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Encaixe (HoraHub) — Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
