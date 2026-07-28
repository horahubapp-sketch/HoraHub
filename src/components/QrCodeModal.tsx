import { useState } from 'react';
import { X, Copy, Check, Download, QrCode } from 'lucide-react';
import './QrCodeModal.css';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresaNome: string;
  slug: string;
}

export default function QrCodeModal({ isOpen, onClose, empresaNome, slug }: QrCodeModalProps) {
  const [copiado, setCopiado] = useState(false);

  if (!isOpen) return null;

  const urlCompleta = `${window.location.origin}/agendar/${slug}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(urlCompleta)}&color=121214&bgcolor=ffffff`;

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(urlCompleta);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleBaixarQrCode = async () => {
    try {
      const response = await fetch(qrCodeApiUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `qrcode-agendamento-${slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(qrCodeApiUrl, '_blank');
    }
  };

  return (
    <div className="qrcode-overlay" onClick={onClose}>
      <div className="qrcode-card-modal" onClick={e => e.stopPropagation()}>
        <button className="btn-close-qrcode" onClick={onClose} title="Fechar">
          <X size={20} />
        </button>

        <div className="qrcode-header">
          <div className="qrcode-icon-badge">
            <QrCode size={24} />
          </div>
          <h2>App de Agendamento</h2>
          <p className="qrcode-subtitle">Digitalize o QR Code ou compartilhe o link direto de <strong>{empresaNome}</strong>.</p>
        </div>

        <div className="qrcode-image-box">
          <img src={qrCodeApiUrl} alt={`QR Code de Agendamento de ${empresaNome}`} className="qrcode-img" />
        </div>

        <div className="qrcode-link-input-group">
          <input type="text" readOnly value={urlCompleta} className="qrcode-link-input" />
          <button className={`btn-copy-qrcode ${copiado ? 'copied' : ''}`} onClick={handleCopiarLink}>
            {copiado ? <Check size={16} /> : <Copy size={16} />}
            <span>{copiado ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        <div className="qrcode-actions">
          <button className="btn-download-qrcode" onClick={handleBaixarQrCode}>
            <Download size={18} />
            <span>Baixar Imagem do QR Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}
