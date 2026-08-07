import { useState } from 'react';
import './BarbeariaNeivaLandingPage.css';

export default function BarbeariaNeivaLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="neiva-page-root">
      {/* Top Infobar */}
      <div className="top-infobar">
        <div className="neiva-container infobar-container">
          <div className="infobar-left">
            <span className="infobar-item">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Rua Barão do Cerro Azul, 2100 - São José dos Pinhais - PR
            </span>
            <span className="infobar-item hide-mobile">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              Seg-Sex: 8h-20h | Sáb: 8h-17h | Dom: 9h-13h30
            </span>
          </div>
          <div className="infobar-right">
            <a href="https://www.instagram.com/barbearia_neiva/" target="_blank" rel="noopener noreferrer" className="infobar-whatsapp" style={{ marginRight: '1.2rem' }}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @barbearia_neiva
            </a>
            <a href="https://wa.me/5541996453474?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20na%20Barbearia%20Neiva." target="_blank" rel="noopener noreferrer" className="infobar-whatsapp">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M19.005 3.175A10.673 10.673 0 0 0 11.5 0C5.158 0 .012 5.147.012 11.488c0 2.026.529 4.005 1.533 5.744L0 24l6.974-1.83a10.63 10.63 0 0 0 4.522 1.018h.005c6.342 0 11.487-5.147 11.487-11.489 0-3.07-1.196-5.955-3.37-8.128zM11.5 21.18c-1.74 0-3.447-.468-4.937-1.353l-.354-.21-3.673.963.98-3.58-.23-.367a9.475 9.475 0 0 1-1.455-5.145c0-5.234 4.258-9.492 9.493-9.492 2.535 0 4.918.988 6.711 2.782a9.426 9.426 0 0 1 2.777 6.713c0 5.235-4.259 9.493-9.494 9.493zm5.21-7.119c-.286-.143-1.693-.836-1.956-.931-.262-.095-.453-.143-.643.143-.19.286-.738.931-.905 1.121-.167.19-.333.214-.619.071-.286-.143-1.207-.445-2.299-1.419-.85-.758-1.424-1.693-1.59-1.978-.167-.286-.018-.44.125-.583.13-.129.286-.333.429-.5.143-.167.19-.286.286-.476.095-.19.048-.357-.024-.5-.071-.143-.643-1.547-.881-2.119-.232-.557-.468-.482-.643-.491l-.547-.01c-.19 0-.5.071-.762.357-.262.286-1 1.024-1 2.499 0 1.475 1.071 2.9 1.22 3.095.149.195 2.109 3.22 5.11 4.516.714.309 1.272.494 1.706.632.718.229 1.37.196 1.886.119.577-.086 1.693-.69 1.931-1.357.238-.667.238-1.238.167-1.357-.071-.119-.262-.19-.548-.333z"/>
              </svg>
              (41) 99645-3474
            </a>
          </div>
        </div>
      </div>

      {/* Header / Navigation com o Logotipo Oficial */}
      <header className="site-header" id="header">
        <div className="neiva-container header-container">
          <a href="#" className="brand-logo-official">
            <img src="/neiva-assets/logo_official.png" alt="Barbearia Neiva - Logotipo Oficial" className="official-logo-img" />
          </a>

          {/* Menu Desktop (Visível apenas em Desktop) */}
          <nav className="main-nav desktop-nav">
            <ul>
              <li><a href="#home">Início</a></li>
              <li><a href="#sobre">O Espaço</a></li>
              <li><a href="#planos">Assinatura</a></li>
              <li><a href="#galeria">Fotos do Local</a></li>
              <li><a href="#contato">Localização</a></li>
            </ul>
          </nav>

          {/* Menu Drawer Mobile (Visível apenas no Celular quando aberto) */}
          <div className={`mobile-drawer-overlay ${mobileMenuOpen ? 'mobile-active' : ''}`} id="mobileDrawer">
            <div className="mobile-drawer-header">
              <span className="drawer-title">NAVEGAÇÃO</span>
              <button className="drawer-close-btn" id="drawerCloseBtn" onClick={closeMobileMenu} aria-label="Fechar Menu">✕</button>
            </div>

            <div className="mobile-menu-sections">
              <div className="menu-cat">
                <span className="menu-cat-title">INSTITUCIONAL</span>
                <ul>
                  <li><a href="#home" onClick={closeMobileMenu}>Início</a></li>
                  <li><a href="#sobre" onClick={closeMobileMenu}>O Espaço & História</a></li>
                  <li><a href="#galeria" onClick={closeMobileMenu}>Fotos do Local</a></li>
                </ul>
              </div>

              <div className="menu-cat">
                <span className="menu-cat-title">PRODUTOS & SERVIÇOS</span>
                <ul>
                  <li><a href="#planos" onClick={closeMobileMenu}>Planos de Assinatura</a></li>
                </ul>
              </div>

              <div className="menu-cat">
                <span className="menu-cat-title">CONTATO & LOCALIZAÇÃO</span>
                <ul>
                  <li><a href="#contato" onClick={closeMobileMenu}>Localização & Horários</a></li>
                </ul>
              </div>
            </div>

            <div className="mobile-drawer-footer">
              <span className="menu-cat-title">REDES SOCIAIS</span>
              <div className="social-icons-wrapper" style={{ justifyContent: 'center', margin: '0.8rem 0 1.2rem' }}>
                <a href="https://wa.me/5541996453474?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio." target="_blank" rel="noopener noreferrer" className="social-icon-btn whatsapp-hover" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24">
                    <path d="M19.005 3.175A10.673 10.673 0 0 0 11.5 0C5.158 0 .012 5.147.012 11.488c0 2.026.529 4.005 1.533 5.744L0 24l6.974-1.83a10.63 10.63 0 0 0 4.522 1.018h.005c6.342 0 11.487-5.147 11.487-11.489 0-3.07-1.196-5.955-3.37-8.128zM11.5 21.18c-1.74 0-3.447-.468-4.937-1.353l-.354-.21-3.673.963.98-3.58-.23-.367a9.475 9.475 0 0 1-1.455-5.145c0-5.234 4.258-9.492 9.493-9.492 2.535 0 4.918.988 6.711 2.782a9.426 9.426 0 0 1 2.777 6.713c0 5.235-4.259 9.493-9.494 9.493zm5.21-7.119c-.286-.143-1.693-.836-1.956-.931-.262-.095-.453-.143-.643.143-.19.286-.738.931-.905 1.121-.167.19-.333.214-.619.071-.286-.143-1.207-.445-2.299-1.419-.85-.758-1.424-1.693-1.59-1.978-.167-.286-.018-.44.125-.583.13-.129.286-.333.429-.5.143-.167.19-.286.286-.476.095-.19.048-.357-.024-.5-.071-.143-.643-1.547-.881-2.119-.232-.557-.468-.482-.643-.491l-.547-.01c-.19 0-.5.071-.762.357-.262.286-1 1.024-1 2.499 0 1.475 1.071 2.9 1.22 3.095.149.195 2.109 3.22 5.11 4.516.714.309 1.272.494 1.706.632.718.229 1.37.196 1.886.119.577-.086 1.693-.69 1.931-1.357.238-.667.238-1.238.167-1.357-.071-.119-.262-.19-.548-.333z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/barbearia_neiva/" target="_blank" rel="noopener noreferrer" className="social-icon-btn instagram-hover" aria-label="Instagram">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
              <a href="https://wa.me/5541996453474?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio." target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={closeMobileMenu}>Agendar pelo WhatsApp</a>
            </div>
          </div>

          <div className="header-actions">
            <a href="https://wa.me/5541996453474?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20na%20Barbearia%20Neiva." target="_blank" rel="noopener noreferrer" className="btn btn-primary nav-cta hide-mobile">
              Agendar pelo WhatsApp
            </a>
            <button className="mobile-toggle-btn" id="mobileToggleBtn" onClick={toggleMobileMenu} aria-label="Abrir Menu">
              <span className="hamburger-icon">☰</span>
              <span className="toggle-text">MENU</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section com Imagem Oficial da Barbearia Neiva */}
      <section className="hero-section" id="home">
        <div className="hero-bg-overlay"></div>
        <div className="neiva-container hero-container">
          {/* Logotipo Oficial no Hero */}
          <div className="hero-logo-wrapper">
            <img src="/neiva-assets/logo_official.png" alt="Barbearia Neiva" className="hero-official-logo" />
          </div>

          <h1 className="hero-title">Referência em Cuidado Masculino em <span className="text-gradient">São José dos Pinhais</span></h1>
          <p className="hero-subtitle">
            Você em sua melhor versão. Uma experiência exclusiva com atendimento VIP, tradição e sofisticação em cada detalhe.
          </p>

          <div className="hero-buttons">
            <a href="https://wa.me/5541996453474?text=Ol%C3%A1!%20Quero%20agendar%20pelo%20WhatsApp!" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-hero">
              Agendar pelo WhatsApp
            </a>
            <a href="https://sites.appbarber.com.br/barbearianeiva" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-hero">
              Assinar pelo App Barber
            </a>
          </div>
        </div>
      </section>

      {/* Barra de Transição Lema */}
      <div className="brand-lema-bar">
        <div className="neiva-container lema-container">
          <span className="lema-item">TRADIÇÃO</span>
          <span className="lema-divider">|</span>
          <span className="lema-item">ELEGÂNCIA</span>
          <span className="lema-divider">|</span>
          <span className="lema-item">ALTO PADRÃO</span>
        </div>
      </div>

      {/* O Espaço & História da Barbearia Neiva */}
      <section className="about-section" id="sobre">
        <div className="neiva-container">
          {/* Bloco com a História Real do Fundador Neiva */}
          <div className="story-wrapper">
            <div className="story-content">
              <span className="section-tag">NOSSA TRAJETÓRIA & HISTÓRIA</span>
              <h2 className="section-title">Do Vale do Jequitinhonha ao Alto Padrão em São José dos Pinhais</h2>
              <p>
                Nascido em Araçuaí, no interior de Minas Gerais, o fundador <strong>Neiva</strong> partiu rumo a Curitiba e São José dos Pinhais em busca de novos horizontes. No início de sua jornada, trabalhou por muitos anos como garçom antes de descobrir sua verdadeira vocação na arte da barbearia.
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
        </div>
      </section>

      {/* Planos VIP */}
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
                <span className="amount">89,90</span>
                <span className="period">/mês</span>
              </div>
              <ul className="plan-features">
                <li>✓ Cortes de cabelo ilimitados</li>
                <li>✓ Agendamento direto no App Barber</li>
                <li>✓ Desconto em produtos exclusivos</li>
              </ul>
              <a href="https://sites.appbarber.com.br/barbearianeiva" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-plan">Assinar Plano</a>
            </div>

            <div className="card-glass plan-card plan-vip">
              <div className="plan-ribbon">RECOMENDADO</div>
              <h3 className="plan-name">Plano Cabelo + Barba</h3>
              <div className="plan-price">
                <span className="currency">R$</span>
                <span className="amount">189,90</span>
                <span className="period">/mês</span>
              </div>
              <ul className="plan-features">
                <li>✓ <strong>Cortes e Barba ILIMITADOS</strong></li>
                <li>✓ Barboterapia com toalha quente inclusa</li>
                <li>✓ Agendamento prioritário no App Barber</li>
                <li>✓ Desconto VIP em toda a linha de cosméticos</li>
              </ul>
              <a href="https://sites.appbarber.com.br/barbearianeiva" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-plan">Assinar Plano</a>
            </div>

            <div className="card-glass plan-card">
              <h3 className="plan-name">Plano Barba</h3>
              <div className="plan-price">
                <span className="currency">R$</span>
                <span className="amount">99,90</span>
                <span className="period">/mês</span>
              </div>
              <ul className="plan-features">
                <li>✓ Barba & alinhamento de contorno ilimitados</li>
                <li>✓ Hidratação com óleos nutritivos</li>
                <li>✓ Agendamento prático pelo App Barber</li>
              </ul>
              <a href="https://sites.appbarber.com.br/barbearianeiva" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-plan">Assinar Plano</a>
            </div>
          </div>
        </div>
      </section>

      {/* Galeria de Fotos Reais */}
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

      {/* Avaliações dos Clientes (Depoimentos) */}
      <section className="testimonials-section" id="avaliacoes">
        <div className="neiva-container">
          <div className="section-header">
            <span className="section-tag">DEPOIMENTOS NO GOOGLE</span>
            <h2 className="section-title">O Que Nossos Clientes Dizem</h2>
            <p className="section-description">A satisfação de quem frequenta a Barbearia Neiva é a nossa maior recompensa.</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card card-glass">
              <div className="testimonial-header">
                <div className="client-info">
                  <span className="client-avatar">AS</span>
                  <div>
                    <h4 className="client-name">Allef Santos da Silva</h4>
                    <div className="client-meta">12 avaliações • São José dos Pinhais</div>
                  </div>
                </div>
                <div className="rating-stars">★★★★★</div>
              </div>
              <p className="testimonial-text">
                "Fui atendido pelo próprio Weber e tive uma excelente experiência. Atendimento muito atencioso, com cuidado nos detalhes e boas sugestões tanto para o corte da barba quanto do cabelo. O ambiente é tranquilo, receptivo e acolhedor."
              </p>
              <div className="testimonial-services">
                <strong>Serviços recomendados:</strong> Corte com navalha, corte de cabelo, barba, degradê, toalha quente.
              </div>
            </div>

            <div className="testimonial-card card-glass">
              <div className="testimonial-header">
                <div className="client-info">
                  <span className="client-avatar">HA</span>
                  <div>
                    <h4 className="client-name">Hector Assis</h4>
                    <div className="client-meta">9 avaliações</div>
                  </div>
                </div>
                <div className="rating-stars">★★★★★</div>
              </div>
              <p className="testimonial-text">
                "Maravilhoso meu marido foi muito bem atendido ficou nota 1000 o corte de cabelo dele. Meu filho autista nível de suporte 2 foi muito bem atendido, tiveram muita paciência para cortar o cabelo dele e ficou maravilhoso, fez um corte perfeito."
              </p>
              <div className="testimonial-services">
                <strong>Serviços recomendados:</strong> Cortes infantis, corte de cabelo.
              </div>
            </div>

            <div className="testimonial-card card-glass">
              <div className="testimonial-header">
                <div className="client-info">
                  <span className="client-avatar">RL</span>
                  <div>
                    <h4 className="client-name">Ruan Luquetta</h4>
                    <div className="client-meta">7 avaliações</div>
                  </div>
                </div>
                <div className="rating-stars">★★★★★</div>
              </div>
              <p className="testimonial-text">
                "Fui muito bem atendido pelo Gabriel, excelente profissional, atencioso, simpático e demonstra dominar bastante as técnicas de corte, barba e demais serviços. O local é bem moderno e cheio de atividades interativas. Voltarei sempre!"
              </p>
            </div>

            <div className="testimonial-card card-glass">
              <div className="testimonial-header">
                <div className="client-info">
                  <span className="client-avatar">M</span>
                  <div>
                    <h4 className="client-name">Midiart</h4>
                    <div className="client-meta">12 avaliações • São José dos Pinhais</div>
                  </div>
                </div>
                <div className="rating-stars">★★★★★</div>
              </div>
              <p className="testimonial-text">
                "Dei 5 estrelas porque só tem 5, pois merecia mais... Local limpo, arejado, excelente atendimento, e enquanto você espera o filhão cortar o cabelo pode saborear um amendoim e bebida de sua preferência. Acolhem muito bem as crianças."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Localização e Contato */}
      <section className="contact-section" id="contato">
        <div className="neiva-container">
          <div className="contact-wrapper card-glass">
            <div className="contact-info">
              <span className="section-tag">LOCALIZAÇÃO & CONTATO</span>
              <h2>Visite a Barbearia Neiva</h2>
              <p>Referência em cuidado masculino de alto padrão em São José dos Pinhais - PR.</p>

              <div className="info-list">
                <div className="info-item">
                  <span className="info-icon">
                    <svg viewBox="0 0 24 24" className="info-svg-icon" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </span>
                  <div>
                    <strong>Endereço Oficial:</strong>
                    <p>Rua Barão do Cerro Azul, 2100 - Bairro Bom Jesus<br />São José dos Pinhais - PR</p>
                    <a href="https://maps.app.goo.gl/6eJ2bytyjsfvFEESA" target="_blank" rel="noopener noreferrer" className="btn-service-link" style={{ marginTop: '0.4rem', display: 'inline-block' }}>Ver no Google Maps →</a>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-icon">
                    <svg viewBox="0 0 24 24" className="info-svg-icon" fill="currentColor">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                    </svg>
                  </span>
                  <div>
                    <strong>Estacionamento Facilitado:</strong>
                    <p>Contamos com estacionamento na frente da barbearia com 3 vagas exclusivas, além de amplo espaço para estacionar nas ruas do entorno.</p>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-icon">
                    <svg viewBox="0 0 24 24" className="info-svg-icon" fill="currentColor">
                      <path d="M19.005 3.175A10.673 10.673 0 0 0 11.5 0C5.158 0 .012 5.147.012 11.488c0 2.026.529 4.005 1.533 5.744L0 24l6.974-1.83a10.63 10.63 0 0 0 4.522 1.018h.005c6.342 0 11.487-5.147 11.487-11.489 0-3.07-1.196-5.955-3.37-8.128zM11.5 21.18c-1.74 0-3.447-.468-4.937-1.353l-.354-.21-3.673.963.98-3.58-.23-.367a9.475 9.475 0 0 1-1.455-5.145c0-5.234 4.258-9.492 9.493-9.492 2.535 0 4.918.988 6.711 2.782a9.426 9.426 0 0 1 2.777 6.713c0 5.235-4.259 9.493-9.494 9.493zm5.21-7.119c-.286-.143-1.693-.836-1.956-.931-.262-.095-.453-.143-.643.143-.19.286-.738.931-.905 1.121-.167.19-.333.214-.619.071-.286-.143-1.207-.445-2.299-1.419-.85-.758-1.424-1.693-1.59-1.978-.167-.286-.018-.44.125-.583.13-.129.286-.333.429-.5.143-.167.19-.286.286-.476.095-.19.048-.357-.024-.5-.071-.143-.643-1.547-.881-2.119-.232-.557-.468-.482-.643-.491l-.547-.01c-.19 0-.5.071-.762.357-.262.286-1 1.024-1 2.499 0 1.475 1.071 2.9 1.22 3.095.149.195 2.109 3.22 5.11 4.516.714.309 1.272.494 1.706.632.718.229 1.37.196 1.886.119.577-.086 1.693-.69 1.931-1.357.238-.667.238-1.238.167-1.357-.071-.119-.262-.19-.548-.333z"/>
                    </svg>
                  </span>
                  <div>
                    <strong>Agendamento Direct & App:</strong>
                    <p>WhatsApp (41) 99645-3474 | App Barber</p>
                  </div>
                </div>
              </div>

              <div className="hours-box">
                <h4>
                  <svg viewBox="0 0 24 24" width="18" height="18" className="info-svg-icon-inline" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: 'var(--color-primary)' }}>
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  Horários de Funcionamento
                </h4>
                <ul className="hours-list">
                  <li><span>Segunda a Sexta:</span> <strong>08:00 às 20:00</strong></li>
                  <li><span>Sábado:</span> <strong>08:00 às 17:00</strong></li>
                  <li><span>Domingo:</span> <strong>09:00 às 13:30</strong></li>
                </ul>
              </div>
            </div>

            <div className="map-image-card card-glass">
              <img src="/neiva-assets/foto_estacionamento.jpg" alt="Fachada da Barbearia Neiva" className="map-image-fachada" />
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

            {/* Ícones Sociais no Footer */}
            <div className="social-icons-wrapper" style={{ justifyContent: 'center', marginTop: '1.2rem' }}>
              <a href="https://wa.me/5541996453474?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio." target="_blank" rel="noopener noreferrer" className="social-icon-btn whatsapp-hover" title="WhatsApp Oficial (41) 99645-3474" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24">
                  <path d="M19.005 3.175A10.673 10.673 0 0 0 11.5 0C5.158 0 .012 5.147.012 11.488c0 2.026.529 4.005 1.533 5.744L0 24l6.974-1.83a10.63 10.63 0 0 0 4.522 1.018h.005c6.342 0 11.487-5.147 11.487-11.489 0-3.07-1.196-5.955-3.37-8.128zM11.5 21.18c-1.74 0-3.447-.468-4.937-1.353l-.354-.21-3.673.963.98-3.58-.23-.367a9.475 9.475 0 0 1-1.455-5.145c0-5.234 4.258-9.492 9.493-9.492 2.535 0 4.918.988 6.711 2.782a9.426 9.426 0 0 1 2.777 6.713c0 5.235-4.259 9.493-9.494 9.493zm5.21-7.119c-.286-.143-1.693-.836-1.956-.931-.262-.095-.453-.143-.643.143-.19.286-.738.931-.905 1.121-.167.19-.333.214-.619.071-.286-.143-1.207-.445-2.299-1.419-.85-.758-1.424-1.693-1.59-1.978-.167-.286-.018-.44.125-.583.13-.129.286-.333.429-.5.143-.167.19-.286.286-.476.095-.19.048-.357-.024-.5-.071-.143-.643-1.547-.881-2.119-.232-.557-.468-.482-.643-.491l-.547-.01c-.19 0-.5.071-.762.357-.262.286-1 1.024-1 2.499 0 1.475 1.071 2.9 1.22 3.095.149.195 2.109 3.22 5.11 4.516.714.309 1.272.494 1.706.632.718.229 1.37.196 1.886.119.577-.086 1.693-.69 1.931-1.357.238-.667.238-1.238.167-1.357-.071-.119-.262-.19-.548-.333z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/barbearia_neiva/" target="_blank" rel="noopener noreferrer" className="social-icon-btn instagram-hover" title="Instagram Oficial @barbearia_neiva" aria-label="Instagram">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-copy">
            <p>© 2026 Barbearia Neiva. Todos os direitos reservados. Projeto oficial para a suite LandingPagesHub.</p>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante do WhatsApp */}
      <a href="https://wa.me/5541996453474?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio." target="_blank" rel="noopener noreferrer" className="floating-whatsapp" aria-label="Agendar via WhatsApp">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M19.005 3.175A10.673 10.673 0 0 0 11.5 0C5.158 0 .012 5.147.012 11.488c0 2.026.529 4.005 1.533 5.744L0 24l6.974-1.83a10.63 10.63 0 0 0 4.522 1.018h.005c6.342 0 11.487-5.147 11.487-11.489 0-3.07-1.196-5.955-3.37-8.128zM11.5 21.18c-1.74 0-3.447-.468-4.937-1.353l-.354-.21-3.673.963.98-3.58-.23-.367a9.475 9.475 0 0 1-1.455-5.145c0-5.234 4.258-9.492 9.493-9.492 2.535 0 4.918.988 6.711 2.782a9.426 9.426 0 0 1 2.777 6.713c0 5.235-4.259 9.493-9.494 9.493zm5.21-7.119c-.286-.143-1.693-.836-1.956-.931-.262-.095-.453-.143-.643.143-.19.286-.738.931-.905 1.121-.167.19-.333.214-.619.071-.286-.143-1.207-.445-2.299-1.419-.85-.758-1.424-1.693-1.59-1.978-.167-.286-.018-.44.125-.583.13-.129.286-.333.429-.5.143-.167.19-.286.286-.476.095-.19.048-.357-.024-.5-.071-.143-.643-1.547-.881-2.119-.232-.557-.468-.482-.643-.491l-.547-.01c-.19 0-.5.071-.762.357-.262.286-1 1.024-1 2.499 0 1.475 1.071 2.9 1.22 3.095.149.195 2.109 3.22 5.11 4.516.714.309 1.272.494 1.706.632.718.229 1.37.196 1.886.119.577-.086 1.693-.69 1.931-1.357.238-.667.238-1.238.167-1.357-.071-.119-.262-.19-.548-.333z"/>
        </svg>
      </a>
    </div>
  );
}
