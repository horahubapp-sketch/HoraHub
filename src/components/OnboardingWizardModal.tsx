import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, Scissors, UserCheck, ExternalLink, ArrowRight, X, Copy, Check } from 'lucide-react';
import './OnboardingWizardModal.css';

interface OnboardingWizardModalProps {
  empresaNome: string;
  slug: string | null;
  onClose: () => void;
}

export default function OnboardingWizardModal({ empresaNome, slug, onClose }: OnboardingWizardModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [copied, setCopied] = useState(false);

  const publicUrl = slug ? `${window.location.origin}/agendar/${slug}` : window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <button className="onboarding-close-btn" onClick={onClose} title="Fechar guia">
          <X size={18} />
        </button>

        {/* Header com Badge e Título */}
        <header className="onboarding-header">
          <div className="onboarding-sparkle-badge">
            <Sparkles size={16} />
            <span>Primeiros Passos no Encaixe</span>
          </div>
          <h2>Seja bem-vindo(a), {empresaNome}!</h2>
          <p>Siga os 3 passos abaixo para deixar sua agenda 100% pronta para receber clientes.</p>
        </header>

        {/* Indicador de Passos (Stepper) */}
        <div className="onboarding-stepper">
          <div className={`stepper-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`} onClick={() => setStep(1)}>
            <div className="step-circle">{step > 1 ? <CheckCircle2 size={16} /> : 1}</div>
            <span>Serviços</span>
          </div>
          <div className="stepper-line"></div>
          <div className={`stepper-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`} onClick={() => setStep(2)}>
            <div className="step-circle">{step > 2 ? <CheckCircle2 size={16} /> : 2}</div>
            <span>Equipe</span>
          </div>
          <div className="stepper-line"></div>
          <div className={`stepper-step ${step >= 3 ? 'active' : ''}`} onClick={() => setStep(3)}>
            <div className="step-circle">3</div>
            <span>Divulgação</span>
          </div>
        </div>

        {/* Conteúdo do Passo Ativo */}
        <div className="onboarding-body">
          {step === 1 && (
            <div className="onboarding-step-content">
              <div className="step-icon-circle blue">
                <Scissors size={28} />
              </div>
              <h3>Passo 1: Cadastre seus Serviços</h3>
              <p>
                Defina os serviços oferecidos (ex: Corte, Barba, Coloração), durações em minutos e preços sugeridos para exibição no seu portal de agendamentos.
              </p>
              <div className="onboarding-actions">
                <button 
                  className="btn-onboarding-primary" 
                  onClick={() => {
                    onClose();
                    navigate('/admin/servicos');
                  }}
                >
                  <span>Ir para Gestão de Serviços</span>
                  <ArrowRight size={16} />
                </button>
                <button className="btn-onboarding-next" onClick={() => setStep(2)}>
                  Próximo Passo &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-step-content">
              <div className="step-icon-circle green">
                <UserCheck size={28} />
              </div>
              <h3>Passo 2: Configure sua Equipe</h3>
              <p>
                Adicione os profissionais da sua empresa, foto de perfil, especialidades e comissões para que cada um tenha sua própria coluna na agenda.
              </p>
              <div className="onboarding-actions">
                <button 
                  className="btn-onboarding-primary" 
                  onClick={() => {
                    onClose();
                    navigate('/admin/profissionais');
                  }}
                >
                  <span>Ir para Gestão de Equipe</span>
                  <ArrowRight size={16} />
                </button>
                <button className="btn-onboarding-next" onClick={() => setStep(3)}>
                  Próximo Passo &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onboarding-step-content">
              <div className="step-icon-circle emerald">
                <ExternalLink size={28} />
              </div>
              <h3>Passo 3: Divulgue seu Link aos Clientes</h3>
              <p>
                Sua empresa possui um link público exclusivo. Compartilhe no seu Instagram ou WhatsApp para que os clientes agendem diretamente online.
              </p>

              <div className="onboarding-url-box">
                <code>{publicUrl}</code>
                <button className="btn-copy-url" onClick={handleCopyLink}>
                  {copied ? <Check size={16} color="#00E676" /> : <Copy size={16} />}
                  <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>

              <div className="onboarding-actions">
                <button 
                  className="btn-onboarding-primary" 
                  onClick={() => {
                    window.open(publicUrl, '_blank');
                  }}
                >
                  <span>Visualizar Meu Portal Público</span>
                  <ExternalLink size={16} />
                </button>
                <button className="btn-onboarding-finish" onClick={onClose}>
                  Concluir Guia & Começar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
