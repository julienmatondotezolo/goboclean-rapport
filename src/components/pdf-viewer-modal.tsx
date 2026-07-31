'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Loader2, Download } from 'lucide-react';

/**
 * Visionneuse PDF intégrée (pdf.js) — le PDF s'affiche DANS l'app, en modal
 * plein écran, page par page sur canvas (net grâce au devicePixelRatio).
 * Fonctionne aussi sur iOS où l'<iframe> PDF ne rend pas.
 */
interface PdfViewerModalProps {
  url: string;
  title?: string;
  onClose: () => void;
  canDownload?: boolean;
}

export function PdfViewerModal({ url, title, onClose, canDownload = false }: PdfViewerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();

        const doc = await pdfjs.getDocument({ url }).promise;
        if (cancelled || !containerRef.current) return;

        const container = containerRef.current;
        container.innerHTML = '';
        const containerWidth = container.clientWidth || 360;
        const dpr = Math.min(window.devicePixelRatio || 1, 3);

        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          if (cancelled) return;
          const base = page.getViewport({ scale: 1 });
          const scale = (containerWidth - 16) / base.width;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
          canvas.style.display = 'block';
          canvas.style.margin = '0 auto 12px';
          canvas.style.borderRadius = '8px';
          canvas.style.boxShadow = '0 2px 12px rgba(0,0,0,0.25)';
          canvas.style.backgroundColor = '#ffffff';

          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          await page.render({
            canvas,
            canvasContext: ctx,
            viewport,
            transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
          }).promise;
          container.appendChild(canvas);
        }
        if (!cancelled) setLoading(false);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? 'Erreur de chargement du PDF');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col">
      {/* Barre supérieure */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#064e3b] shrink-0">
        <p className="text-[14px] font-bold text-white truncate pr-3">{title ?? 'PDF'}</p>
        <div className="flex items-center gap-2 shrink-0">
          {canDownload && (
            <a
              href={url}
              download
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <Download className="w-4 h-4 text-white" />
            </a>
          )}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Pages */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}
        {error && (
          <p className="text-center text-[13px] text-red-300 font-medium py-10 px-6">{error}</p>
        )}
        <div ref={containerRef} />
      </div>
    </div>
  );
}
