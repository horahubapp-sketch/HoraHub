import { useState, useEffect } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import './InstallAppBanner.css';

interface InstallAppBannerProps {
  empresaNome: string;
  logoUrl?: string | null;
}

export default function InstallAppBanner({ empresaNome, logoUrl }: InstallAppBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [bannerFechado, setBannerFechado] = useState(false);

  useEffect(() => {
    // Detecta se já está rodando como PWA (Standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // Detecta se é dispositivo iOS (iPhone / iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Escuta evento nativo do Android / Chrome / Edge para instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback genérico caso o evento ainda não tenha disparado
      setShowIosModal(true);
    }
  };

  if (installed || bannerFechado) return null;
  if (!deferredPrompt && !isIos) return null; // Não exibe se o navegador não for compatível

  return (
    <>
      <div className="install-app-banner">
        <div className="banner-content-left">
          {logoUrl ? (
            <img src={logoUrl} alt={empresaNome} className="banner-logo-img" />
          ) : (
            <div className="banner-logo-placeholder">
              <Smartphone size={20} />
            </div>
          )}
          <div className="banner-text">
            <span className="banner-title">Instalar App do Estabelecimento</span>
            <span className="banner-desc">Acesse os agendamentos de {empresaNome} direto da sua tela inicial!</span>
          </div>
        </div>

        <div className="banner-actions-right">
          <button className="btn-install-pwa" onClick={handleInstallClick}>
            <Download size={16} />
            <span>Instalar App</span>
          </button>
          <button className="btn-close-banner" onClick={() => setBannerFechado(true)} title="Fechar aviso">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Modal Guia de Instalação para iOS */}
      {showIosModal && (
        <div className="ios-install-overlay" onClick={() => setShowIosModal(false)}>
          <div className="ios-install-modal" onClick={e => e.stopPropagation()}>
            <button className="btn-close-ios" onClick={() => setShowIosModal(false)}>
              <X size={20} />
            </button>

            <div className="ios-modal-header">
              <div className="ios-icon-circle">
                <Smartphone size={26} />
              </div>
              <h3>Adicionar {empresaNome} à Tela Inicial</h3>
              <p>Siga os 3 passos simples no seu iPhone/iPad para usar como aplicativo:</p>
            </div>

            <div className="ios-steps-list">
              <div className="ios-step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <span className="step-title">Toque em Compartilhar <Share2 size={16} className="inline-icon" /></span>
                  <span className="step-desc">Localize o botão de compartilhar na barra inferior do Safari.</span>
                </div>
              </div>

              <div className="ios-step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <span className="step-title">Selecione "Adicionar à Tela de Início" <PlusSquare size={16} className="inline-icon" /></span>
                  <span className="step-desc">Role as opções para baixo até encontrar este item.</span>
                </div>
              </div>

              <div className="ios-step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <span className="step-title">Confirme em "Adicionar" <CheckCircle2 size={16} className="inline-icon" /></span>
                  <span className="step-desc">O ícone do app de {empresaNome} surgirá instantaneamente na sua tela inicial!</span>
                </div>
              </div>
            </div>

            <button className="btn-entendi-ios" onClick={() => setShowIosModal(false)}>
              Entendi!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
