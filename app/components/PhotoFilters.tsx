import { useRef, useEffect, useState } from 'react';
import { createCanvas, loadImage } from 'canvas';
import { BrightnessUp, BrightnessDown, Contrast, Blur, Rotate, Adjustments, Droplet, Crop, Refresh, Download } from 'tabler-icons-react';

interface PhotoFiltersProps {
  photo: string;
  onFilterApplied: (filteredPhoto: string) => void;
}

const PhotoFilters: React.FC<PhotoFiltersProps> = ({ photo, onFilterApplied }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [cropping, setCropping] = useState<boolean>(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [blur, setBlur] = useState<number>(0);
  const [invert, setInvert] = useState<number>(0);
  const [hueRotate, setHueRotate] = useState<number>(0);
  const [saturate, setSaturate] = useState<number>(100);
  const [opacity, setOpacity] = useState<number>(100);

  useEffect(() => {
    if (photo) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        loadImage(photo).then((img) => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          setOriginalPhoto(photo); // Store the original photo
        });
      }
    }
  }, [photo]);

  const applyFilters = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && originalPhoto) {
      loadImage(originalPhoto).then((img) => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.filter = `
          brightness(${brightness}%)
          contrast(${contrast}%)
          blur(${blur}px)
          invert(${invert}%)
          hue-rotate(${hueRotate}deg)
          saturate(${saturate}%)
          opacity(${opacity}%)
        `;
        ctx.drawImage(img, 0, 0);
        onFilterApplied(canvas.toDataURL());
      });
    }
  };

  useEffect(() => {
    applyFilters();
  }, [brightness, contrast, blur, invert, hueRotate, saturate, opacity]);

  const startCropping = () => {
    setCropping(true);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const rect = canvas!.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    if (cropping) {
      setCropStart({ x, y });
      setCropEnd(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const rect = canvas!.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    if (cropping && cropStart) {
      setCropEnd({ x, y });

      // Draw the cropping rectangle
      const ctx = canvas.getContext('2d');
      if (ctx && originalPhoto) {
        loadImage(originalPhoto).then((img) => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          ctx.filter = `
            brightness(${brightness}%)
            contrast(${contrast}%)
            blur(${blur}px)
            invert(${invert}%)
            hue-rotate(${hueRotate}deg)
            saturate(${saturate}%)
            opacity(${opacity}%)
          `;
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.strokeRect(cropStart.x, cropStart.y, x - cropStart.x, y - cropStart.y);
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (cropping && cropStart && cropEnd) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        const { x: startX, y: startY } = cropStart;
        const { x: endX, y: endY } = cropEnd;
        const width = endX - startX;
        const height = endY - startY;
        const imageData = ctx.getImageData(startX, startY, width, height);
        canvas.width = width;
        canvas.height = height;
        ctx.putImageData(imageData, 0, 0);
        onFilterApplied(canvas.toDataURL());
        setCropping(false);
        setCropStart(null);
        setCropEnd(null);
      }
    }
  };

  const resetFilter = (filter: string) => {
    switch (filter) {
      case 'brightness':
        setBrightness(100);
        break;
      case 'contrast':
        setContrast(100);
        break;
      case 'blur':
        setBlur(0);
        break;
      case 'invert':
        setInvert(0);
        break;
      case 'hueRotate':
        setHueRotate(0);
        break;
      case 'saturate':
        setSaturate(100);
        break;
      case 'opacity':
        setOpacity(100);
        break;
      default:
        break;
    }
  };

  const resetAllFilters = () => {
    setBrightness(100);
    setContrast(100);
    setBlur(0);
    setInvert(0);
    setHueRotate(0);
    setSaturate(100);
    setOpacity(100);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL();
      link.download = 'filtered-photo.png';
      link.click();
    }
  };

  return (
    <div className="photo-filters-container">
      <canvas
        ref={canvasRef}
        style={{ maxWidth: '100%' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      ></canvas>
      <div className="toolbar">
        <div className="toolbar-item">
          <button onClick={() => setBrightness((prev) => Math.min(prev + 10, 200))}>
            <BrightnessUp size={48} />
          </button>
          <button onClick={() => setBrightness((prev) => Math.max(prev - 10, 0))}>
            <BrightnessDown size={24} />
          </button>
          <button onClick={() => resetFilter('brightness')}>
            <Refresh size={48} />
          </button>
          <span>Brightness</span>
        </div>
        <div className="toolbar-item">
          <button onClick={() => setContrast((prev) => Math.min(prev + 10, 200))}>
            <Contrast size={48} />
          </button>
          <button onClick={() => setContrast((prev) => Math.max(prev - 10, 0))}>
            <Contrast size={24} />
          </button>
          <button onClick={() => resetFilter('contrast')}>
            <Refresh size={48} />
          </button>
          <span>Contrast</span>
        </div>
        <div className="toolbar-item">
          <button onClick={() => setBlur((prev) => Math.min(prev + 1, 10))}>
            <Blur size={48} />
          </button>
          <button onClick={() => setBlur((prev) => Math.max(prev - 1, 0))}>
            <Blur size={24} />
          </button>
          <button onClick={() => resetFilter('blur')}>
            <Refresh size={48} />
          </button>
          <span>Blur</span>
        </div>
        <div className="toolbar-item">
          <button onClick={() => setHueRotate((prev) => (prev + 10) % 360)}>
            <Rotate size={48} />
          </button>
          <button onClick={() => setHueRotate((prev) => (prev - 10 + 360) % 360)}>
            <Rotate size={24} />
          </button>
          <button onClick={() => resetFilter('hueRotate')}>
            <Refresh size={48} />
          </button>
          <span>Hue Rotate</span>
        </div>
        <div className="toolbar-item">
          <button onClick={() => setSaturate((prev) => Math.min(prev + 10, 200))}>
            <Adjustments size={48} />
          </button>
          <button onClick={() => setSaturate((prev) => Math.max(prev - 10, 0))}>
            <Adjustments size={24} />
          </button>
          <button onClick={() => resetFilter('saturate')}>
            <Refresh size={48} />
          </button>
          <span>Saturate</span>
        </div>
        <div className="toolbar-item">
          <button onClick={() => setOpacity((prev) => Math.min(prev + 10, 100))}>
            <Droplet size={48} />
          </button>
          <button onClick={() => setOpacity((prev) => Math.max(prev - 10, 0))}>
            <Droplet size={24} />
          </button>
          <button onClick={() => resetFilter('opacity')}>
            <Refresh size={48} />
          </button>
          <span>Opacity</span>
        </div>
        <div className="toolbar-item">
          <button onClick={startCropping}>
            <Crop size={48} />
          </button>
          <span>Crop</span>
        </div>
        <div className="toolbar-item">
          <button onClick={resetAllFilters}>
            <Refresh size={48} />
          </button>
          <span>Reset All</span>
        </div>
        <div className="toolbar-item">
          <button onClick={downloadImage}>
            <Download size={48} />
          </button>
          <span>Download</span>
        </div>
      </div>
      <style jsx>{`
        .photo-filters-container {
          background-color: #121212; /* Dark background */
          color: #ffffff; /* Light text color for contrast */
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .toolbar {
          display: flex;
          justify-content: center;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        .toolbar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 10px;
        }
        .toolbar-item > button {
          margin: 5px;
          cursor: pointer;
          border: 2px solid #000; /* Added border to make them look like buttons */
          padding: 10px;
          border-radius: 16px; /* More rounded corners */
          background: linear-gradient(45deg, #ff6ec4, #7873f5); /* Gradient background */
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px; /* Fixed width */
          height: 60px; /* Fixed height */
        }
        .toolbar-item > button .icon-small {
          width: 24px;
          height: 24px;
        }
        .toolbar-item > span {
          margin-top: 5px;
          font-size: 16px; /* Kept legend size the same */
        }
        @media (max-width: 600px) {
          .toolbar-item > button {
            font-size: 40px; /* Adjusted font size for smaller screens */
          }
          .toolbar-item > span {
            font-size: 14px; /* Adjusted legend size for smaller screens */
          }
        }
      `}</style>
    </div>
  );
};

export default PhotoFilters;