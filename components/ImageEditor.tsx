import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ImageFile } from '../types';

interface ImageEditorProps {
  imageUrl: string;
  onMaskChange: (file: File) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onMaskChange }) => {
  const visualCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null); // In-memory canvas for the mask
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [brushPosition, setBrushPosition] = useState<{ x: number; y: number } | null>(null);
  const lastPosition = useRef<{ x: number, y: number } | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1 / 1');

  const redrawVisualCanvas = useCallback(() => {
    const visualCanvas = visualCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!visualCanvas || !maskCanvas) return;

    const visualCtx = visualCanvas.getContext('2d');
    if (!visualCtx) return;

    // 1. Clear the visual canvas
    visualCtx.clearRect(0, 0, visualCanvas.width, visualCanvas.height);
    
    // 2. Set the composite operation to draw the mask, then color it
    visualCtx.globalCompositeOperation = 'source-over';
    
    // 3. Draw the solid white mask content onto the visual canvas.
    visualCtx.drawImage(maskCanvas, 0, 0);

    // 4. Use 'source-in' composite operation. This means new drawings will only affect
    //    pixels that are already on the canvas (i.e., the white mask we just drew).
    visualCtx.globalCompositeOperation = 'source-in';

    // 5. Fill the entire canvas with the semi-transparent orange color.
    //    Due to 'source-in', this fill will only apply to the mask area.
    visualCtx.fillStyle = 'rgba(252, 98, 0, 0.5)';
    visualCtx.fillRect(0, 0, visualCanvas.width, visualCanvas.height);

    // 6. Reset the composite operation to the default for any other potential drawing operations.
    visualCtx.globalCompositeOperation = 'source-over';
  }, []);

  const resizeCanvas = useCallback(() => {
    const visualCanvas = visualCanvasRef.current;
    const image = imageRef.current;
    if (visualCanvas && image && image.naturalWidth > 0) {
      const { naturalWidth, naturalHeight } = image;

      visualCanvas.width = naturalWidth;
      visualCanvas.height = naturalHeight;

      if (!maskCanvasRef.current) {
        maskCanvasRef.current = document.createElement('canvas');
      }
      maskCanvasRef.current.width = naturalWidth;
      maskCanvasRef.current.height = naturalHeight;
      
      // When the canvas is resized, its content is cleared. We redraw the visual layer.
      // Note: This does not preserve the mask on window resize, which is the existing behavior.
      redrawVisualCanvas();
    }
  }, [redrawVisualCanvas]);

  const handleImageLoad = () => {
    const image = imageRef.current;
    if (image && image.naturalWidth > 0) {
      setAspectRatio(`${image.naturalWidth} / ${image.naturalHeight}`);
      // Use a timeout to allow React to apply the aspect ratio style before we calculate canvas size.
      setTimeout(resizeCanvas, 0);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  const getPointerPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = visualCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Scale pointer coordinates to match canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!maskCtx) return;
    
    const pos = getPointerPos(e);
    lastPosition.current = pos;
    setIsDrawing(true);

    const scaledBrushSize = brushSize * (visualCanvasRef.current!.width / visualCanvasRef.current!.getBoundingClientRect().width);
    
    const drawDot = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, scaledBrushSize / 2, 0, Math.PI * 2);
        ctx.fill();
    };

    // Draw ONLY on mask canvas (solid white)
    maskCtx.fillStyle = 'white';
    drawDot(maskCtx);

    redrawVisualCanvas();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPosition.current = null;
    
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas) {
      // Create a final canvas with a black background and the white mask drawing
      const finalMaskCanvas = document.createElement('canvas');
      finalMaskCanvas.width = maskCanvas.width;
      finalMaskCanvas.height = maskCanvas.height;
      const finalCtx = finalMaskCanvas.getContext('2d');
      if (finalCtx) {
        finalCtx.fillStyle = 'black';
        finalCtx.fillRect(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);
        finalCtx.drawImage(maskCanvas, 0, 0);
      }
      finalMaskCanvas.toBlob(blob => {
        if (blob) {
          const maskFile = new File([blob], "mask.png", { type: 'image/png' });
          onMaskChange(maskFile);
        }
      }, 'image/png');
    }
  };
  
  const drawLine = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosition.current) return;
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!maskCtx) return;

    const currentPos = getPointerPos(e);
    
    const scaledBrushSize = brushSize * (visualCanvasRef.current!.width / visualCanvasRef.current!.getBoundingClientRect().width);
    
    const applyLineStyles = (ctx: CanvasRenderingContext2D) => {
        ctx.lineWidth = scaledBrushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    const drawPath = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.moveTo(lastPosition.current!.x, lastPosition.current!.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
    };
    
    // Draw ONLY on mask canvas (solid white)
    applyLineStyles(maskCtx);
    maskCtx.strokeStyle = 'white';
    drawPath(maskCtx);
    
    lastPosition.current = currentPos;
    redrawVisualCanvas();
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = visualCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setBrushPosition({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
    
    if (isDrawing) {
      drawLine(e);
    }
  };


  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext('2d');

    if (maskCanvas && maskCtx) {
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
    
    redrawVisualCanvas();
    
    const emptyBlob = new Blob([], { type: 'image/png' });
    const emptyFile = new File([emptyBlob], "empty_mask.png", { type: 'image/png' });
    onMaskChange(emptyFile);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div 
        ref={containerRef} 
        className="relative w-full bg-slate-200/50 rounded-lg overflow-hidden"
        style={{ aspectRatio }}
      >
        <img 
            ref={imageRef} 
            src={imageUrl} 
            alt="Imagem para editar" 
            className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" 
            crossOrigin="anonymous"
            onLoad={handleImageLoad}
        />
        <canvas
          ref={visualCanvasRef}
          className="absolute top-0 left-0 w-full h-full cursor-none"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={() => {
            stopDrawing();
            setBrushPosition(null);
          }}
          onMouseMove={handlePointerMove}
          onTouchStart={startDrawing}
          onTouchEnd={() => {
            stopDrawing();
            setBrushPosition(null);
          }}
          onTouchMove={handlePointerMove}
        />
        {brushPosition && !isDrawing && (
            <div
                className="absolute rounded-full border border-white bg-black/40 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{
                    left: `${brushPosition.x}px`,
                    top: `${brushPosition.y}px`,
                    width: `${brushSize}px`,
                    height: `${brushSize}px`,
                }}
            />
        )}
      </div>
       <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg">
        <label htmlFor="brushSize" className="text-slate-700 text-sm font-semibold">Pincel:</label>
        <input 
            type="range" 
            id="brushSize"
            min="10" 
            max="100" 
            value={brushSize}
            onChange={e => setBrushSize(parseInt(e.target.value, 10))}
            className="w-full"
        />
        <button onClick={clearMask} className="text-white text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md font-semibold flex-shrink-0">Limpar</button>
      </div>
    </div>
  );
};

export default ImageEditor;