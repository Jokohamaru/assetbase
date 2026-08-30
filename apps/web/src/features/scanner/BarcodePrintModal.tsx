import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { X, Check, Printer, ScanLine, Barcode, QrCode } from 'lucide-react';
import type { Asset } from '../../types';

export function BarcodePrintModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [format, setFormat] = useState<'barcode' | 'qr' | 'both'>('barcode');

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, asset.assetTag, {
        format: 'CODE128',
        width: 2.1,
        height: 72,
        displayValue: true,
        font: 'Inter, sans-serif',
        fontSize: 16,
        margin: 12
      });
    }
    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, asset.assetTag, {
        width: 150,
        margin: 1,
        errorCorrectionLevel: 'M'
      });
    }
  }, [asset, format]);

  const print = () => {
    const svg = svgRef.current?.outerHTML || '';
    const qr = qrRef.current?.toDataURL('image/png') || '';
    
    let codesHtml = '';
    if (format === 'barcode') codesHtml = svg;
    else if (format === 'qr') codesHtml = `<img class="qr" src="${qr}">`;
    else codesHtml = `<div class="codes">${svg}<img class="qr" src="${qr}"></div>`;

    const w = window.open('', '_blank', 'width=720,height=520');
    if (!w) return;
    
    const escapeHtml = (value: string | undefined) => String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c] || c));

    w.document.write(`
      <html>
        <head>
          <title>Nhãn ${escapeHtml(asset.assetTag)}</title>
          <style>
            @page { margin: 8mm }
            body { 
              font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
              display: grid;
              place-items: center;
              padding: 24px;
            }
            .label {
              width: ${format === 'both' ? '520' : '360'}px;
              border: 1px dashed #888;
              padding: 18px;
              text-align: center;
            }
            .name { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
            .codes { display: flex; align-items: center; justify-content: center; gap: 18px; }
            .codes svg { max-width: 330px; }
            .qr { width: 150px; height: 150px; }
            .meta { font-size: 11px; color: #555; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="name">${escapeHtml(asset.name)}</div>
            ${codesHtml}
            <div class="meta">${escapeHtml(asset.department?.name || 'Chưa gán')} &middot; ${escapeHtml(asset.location?.name || 'Chưa xác định')}</div>
          </div>
          <script>window.onload=()=>{window.print();window.close()}</script>
        </body>
      </html>
    `);
    w.document.close();
  };

  const options = [
    { value: 'barcode', label: 'Barcode', description: 'Phù hợp máy quét 1D và tem dài', icon: Barcode },
    { value: 'qr', label: 'QR Code', description: 'Tem vuông, quét bằng camera', icon: QrCode },
    { value: 'both', label: 'Cả hai', description: 'In đồng thời Barcode và QR', icon: ScanLine },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">In nhãn tài sản</h2>
            <p className="text-sm text-gray-500 mt-1">Chọn định dạng mã vạch để in nhãn dán cho thiết bị.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFormat(opt.value)}
                className={`flex flex-col items-center text-center p-4 border rounded-xl transition-all \${
                  format === opt.value
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 \${format === opt.value ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                  <opt.icon size={24} />
                </div>
                <h3 className={`font-semibold text-sm mb-1 \${format === opt.value ? 'text-indigo-900' : 'text-gray-900'}`}>{opt.label}</h3>
                <p className="text-xs text-gray-500">{opt.description}</p>
                {format === opt.value && (
                  <div className="absolute top-2 right-2 text-indigo-600">
                    <Check size={16} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-8 flex items-center justify-center border border-gray-100">
            <div className={`bg-white border-2 border-dashed border-gray-300 p-6 rounded-xl flex flex-col items-center justify-center \${format === 'both' ? 'w-[420px]' : 'w-[280px]'}`}>
              <div className="font-bold text-gray-900 mb-4 text-center">{asset.name}</div>
              <div className="flex items-center gap-6 justify-center">
                <div className={`flex justify-center \${format === 'qr' ? 'hidden' : ''}`}>
                  <svg ref={svgRef} className="max-w-full" />
                </div>
                <div className={`flex flex-col items-center \${format === 'barcode' ? 'hidden' : ''}`}>
                  <canvas ref={qrRef} />
                  <span className="text-sm font-medium mt-1">{asset.assetTag}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-4 text-center">
                {asset.department?.name || 'Chưa gán'} &middot; {asset.location?.name || 'Chưa xác định'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Đóng
          </button>
          <button onClick={print} className="px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Printer size={16} /> In nhãn {format === 'barcode' ? 'Barcode' : format === 'qr' ? 'QR Code' : 'Barcode & QR'}
          </button>
        </div>
      </div>
    </div>
  );
}
