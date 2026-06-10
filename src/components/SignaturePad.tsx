import { useRef, useState, useEffect, MouseEvent, TouchEvent } from 'react';
import { RotateCcw, PenTool } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function SignaturePad({ onSave, onClear, placeholder = "เขียนลายมือชื่อของคุณที่นี่" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawed, setHasDrawed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set display size
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set line styles for signature
    ctx.strokeStyle = '#0284c7'; // Deep sky blue
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Handle HDPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Set signature line styles again after resizing
    ctx.strokeStyle = '#2563eb'; // blue-600
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    // Prevent scrolling on touch devices
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    // Prevent scrolling on touch devices
    if (e.cancelable) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawed(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas && hasDrawed) {
      // Pass the drawn state out
      onSave(canvas.toDataURL());
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawed(false);
    if (onClear) onClear();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative border border-slate-300 rounded-lg overflow-hidden bg-white shadow-inner h-40">
        {!hasDrawed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 select-none text-sm font-light gap-2">
            <PenTool className="w-4 h-4" />
            <span>{placeholder}</span>
          </div>
        )}
        <canvas
          id="signature-canvas"
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          id="clear-sig-btn"
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          ล้างจุดเซ็น
        </button>
      </div>
    </div>
  );
}
