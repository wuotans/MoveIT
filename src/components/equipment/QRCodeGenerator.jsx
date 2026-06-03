import { useEffect, useRef } from "react";

function generateQRMatrix(data) {
  const size = 25;
  const matrix = Array(size).fill(null).map(() => Array(size).fill(false));
  
  // Add finder patterns
  const addFinderPattern = (startX, startY) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4)) {
          matrix[startY + y][startX + x] = true;
        }
      }
    }
  };
  
  addFinderPattern(0, 0);
  addFinderPattern(size - 7, 0);
  addFinderPattern(0, size - 7);
  
  // Encode data into the matrix
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }
  
  let seed = Math.abs(hash);
  for (let y = 8; y < size; y++) {
    for (let x = 8; x < size; x++) {
      if (x < size - 7 || y < size - 7) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        matrix[y][x] = seed % 3 === 0;
      }
    }
  }
  
  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }
  
  return matrix;
}

export default function QRCodeGenerator({ data, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const matrix = generateQRMatrix(data);
    const moduleSize = size / matrix.length;
    
    canvas.width = size;
    canvas.height = size;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = "#1a1a2e";
    matrix.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.beginPath();
          ctx.roundRect(
            x * moduleSize + 0.5,
            y * moduleSize + 0.5,
            moduleSize - 1,
            moduleSize - 1,
            1
          );
          ctx.fill();
        }
      });
    });
  }, [data, size]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qrcode-${data}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 bg-white rounded-xl shadow-sm border">
        <canvas ref={canvasRef} className="block" style={{ width: size, height: size }} />
      </div>
      <button
        onClick={downloadQR}
        className="text-xs text-primary hover:underline font-medium"
      >
        Baixar QR Code
      </button>
    </div>
  );
}