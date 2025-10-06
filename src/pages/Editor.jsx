import React, { useState, useEffect, useRef } from "react";
import { Photo } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const filters = [
  { id: "none", name: "Original", effect: "" },
  { id: "polaroid", name: "Polaroid Classic", effect: "contrast(1.1) brightness(1.1) saturate(0.9) sepia(0.1)" },
  { id: "kodak_gold", name: "Kodak Gold", effect: "saturate(1.3) brightness(1.05) contrast(1.1) hue-rotate(-5deg)" },
  { id: "fuji_velvia", name: "Fuji Velvia", effect: "saturate(1.6) contrast(1.2) brightness(1.02)" },
  { id: "vintage_sepia", name: "Vintage Sepia", effect: "sepia(0.6) contrast(1.1) brightness(1.05)" },
  { id: "bw_film", name: "Black & White Film", effect: "grayscale(1) contrast(1.2) brightness(1.05)" },
  { id: "lomography", name: "Lomography", effect: "saturate(1.5) contrast(1.3) brightness(0.95) hue-rotate(5deg)" },
  { id: "retro_warm", name: "Retro Warm", effect: "sepia(0.3) saturate(1.2) brightness(1.08) contrast(1.1)" },
  { id: "cool_film", name: "Cool Film", effect: "saturate(0.9) brightness(1.05) contrast(1.15) hue-rotate(10deg)" },
  { id: "high_contrast", name: "High Contrast", effect: "contrast(1.4) saturate(1.1) brightness(0.98)" },
];

export default function EditorPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const photoId = urlParams.get("photoId");
    if (photoId) {
      loadPhoto(photoId);
    }
  }, []);

  const loadPhoto = async (photoId) => {
    const data = await Photo.list();
    const foundPhoto = data.find((p) => p.id === photoId);
    if (foundPhoto) {
      setPhoto(foundPhoto);
      if (foundPhoto.filter_applied && foundPhoto.filter_applied !== "none") {
        const filter = filters.find((f) => f.id === foundPhoto.filter_applied);
        if (filter) setSelectedFilter(filter);
      }
    }
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const saveEditedPhoto = async () => {
    if (!photo || !canvasRef.current) return;

    setIsSaving(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = photo.image_url;
      });

      canvas.width = img.width;
      canvas.height = img.height;

      // Apply filter
      ctx.filter = selectedFilter.effect || "none";
      ctx.drawImage(img, 0, 0);
      ctx.filter = "none";

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.95)
      );
      const file = new File([blob], `edited-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const { file_url } = await UploadFile({ file });

      await Photo.update(photo.id, {
        image_url: file_url,
        thumbnail_url: file_url,
        filter_applied: selectedFilter.id,
        edited: true,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl("Gallery"));
      }, 1500);
    } catch (error) {
      console.error("Error saving photo:", error);
    }

    setIsSaving(false);
  };

  if (!photo) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F6F3]">
        <div className="w-16 h-16 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F3] film-grain flex flex-col">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#8B6F47]/20 px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Gallery"))}
          className="text-[#654321] hover:bg-[#8B6F47]/10"
        >
          <X className="w-5 h-5 mr-2" />
          Cancel
        </Button>

        <h1 className="text-lg font-bold text-[#2C2C2C]">Edit Photo</h1>

        <Button
          onClick={saveEditedPhoto}
          disabled={isSaving}
          className="bg-[#8B6F47] hover:bg-[#654321] text-white"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </div>

      {/* Success Alert */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-16 left-4 right-4 z-50"
          >
            <Alert className="bg-[#8B6F47]/90 backdrop-blur-sm border-none shadow-lg">
              <CheckCircle className="h-4 w-4 text-white" />
              <AlertDescription className="text-white font-medium">
                Photo saved with {selectedFilter.name} filter!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Preview - Takes up most of the screen */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <motion.div
          key={selectedFilter.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-4xl max-h-[70vh] w-full"
        >
          {/* Polaroid frame */}
          <div className="bg-white p-4 pb-12 rounded-sm shadow-2xl">
            <img
              src={photo.image_url}
              alt="Preview"
              className="w-full h-auto max-h-[60vh] object-contain select-none"
              style={{ filter: selectedFilter.effect || "none" }}
            />
            
            {/* Filter name caption */}
            <div className="mt-4 text-center">
              <p className="text-[#654321] text-lg font-medium" style={{ fontFamily: 'cursive' }}>
                {selectedFilter.name}
              </p>
            </div>
          </div>

          {/* Vintage corner decorations */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#8B6F47]" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#8B6F47]" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#8B6F47]" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#8B6F47]" />
          </div>
        </motion.div>
      </div>

      {/* Swipeable Filter Gallery */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-[#8B6F47]/20 pb-safe">
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-[#654321] mb-3">Film Filters</p>
          
          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 scroll-smooth hide-scrollbar"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterSelect(filter)}
                className="flex-shrink-0 scroll-snap-align-start"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className={`relative w-20 h-20 rounded-lg overflow-hidden shadow-md transition-all ${
                  selectedFilter.id === filter.id 
                    ? "ring-4 ring-[#8B6F47] scale-105" 
                    : "ring-1 ring-[#8B6F47]/20"
                }`}>
                  <img
                    src={photo.image_url}
                    alt={filter.name}
                    className="w-full h-full object-cover"
                    style={{ filter: filter.effect }}
                  />
                  
                  {selectedFilter.id === filter.id && (
                    <div className="absolute inset-0 bg-[#8B6F47]/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-[#8B6F47]" />
                      </div>
                    </div>
                  )}
                </div>
                <p className={`text-xs mt-1.5 text-center font-medium transition-colors ${
                  selectedFilter.id === filter.id ? "text-[#8B6F47]" : "text-[#654321]/60"
                }`}>
                  {filter.name}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}