import { useState } from 'react';
import './BarbeariaNeivaLandingPage.css';

export default function BarbeariaNeivaLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [freq, setFreq] = useState<number>(3);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Cálculo do simulador
  const gastoAvulso = freq * 90;
  const assinaturaVip = 169;
  const economia = gastoAvulso - assinaturaVip;

  return (
    <div className="neiva-page-root">
      {/* Top Infobar */}
      <div className="top-infobar">
        <div className="neiva-container infobar-container">
          <div className="infobar-left">
            <span className="infobar-item">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              Rua Barão do Cerro Azul, 2100 - São José dos Pinhais - PR
            </span>
            <span className="infobar-item hide-mobile">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
              Seg-Sex: 8h-20h | Sáb: 8h-17h | Dom: 9h-13h30
            </span>
          </div>
          <div className="infobar-right">
            <a href="https://www.instagram.com/barbearia_neiva/" target="_blank" rel="noreferrer" className="infobar-whatsapp" style={{ marginRight: '1.2rem' }}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              @barbearia_neiva
            </a>
            <a href="https://wa.me/5541996453474?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20na%20Barbearia%20Neiva." target="_blank" rel="noreferrer" className="infobar-whatsapp">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19.005 3.175A10.673 10.673 0 0 0 11.5 0C5.158 0 .012 5.147.012 11.488c0 2.026.529 4.005 1.533 5.744L0 24l6.974-1.83a10.63 10.63 0 0 0 4.522 1.018h.005c6.342 0 11.487-5.147 11.487-11.489 0-3.07-1.196-5.955-3.37-8.128zM11.5 21.18c-1.74 0-3.447-.468-4.937-1.353l-.354-.21-3.673.963.98-3.58-.23-.367a9.475 9.475 0 0 1-1.455-5.145c0-5.234 4.258-9.492 9.493-9.492 2.535 0 4.918.988 6.711 2.782a9.426 9.426 0 0 1 2.777 6.713c0 5.235-4.259 9.493-9.494 9.493zm5.21-7.119c-.286-.143-1.693-.836-1.956-.931-.262-.095-.453-.143-.643.143-.19.286-.738.931-.905 1.121-.167.19-.333.214-.619.071-.286-.143-1.207-.445-2.299-1.419-.85-.758-1.424-1.693-1.59-1.978-.167-.286-.018-.44.125-.583.13-.129.286-.333.429-.5.143-.167.19-.286.286-.476.095-.19.048-.357-.024-.5-.071-.143-.643-1.547-.881-2.119-.232-.557-.468-.482-.643-.491l-.547-.01c-.19 0-.5.071-.762.357-.262.286-1 1.024-1 2.499 0 1.475 1.071 2.9 1.22 3.095.149.195 2.109 3.22 5.11 4.516.714.309 1.272.494 1.706.632.718.229 1.37.196 1.886.119.577-.086 1.693-.69 1.931-1.357.238-.667.238-1.238.167-1.357-.071-.119-.262-.19-.548-.333z"/></svg>
              (41) 99645-3474
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="site-header" id="header">
        <div className="neiva-container header-container">
          <a href="#home" className="brand-logo-official">
            <img src="/neiva-assets/logo_official.png" alt="Barbearia Neiva - Logotipo Oficial" className="official-logo-img" />
          </a>

          <nav className="main-nav">
            <ul>
              <li><a href="#home">Início</a></li>
              <li><a href="#sobre">O Espaço</a></li>
              <li><a href="#servicos">Serviços</a></li>
              <li><a href="#simulador">Simulador VIP</a></li>
              <li><a href="#planos">Assinatura</a></li>
              <li><a href="#galeria">Fotos do Local</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contato">Localização</a></li>
            </ul>
          </nav>

          <div className="header-actions">
            <a href="https://wa.me/5541996453474?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20na%20Barbearia%20Neiva." target="_blank" rel="noreferrer" className="btn btn-primary nav-cta">
              Agendar pelo WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-bg-overlay"></div>
        <div className="neiva-container hero-container">
          <div className="hero-badge">
            <span className="badge-dot"></span> • Elegância • Tradição • Alto Padrão
          </div>
          
          <div className="hero-logo-wrapper">
            <img src="/neiva-assets/logo_official.png" alt="Barbearia Neiva" className="hero-official-logo" />
          </div>

          <h1 className="hero-title">Referência em Cuidado Masculino em <span className="text-gradient">São José dos Pinhais</span></h1>
          <p className="hero-subtitle">
            Você em sua melhor versão. Uma experiência exclusiva com atendimento VIP, tradição e sofisticação em cada detalhe.
          </p>

          <div className="hero-buttons">
            <a href="https://wa.me/5541996453474?text=Ol%C3%A1!%20Quero%20agendar%20pelo%20WhatsApp!" target="_blank" rel="noreferrer" className="btn btn-primary btn-hero">
              Agendar pelo WhatsApp
            </a>
            <a href="https://sites.appbarber.com.br/barbearianeiva" target="_blank" rel="noreferrer" className="btn btn-outline btn-hero">
              Assinar pelo App Barber
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">4.9 ★</span>
              <span className="stat-label">Avaliação dos Clientes</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">VIP</span>
              <span className="stat-label">Clube de Assinatura</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Satisfação & Tradição</span>
            </div>
          </div>
        </div>
      </section>

      {/* O Espaço & História */}
      <section className="about-section" id="sobre">
        <div className="neiva-container">
          <div className="story-wrapper">
            <div className="story-content">
              <span className="section-tag">NOSSA TRAJETÓRIA & HISTÓRIA</span>
              <h2 className="section-title">Do Vale do Jequitinhonha ao Alto Padrão em São José dos Pinhais</h2>
              <p>
                Nascido em Araçuaí, no interior de Minas Gerais, o fundador <strong>Neiva</strong> partiu rumo a Curitiba e São José dos Pinhais em busca de novos horizons. No início de sua jornada, trabalhou por muitos anos como garçom antes de descobrir sua verdadeira vocação na arte da barbearia.
              </p>
              <p>
                Com a oportunidade e a ajuda fundamental de seu cunhado, Neiva aprendeu a profissão do zero. Com dedicação incansável, tornou-se barbeiro e gerente de destaque, até adquirir o próprio estabelecimento — dando origem à <strong>Barbearia Neiva</strong>.
              </p>

              <p className="story-highlight">
                "Sua esposa, <strong>Daniela</strong>, deu todo o suporte essencial e foi o pilar de sustentação emocional durante toda essa transição de carreira e fase de consolidação do negócio."
              </p>

              <p>
                Hoje, a Barbearia Neiva é sinônimo de excelência, sofisticação, respeito e tradição, proporcionando a cada cliente mais do que um corte ou barba: uma verdadeira experiência de bem-estar.
              </p>
            </div>
            <div className="story-img-wrapper">
              <img src="/neiva-assets/foto_local_hero.jpg" alt="História e Estrutura Barbearia Neiva" />
            </div>
          </div>

          <div className="section-header" style={{ marginTop: '4rem' }}>
            <span className="section-tag">NOSSO ESPAÇO FÍSICO</span>
            <h2 className="section-title">Fotos Reais da Barbearia Neiva</h2>
            <p className="section-description">
              Conheça o nosso ambiente preparado com muito conforto, estações individuais de atendimento e acabamento impecável.
            </p>
          </div>

          <div className="real-photos-grid">
            <div className="photo-card card-glass">
              <img src="/neiva-assets/foto_local_hero.jpg" alt="Interior Barbearia Neiva" />
              <div className="photo-info">
                <h3>Estações de Atendimento</h3>
                <p>Cadeiras confortáveis e estrutura completa para seu atendimento.</p>
              </div>
            </div>

            <div className="photo-card card-glass">
              <img src="/neiva-assets/foto_local_1.jpg" alt="Estrutura e Acabamento" />
              <div className="photo-info">
                <h3>Ambiente Climatizado</h3>
                <p>Clima agradável e higienização rigorosa em todos os equipamentos.</p>
              </div>
            </div>

            <div className="photo-card card-glass">
              <img src="/neiva-assets/foto_local_2.jpg" alt="Lounge e Detalhes" />
              <div className="photo-info">
                <h3>Lounge Exclusivo</h3>
                <p>Espaço para relaxar com bebidas e atendimento pontual.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="services-section" id="servicos">
        <div className="neiva-container">
          <div className="section-header">
            <span className="section-tag">SERVIÇOS DE ALTO PADRÃO</span>
            <h2 className="section-title">Menu de Procedimentos</h2>
            <p className="section-description">Cabelo, barba e tratamentos com produtos selecionados.</p>
          </div>

          <div className="services-grid">
            <div className="service-card card-glass">
              <div className="service-img-wrapper">
                <img src="/neiva-assets/foto_local_3.jpg" alt="Corte de Cabelo" />
              </div>
              <div className="service-details">
                <div className="service-header">
                  <h3>Corte de Cabelo Visagista</h3>
                  <span className="service-price">R$ 55</span>
                </div>
                <p>Visagismo sob medida, lavagem especial e finalização profissional com pomada premium.</p>
                <a href="https://wa.me/5541996453474?text=Quero%20agendar%20Corte%20de%20Cabelo" target="_blank" rel="noreferrer" className="btn-service-link">Agendar pelo WhatsApp →</a>
              </div>
            </div>

            <div className="service-card card-glass">
              <div className="service-img-wrapper">
                <img src="/neiva-assets/foto_local_4.jpg" alt="Barboterapia" />
              </div>
              <div className="service-details">
                <div className="service-header">
                  <h3>Barboterapia Ritual</h3>
                  <span className="service-price">R$ 45</span>
                </div>
                <p>Toalha quente, alinhamento preciso da barba, óleos essenciais e balm hidratante pós-barba.</p>
                <a href="https://wa.me/5541996453474?text=Quero%20agendar%20Barboterapia" target="_blank" rel="noreferrer" className="btn-service-link">Agendar pelo WhatsApp →</a>
              </div>
            </div>

            <div className="service-card card-glass featured-service">
              <div className="service-badge">Mais Pedido</div>
              <div className="service-img-wrapper">
                <img src="/neiva-assets/foto_local_hero.jpg" alt="Combo Neiva VIP" />
              </div>
              <div className="service-details">
                <div className="service-header">
                  <h3>Combo Neiva VIP (Cabelo + Barba)</h3>
                  <span className="service-price">R$ 90</span>
                </div>
                <p>A experiência completa com Corte Visagista, Barboterapia Ritual e atendimento VIP personalizado.</p>
                <a href="https://wa.me/5541996453474?text=Quero%20agendar%20Combo%20Neiva%20VIP" target="_blank" rel="noreferrer" className="btn btn-primary service-cta">Agendar Combo VIP</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simulador */}
      <section className="simulator-section" id="simulador">
        <div className="neiva-container">
          <div className="simulator-card card-glass">
            <div className="simulator-info">
              <span className="section-tag">CLUBE POR ASSINATURA</span>
              <h2>Simulador de Economia Mensal</h2>
              <p>Veja a vantagem de ser um assinante do Clube Barbearia Neiva pelo App Barber:</p>

              <div className="simulator-controls">
                <label htmlFor="freqSelect" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Quantas vezes você cuida do seu visual por mês?</label>
                <select 
                  id="freqSelect" 
                  className="sim-select" 
                  value={freq} 
                  onChange={(e) => setFreq(Number(e.target.value))}
                >
                  <option value={2}>2 vezes ao mês (Cabelo + Barba)</option>
                  <option value={3}>3 vezes ao mês (Cabelo + Barba)</option>
                  <option value={4}>4 vezes ao mês (Cabelo + Barba toda semana)</option>
                </select>
              </div>
            </div>

            <div className="simulator-result">
              <div className="sim-box">
                <span className="sim-label">Gasto Avulso Estimado</span>
                <span className="sim-val val-avulso">R$ {gastoAvulso},00</span>
              </div>
              <div className="sim-box highlight">
                <span className="sim-label">Assinatura no App Barber</span>
                <span className="sim-val val-vip">R$ 169,00/mês</span>
                <span className="sim-savings">Sua economia: R$ {economia},00/mês</span>
              </div>
              <a href="https://sites.appbarber.com.br/barbearianeiva" target="_blank" rel="noreferrer" className="btn btn-primary">Assinar pelo App Barber</a>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="plans-section" id="planos">
        <div className="neiva-container">
          <div className="section-header">
            <span className="section-tag">ASSINATURA PELO APP BARBER</span>
            <h2 className="section-title">Escolha seu Plano Mensal</h2>
            <p className="section-description">Praticidade total para manter seu estilo sempre alinhado a partir de R$ 89,90/mês.</p>
          </div>

          <div className="plans-grid">
            <div className="card-glass plan-card">
              <h3 className="plan-name">Plano Cabelo</h3>
              <div className="plan-price">
                <span className="currency">R$</span>
                <span className="amount">99</span>
                <span className="period">/mês</span>
              </div>
              <ul className="plan-features">
                <li>✓ Cortes de cabelo ilimitados</li>
                <li>✓ Agendamento direto no App Barber</li>
                <li>✓ Desconto em produtos exclusivos</li>
              </ul>
              <a href="https://sites.appbarber.com.br/barbearianeiva" target="_blank" rel="noreferrer" className="btn btn-outline btn-plan">Assinar Plano</a>
            </div>

            <div className="card-glass plan-card plan-vip">
              <div className="plan-ribbon">RECOMENDADO</div>
              <h3 className="plan-name">Neiva Black (Cabelo + Barba)</h3>
              <div className="plan-price">
                <span className="currency">R$</span>
                <span className="amount">169</span>
                <span className="period">/mês</span>
              </div>
              <ul className="plan-features">
                <li>✓ <strong>Cortes e Barba ILIMITADOS</strong></li>
                <li>✓ Barboterapia com toalha quente inclusa</li>
                <li>✓ Agendamento prioritário no App Barber</li>
                <li>✓ Desconto VIP em toda a linha de cosméticos</li>
              </ul>
              <a href="https://sites.appbarber.com.br/barbearianeiva" target="_blank" rel="noreferrer" className="btn btn-primary btn-plan">Assinar Neiva Black</a>
            </div>

            <div className="card-glass plan-card">
              <h3 className="plan-name">Plano Barba</h3>
              <div className="plan-price">
                <span className="currency">R$</span>
                <span className="amount">89,90</span>
                <span className="period">/mês</span>
              </div>
              <ul className="plan-features">
                <li>✓ Barba & alinhamento de contorno ilimitados</li>
                <li>✓ Hidratação com óleos nutritivos</li>
                <li>✓ Agendamento prático pelo App Barber</li>
              </ul>
              <a href="https://sites.appbarber.com.br/barbearianeiva" target="_blank" rel="noreferrer" className="btn btn-outline btn-plan">Assinar Plano</a>
            </div>
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section className="gallery-section" id="galeria">
        <div className="neiva-container">
          <div className="section-header">
            <span className="section-tag">GALERIA OFICIAL</span>
            <h2 className="section-title">Ambiente & Instalações</h2>
            <p className="section-description">Imagens do espaço da Barbearia Neiva em São José dos Pinhais.</p>
          </div>

          <div className="gallery-grid">
            <div className="gallery-item">
              <img src="/neiva-assets/foto_local_hero.jpg" alt="Salão Barbearia Neiva" />
              <div className="gallery-overlay"><span>Estações de Atendimento</span></div>
            </div>
            <div className="gallery-item">
              <img src="/neiva-assets/foto_local_1.jpg" alt="Cadeiras e Espelho Barbearia Neiva" />
              <div className="gallery-overlay"><span>Conforto & Sofisticação</span></div>
            </div>
            <div className="gallery-item">
              <img src="/neiva-assets/foto_local_2.jpg" alt="Fachada e Recepção Barbearia Neiva" />
              <div className="gallery-overlay"><span>Recepção Climatizada</span></div>
            </div>
            <div className="gallery-item">
              <img src="/neiva-assets/foto_local_3.jpg" alt="Detalhes do Atendimento" />
              <div className="gallery-overlay"><span>Precisão nos Cortes</span></div>
            </div>
            <div className="gallery-item">
              <img src="/neiva-assets/foto_local_4.jpg" alt="Cuidado Masculino" />
              <div className="gallery-overlay"><span>Cuidado com a Barba</span></div>
            </div>
            <div className="gallery-item">
              <img src="/neiva-assets/foto_local_5.jpg" alt="Barbearia Neiva SJP" />
              <div className="gallery-overlay"><span>São José dos Pinhais</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="neiva-container">
          <div className="section-header">
            <span className="section-tag">DÚVIDAS FREQUENTES</span>
            <h2 className="section-title">Perguntas Frequentes</h2>
          </div>

          <div className="faq-accordion">
            <div className={`faq-item card-glass ${openFaq === 0 ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(0)}>
                <span>Como faço para agendar meu horário?</span>
                <span className="faq-icon">{openFaq === 0 ? '−' : '+'}</span>
              </button>
              <div className="faq-answer">
                <p>Você pode agendar de forma simples pelo botão de WhatsApp aqui no site ou através do App Barber!</p>
              </div>
            </div>

            <div className={`faq-item card-glass ${openFaq === 1 ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(1)}>
                <span>Como funciona a assinatura pelo App Barber?</span>
                <span className="faq-icon">{openFaq === 1 ? '−' : '+'}</span>
              </button>
              <div className="faq-answer">
                <p>Com o plano mensal, você tem direito a atendimentos ilimitados de acordo com o plano escolhido (Cabelo, Barba ou Neiva Black) com pagamento recorrente prático no app.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Localização & Contato */}
      <section className="contact-section" id="contato">
        <div className="neiva-container">
          <div className="contact-wrapper card-glass">
            <div className="contact-info">
              <span className="section-tag">LOCALIZAÇÃO & CONTATO</span>
              <h2>Visite a Barbearia Neiva</h2>
              <p>Referência em cuidado masculino de alto padrão em São José dos Pinhais - PR.</p>

              <div className="info-list">
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <div>
                    <strong>Endereço Oficial:</strong>
                    <p>Rua Barão do Cerro Azul, 2100 - Bairro Bom Jesus<br/>São José dos Pinhais - PR</p>
                    <a href="https://maps.app.goo.gl/6eJ2bytyjsfvFEESA" target="_blank" rel="noreferrer" className="btn-service-link" style={{ marginTop: '0.4rem', display: 'inline-block' }}>Ver no Google Maps →</a>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-icon">💬</span>
                  <div>
                    <strong>Agendamento Direct & App:</strong>
                    <p>WhatsApp (41) 99645-3474 | App Barber</p>
                  </div>
                </div>
              </div>

              <div className="hours-box">
                <h4>⏰ Horários de Funcionamento</h4>
                <ul className="hours-list">
                  <li><span>Segunda a Sexta:</span> <strong>08:00 às 20:00</strong></li>
                  <li><span>Sábado:</span> <strong>08:00 às 17:00</strong></li>
                  <li><span>Domingo:</span> <strong>09:00 às 13:30</strong></li>
                </ul>
              </div>
            </div>

            <div className="map-placeholder">
              <div className="map-box">
                <img src="/neiva-assets/logo_official.png" alt="Barbearia Neiva" className="map-logo" />
                <h3>Barbearia Neiva</h3>
                <p>Rua Barão do Cerro Azul, 2100<br/>Bom Jesus - São José dos Pinhais</p>
                <a href="https://maps.app.goo.gl/6eJ2bytyjsfvFEESA" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ marginTop: '1.2rem' }}>Abrir no Google Maps 🗺️</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="neiva-container footer-container">
          <div className="footer-brand">
            <img src="/neiva-assets/logo_official.png" alt="Barbearia Neiva" className="footer-logo" />
            <p>• Elegância • Tradição • Alto Padrão</p>

            <div className="social-icons-wrapper" style={{ justifyContent: 'center', marginTop: '1.2rem' }}>
              <a href="https://wa.me/5541996453474?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio." target="_blank" rel="noreferrer" className="social-icon-btn whatsapp-hover" title="WhatsApp Oficial (41) 99645-3474" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24"><path d="M19.005 3.175A10.673 10.673 0 0 0 11.5 0C5.158 0 .012 5.147.012 11.488c0 2.026.529 4.005 1.533 5.744L0 24l6.974-1.83a10.63 10.63 0 0 0 4.522 1.018h.005c6.342 0 11.487-5.147 11.487-11.489 0-3.07-1.196-5.955-3.37-8.128zM11.5 21.18c-1.74 0-3.447-.468-4.937-1.353l-.354-.21-3.673.963.98-3.58-.23-.367a9.475 9.475 0 0 1-1.455-5.145c0-5.234 4.258-9.492 9.493-9.492 2.535 0 4.918.988 6.711 2.782a9.426 9.426 0 0 1 2.777 6.713c0 5.235-4.259 9.493-9.494 9.493zm5.21-7.119c-.286-.143-1.693-.836-1.956-.931-.262-.095-.453-.143-.643.143-.19.286-.738.931-.905 1.121-.167.19-.333.214-.619.071-.286-.143-1.207-.445-2.299-1.419-.85-.758-1.424-1.693-1.59-1.978-.167-.286-.018-.44.125-.583.13-.129.286-.333.429-.5.143-.167.19-.286.286-.476.095-.19.048-.357-.024-.5-.071-.143-.643-1.547-.881-2.119-.232-.557-.468-.482-.643-.491l-.547-.01c-.19 0-.5.071-.762.357-.262.286-1 1.024-1 2.499 0 1.475 1.071 2.9 1.22 3.095.149.195 2.109 3.22 5.11 4.516.714.309 1.272.494 1.706.632.718.229 1.37.196 1.886.119.577-.086 1.693-.69 1.931-1.357.238-.667.238-1.238.167-1.357-.071-.119-.262-.19-.548-.333z"/></svg>
              </a>
              <a href="https://www.instagram.com/barbearia_neiva/" target="_blank" rel="noreferrer" className="social-icon-btn instagram-hover" title="Instagram Oficial @barbearia_neiva" aria-label="Instagram">
                <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-copy">
            <p>© 2026 Barbearia Neiva. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante WhatsApp */}
      <a href="https://wa.me/5541996453474?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio." target="_blank" rel="noreferrer" className="floating-whatsapp" aria-label="Agendar via WhatsApp">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M19.005 3.175A10.673 10.673 0 0 0 11.5 0C5.158 0 .012 5.147.012 11.488c0 2.026.529 4.005 1.533 5.744L0 24l6.974-1.83a10.63 10.63 0 0 0 4.522 1.018h.005c6.342 0 11.487-5.147 11.487-11.489 0-3.07-1.196-5.955-3.37-8.128zM11.5 21.18c-1.74 0-3.447-.468-4.937-1.353l-.354-.21-3.673.963.98-3.58-.23-.367a9.475 9.475 0 0 1-1.455-5.145c0-5.234 4.258-9.492 9.493-9.492 2.535 0 4.918.988 6.711 2.782a9.426 9.426 0 0 1 2.777 6.713c0 5.235-4.259 9.493-9.494 9.493zm5.21-7.119c-.286-.143-1.693-.836-1.956-.931-.262-.095-.453-.143-.643.143-.19.286-.738.931-.905 1.121-.167.19-.333.214-.619.071-.286-.143-1.207-.445-2.299-1.419-.85-.758-1.424-1.693-1.59-1.978-.167-.286-.018-.44.125-.583.13-.129.286-.333.429-.5.143-.167.19-.286.286-.476.095-.19.048-.357-.024-.5-.071-.143-.643-1.547-.881-2.119-.232-.557-.468-.482-.643-.491l-.547-.01c-.19 0-.5.071-.762.357-.262.286-1 1.024-1 2.499 0 1.475 1.071 2.9 1.22 3.095.149.195 2.109 3.22 5.11 4.516.714.309 1.272.494 1.706.632.718.229 1.37.196 1.886.119.577-.086 1.693-.69 1.931-1.357.238-.667.238-1.238.167-1.357-.071-.119-.262-.19-.548-.333z"/>
        </svg>
      </a>
    </div>
  );
}
