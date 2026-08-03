/**
 * Utilitário para compressão leve de imagens no navegador.
 * Reduz a resolução de fotos para no máximo 400x400 e comprime como JPEG (~20KB a 40KB).
 * Evita estourar o limite de cota de LocalStorage (QuotaExceededError - 5MB).
 */
export function compressImageFile(
  file: File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve((e.target?.result as string) || '');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Gera a imagem comprimida em JPEG com qualidade ajustada
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve((e.target?.result as string) || '');
      };
      img.src = (e.target?.result as string) || '';
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsDataURL(file);
  });
}
