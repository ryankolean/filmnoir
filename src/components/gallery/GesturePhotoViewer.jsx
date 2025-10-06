import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Edit, Share2, Download, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AITagging from "../search/AITagging";

export default function GesturePhotoViewer({ photos, initialIndex, onClose, onEdit, onShare }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const rotate = useTransform(x, [-200, 0, 200], [-5, 0, 5]);
  const containerRef = useRef(null);

  const currentPhoto = photos[currentIndex];

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const threshold = 100;

    if (info.offset.x > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      x.set(0);
    } else if (info.offset.x < -threshold && currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      x.set(0);
    } else {
      x.set(0);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex < photos.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, photos.length, onClose]);

  const handleZoomIn = () => setScale(Math.min(scale + 0.5, 3));
  const handleZoomOut = () => setScale(Math.max(scale - 0.5, 1));

  useEffect(() => {
    let startDistance = 0;
    let startScale = 1;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        startDistance = Math.sqrt(dx * dx + dy * dy);
        startScale = scale;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const newScale = (distance / startDistance) * startScale;
        setScale(Math.max(1, Math.min(3, newScale)));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("touchstart", handleTouchStart);
      container.addEventListener("touchmove", handleTouchMove, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [scale]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 overflow-hidden" ref={containerRef}>
        {/* Film grain overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
            opacity: 0.5
          }}
        />
        
        {/* Vignette effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(circle, transparent 0%, transparent 60%, rgba(0,0,0,0.6) 100%)"
        }} />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="text-white">
              <p className="font-medium">
                Photo {currentIndex + 1} of {photos.length}
              </p>
              <p className="text-sm text-white/70">Swipe or use arrow keys to navigate</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="text-white hover:bg-white/10 rounded-full"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="text-white hover:bg-white/10 rounded-full"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(currentPhoto);
              }}
              className="text-white hover:bg-white/10 rounded-full"
            >
              <Edit className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onShare(currentPhoto);
              }}
              className="text-white hover:bg-white/10 rounded-full"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-white hover:bg-white/10 rounded-full"
            >
              <a href={currentPhoto.image_url} download onClick={(e) => e.stopPropagation()}>
                <Download className="w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Photo Area */}
      <div className="relative w-full h-full flex items-center justify-center px-20" onClick={(e) => e.stopPropagation()}>
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12 rounded-full z-20"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        )}

        {currentIndex < photos.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12 rounded-full z-20"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        )}

        {/* Photo with gesture support */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            style={{ x, opacity, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-5xl max-h-[80vh] cursor-grab active:cursor-grabbing"
          >
            {/* Polaroid frame */}
            <div className="bg-white p-4 pb-12 rounded-sm shadow-2xl">
              <motion.img
                src={currentPhoto.image_url}
                alt="Photo"
                className="w-full h-auto max-h-[70vh] object-contain select-none"
                style={{ 
                  scale,
                  filter: currentPhoto.filter_applied !== "none" ? "sepia(0.05)" : "none"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                draggable={false}
              />
              
              {currentPhoto.caption && (
                <div className="mt-4 text-center">
                  <p className="text-[#654321] text-lg" style={{ fontFamily: 'cursive' }}>
                    {currentPhoto.caption}
                  </p>
                </div>
              )}
            </div>

            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-white/70 text-sm"
              >
                {x.get() > 50 ? "← Previous" : x.get() < -50 ? "Next →" : "Swipe to navigate"}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 to-transparent p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <AITagging photo={currentPhoto} />
          </div>
        </div>
      </div>

      {/* Film strip indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {photos.map((_, index) => (
          <motion.button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-[#C9A961] w-8" : "bg-white/40"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </motion.div>
  );
}