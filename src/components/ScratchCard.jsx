import React, { useState, useRef, useEffect } from 'react';
import { GiftIcon, TrophyIcon } from '@heroicons/react/24/outline';

const ScratchCard = ({ 
  card, 
  onScratch, 
  className = '',
  size = 'normal' // 'small', 'normal', 'large'
}) => {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(card.isScratched || false);

  const sizes = {
    small: { width: 200, height: 120, fontSize: 'text-sm' },
    normal: { width: 280, height: 180, fontSize: 'text-base' },
    large: { width: 350, height: 220, fontSize: 'text-lg' }
  };

  const currentSize = sizes[size];

  useEffect(() => {
    if (!canvasRef.current || isRevealed) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = currentSize.width;
    canvas.height = currentSize.height;

    // Create scratch-off surface
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#c0c0c0');
    gradient.addColorStop(0.5, '#e0e0e0');
    gradient.addColorStop(1, '#c0c0c0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add texture pattern
    ctx.fillStyle = '#d0d0d0';
    for (let i = 0; i < canvas.width; i += 20) {
      for (let j = 0; j < canvas.height; j += 20) {
        if ((i + j) % 40 === 0) {
          ctx.fillRect(i, j, 10, 10);
        }
      }
    }

    // Add scratch text
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText('YOUR DISCOUNT!', canvas.width / 2, canvas.height / 2 + 10);

  }, [currentSize, isRevealed]);

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  };

  const scratch = (x, y) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.fill();

    // Calculate scratch progress
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const pixels = imageData.data;
    let scratchedPixels = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) scratchedPixels++;
    }
    
    const progress = (scratchedPixels / (pixels.length / 4)) * 100;
    setScratchProgress(progress);

    // Auto-reveal when 30% scratched
    if (progress > 30 && !isRevealed) {
      setIsRevealed(true);
      onScratch && onScratch(card);
    }
  };

  const handleMouseDown = (e) => {
    if (isRevealed) return;
    setIsScratching(true);
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  };

  const handleMouseMove = (e) => {
    if (!isScratching || isRevealed) return;
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleTouchStart = (e) => {
    if (isRevealed) return;
    e.preventDefault();
    setIsScratching(true);
    const pos = getTouchPos(e);
    scratch(pos.x, pos.y);
  };

  const handleTouchMove = (e) => {
    if (!isScratching || isRevealed) return;
    e.preventDefault();
    const pos = getTouchPos(e);
    scratch(pos.x, pos.y);
  };

  const handleTouchEnd = () => {
    setIsScratching(false);
  };

  const getCardColor = (percentage) => {
    if (percentage >= 55) return 'from-purple-500 to-pink-500';
    if (percentage >= 45) return 'from-blue-500 to-indigo-500';
    return 'from-green-500 to-emerald-500';
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`relative rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 bg-gradient-to-br ${getCardColor(card.discountPercentage)}`}
        style={{ width: currentSize.width, height: currentSize.height }}
      >
        {/* Background content (revealed when scratched) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
          <div className="text-center">
            <TrophyIcon className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
            <div className={`font-bold ${currentSize.fontSize}`}>
              {card.discountPercentage}% OFF
            </div>
            <div className="text-xs opacity-90 mt-1">
              Your Next Booking
            </div>
            <div className="text-xs opacity-75 mt-2">
              Expires: {new Date(card.expiryDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Scratch surface */}
        {!isRevealed && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
              width: currentSize.width, 
              height: currentSize.height,
              touchAction: 'none'
            }}
          />
        )}

        {/* Scratch progress indicator */}
        {!isRevealed && scratchProgress > 0 && (
          <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white bg-opacity-75 px-2 py-1 rounded">
            {Math.round(scratchProgress)}% revealed
          </div>
        )}

        {/* Revealed badge */}
        {isRevealed && (
          <div className="absolute top-2 right-2">
            <GiftIcon className="w-6 h-6 text-yellow-300" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScratchCard;
