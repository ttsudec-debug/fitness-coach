import { useEffect, useState } from 'react';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

interface ScannerProps {
  onResult: (barcode: string) => void;
  onCancel: () => void;
}

export default function Scanner({ onResult, onCancel }: ScannerProps) {
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function start() {
      try {
        const { camera } = await BarcodeScanner.requestPermissions();
        if (camera !== 'granted' && camera !== 'limited') {
          setError('Permiso de cámara denegado. Habilítalo en los ajustes del celular.');
          return;
        }

        document.documentElement.classList.add('barcode-scanner-active');
        document.body.classList.add('barcode-scanner-active');
        
        // Instalar el módulo de Google Play Services si no existe (solo Android)
        try {
          await BarcodeScanner.installGoogleBarcodeScannerModule();
        } catch (e) {
          console.warn('No se pudo instalar el módulo de escáner. Puede que ya esté o no sea Android.', e);
        }
        
        await BarcodeScanner.addListener('barcodesScanned', async (event) => {
           if (active && event.barcodes && event.barcodes.length > 0) {
              const code = event.barcodes[0].rawValue || event.barcodes[0].displayValue;
              if (code) {
                 active = false;
                 await stop();
                 onResult(code);
              }
           }
        });
        
        await BarcodeScanner.startScan({
          formats: [BarcodeFormat.Ean13, BarcodeFormat.Ean8, BarcodeFormat.UpcA]
        });
        
      } catch (err: any) {
        setError(err.message || 'Error al iniciar la cámara.');
      }
    }
    void start();

    async function stop() {
      document.documentElement.classList.remove('barcode-scanner-active');
      document.body.classList.remove('barcode-scanner-active');
      await BarcodeScanner.removeAllListeners();
      await BarcodeScanner.stopScan().catch(() => {});
    }

    return () => {
      active = false;
      void stop();
    };
  }, [onResult]);

  return (
    <div className="scanner-overlay">
      <div className="scanner-ui">
        {error ? (
          <div className="card warn">
            <p className="warn-text">{error}</p>
            <button className="btn primary" onClick={onCancel}>Cerrar</button>
          </div>
        ) : (
          <>
            <div className="scanner-frame"></div>
            <p className="scanner-text" style={{ color: 'white', fontWeight: 'bold' }}>
              Apunta al código de barras del empaque
            </p>
            <button className="btn danger scanner-cancel" onClick={onCancel}>
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
