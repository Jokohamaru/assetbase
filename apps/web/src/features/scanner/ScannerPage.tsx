import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanLine, Search, Plus, QrCode, AlertTriangle, 
  Check, UserPlus, Laptop, Monitor, Smartphone, 
  Server, ShieldCheck, Wifi, PlugZap, HardDrive, 
  Tablet, Cloud, Database, Headphones, Keyboard, 
  Mouse, Video, Box
} from 'lucide-react';
import { Asset } from '../../types';
import { BarcodePrintModal } from './BarcodePrintModal';
import { apiClient as api } from '../../lib/api-client';

const iconForCategory = (categoryName: string) => {
  const icons: Record<string, typeof Laptop> = { 
    'Laptop': Laptop, 'PC / Desktop': Monitor, 'Màn hình': Monitor, 
    'Mobile': Smartphone, 'Tablet': Tablet, 'Server': Server, 
    'Switch': Server, 'Firewall': ShieldCheck, 'Router / Wi-Fi': Wifi, 
    'UPS': PlugZap, 'NAS / Storage': HardDrive, 
    'Phần mềm & Bản quyền': Cloud, 'Tài sản số & Dữ liệu': Database, 
    'Thiết bị BYOD': Smartphone, 'Tai nghe': Headphones, 
    'Bàn phím': Keyboard, 'Chuột': Mouse, 'Webcam': Video
  };
  const Icon = icons[categoryName] || Box;
  return <Icon size={24} />;
};

export function ScannerPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<Asset | null>(null);
  const [message, setMessage] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const stopCamera = () => { 
    if (timerRef.current) window.clearInterval(timerRef.current); 
    timerRef.current = undefined; 
    streamRef.current?.getTracks().forEach(track => track.stop()); 
    streamRef.current = null; 
    setCameraActive(false); 
  };

  const lookup = async (value: string) => {
    if (!value.trim()) { 
      setMessage('Vui lòng quét hoặc nhập mã tài sản / serial.'); 
      return; 
    }
    setLookingUp(true); 
    setMessage('');
    
    try {
      const response = await api.get(`/assets`, { params: { search: value.trim() } });
      const found = response.data.data.items?.[0];
      
      if (!found || (found.assetTag !== value && found.serialNumber !== value && found.barcode !== value)) {
        setResult(null);
        setMessage('Không tìm thấy tài sản phù hợp.');
      } else {
        setResult(found);
        setMessage(`Đã nhận diện \${found.assetTag} từ dữ liệu tài sản.`);
      }
    } catch (error) {
      setResult(null);
      setMessage('Lỗi khi tra cứu tài sản.');
    } finally { 
      setLookingUp(false); 
    }
  };

  const startCamera = async () => { 
    try { 
      stopCamera(); 
      const Detector = (window as any).BarcodeDetector; 
      if (!Detector) { 
        setMessage('Trình duyệt chưa hỗ trợ quét camera. Bạn có thể dùng máy quét USB hoặc nhập mã.'); 
        return; 
      } 
      const supported: string[] = Detector.getSupportedFormats ? await Detector.getSupportedFormats() : ['code_128', 'qr_code']; 
      const formats = ['code_128', 'qr_code'].filter(format => supported.includes(format)); 
      if (!formats.length) { 
        setMessage('Trình duyệt không hỗ trợ CODE128 hoặc QR qua camera. Hãy dùng máy quét USB hoặc nhập mã.'); 
        return; 
      } 
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); 
      streamRef.current = stream; 
      setCameraActive(true); 
      
      if (videoRef.current) { 
        videoRef.current.srcObject = stream; 
        await videoRef.current.play(); 
      } 
      
      const detector = new Detector({ formats }); 
      let detecting = false; 
      
      timerRef.current = window.setInterval(async () => { 
        if (!videoRef.current || detecting) return; 
        detecting = true; 
        try { 
          const codes = await detector.detect(videoRef.current); 
          if (codes[0]?.rawValue) { 
            const value = codes[0].rawValue; 
            setCode(value); 
            stopCamera(); 
            await lookup(value); 
          } 
        } catch { 
          stopCamera(); 
          setMessage('Camera không thể giải mã hình ảnh. Hãy thử lại hoặc nhập mã thủ công.'); 
        } finally { 
          detecting = false;
        } 
      }, 500); 
    } catch { 
      stopCamera(); 
      setMessage('Không thể mở camera. Vui lòng cấp quyền hoặc nhập mã thủ công.'); 
    } 
  };

  useEffect(() => {
    return () => { 
      if (timerRef.current) window.clearInterval(timerRef.current); 
      streamRef.current?.getTracks().forEach(track => track.stop()); 
    };
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Barcode / Scanner</h1>
          <p className="text-sm text-gray-500 mt-1">Quét Barcode hoặc QR để tra cứu tài sản và lập hồ sơ.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Panel */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mb-4">
            <QrCode size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Quét Barcode / QR</h2>
          <p className="text-sm text-gray-500 text-center mb-6 max-w-sm">
            Đưa Barcode hoặc QR Code vào camera, dùng máy quét USB hoặc nhập mã thủ công.
          </p>
          
          <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6 flex items-center justify-center border-2 border-gray-200">
            {cameraActive ? (
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
            ) : (
              <div className="text-gray-500 flex flex-col items-center">
                <ScanLine size={48} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">Camera đang tắt</span>
              </div>
            )}
            
            {cameraActive && (
              <div className="absolute inset-0 border-4 border-indigo-500/50 rounded-xl pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
              </div>
            )}
          </div>

          <div className="w-full flex flex-col gap-4">
            <button 
              onClick={cameraActive ? stopCamera : startCamera}
              className={`w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors \${
                cameraActive 
                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <ScanLine size={18} /> {cameraActive ? 'Tắt camera' : 'Mở camera quét mã'}
            </button>
            
            <form onSubmit={e => { e.preventDefault(); void lookup(code); }} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Nhập mã tài sản, Barcode, hoặc serial"
                className="block w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
              />
              <button 
                type="submit" 
                disabled={lookingUp || !code.trim()}
                className="absolute inset-y-1.5 right-1.5 px-3 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lookingUp ? 'Tra cứu...' : 'Tìm kiếm'}
              </button>
            </form>
          </div>
          
          {message && (
            <div className={`mt-4 p-3 w-full rounded-lg text-sm flex items-start gap-2 \${result ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
              {result ? <Check size={18} className="shrink-0" /> : <AlertTriangle size={18} className="shrink-0" />}
              <span>{message}</span>
            </div>
          )}
        </div>

        {/* Result Panel */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {result ? (
            <div className="h-full flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
                    {iconForCategory(result.category?.name || '')}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{result.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-gray-600">{result.assetTag}</span>
                      {result.serialNumber && <span className="text-sm text-gray-400">&bull; SN: {result.serialNumber}</span>}
                    </div>
                  </div>
                </div>
                
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border \${
                  result.status?.code === 'IN_USE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                  result.status?.code === 'READY' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  result.status?.code === 'MAINTENANCE' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 \${
                    result.status?.code === 'IN_USE' ? 'bg-emerald-500' :
                    result.status?.code === 'READY' ? 'bg-blue-500' :
                    result.status?.code === 'MAINTENANCE' ? 'bg-amber-500' :
                    'bg-gray-500'
                  }`}></span>
                  {result.status?.name || 'Chưa xác định'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-y border-gray-100 py-6 mb-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Loại tài sản</p>
                  <p className="font-medium text-gray-900">{result.category?.name || 'Khác'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Người đang sử dụng</p>
                  <p className="font-medium text-gray-900">{result.currentCustodian?.fullName || 'Chưa gán'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Đơn vị quản lý</p>
                  <p className="font-medium text-gray-900">{result.department?.name || 'Chưa gán'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Vị trí hiện tại</p>
                  <p className="font-medium text-gray-900">{result.location?.name || 'Chưa xác định'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Cấu hình / Thông tin</p>
                  <p className="font-medium text-gray-900">-</p>
                </div>
              </div>
              
              <div className="mt-auto flex gap-3">
                <button 
                  onClick={() => setPrintModalOpen(true)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode size={16} /> In nhãn
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa quét tài sản</h3>
              <p className="text-sm text-gray-500 max-w-[250px]">
                Thông tin chi tiết của tài sản sẽ hiển thị tại đây sau khi quét mã vạch hoặc mã QR.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {printModalOpen && result && (
        <BarcodePrintModal asset={result} onClose={() => setPrintModalOpen(false)} />
      )}
    </div>
  );
}
