import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Share2, Heart, Eye, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PhotoGrid({ photos, onPhotoClick, onEditClick, onShareClick }) {
  const [hoveredId, setHoveredId] = useState(null);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-full bg-[#8B6F47]/10 flex items-center justify-center mb-6">
            <Edit className="w-16 h-16 text-[#8B6F47]/40" />
          </div>
          <div className="absolute -top-4 -left-4 w-40 h-40 border-4 border-[#8B6F47]/20 rounded-full border-dashed animate-spin" style={{ animationDuration: "20s" }} />
        </motion.div>
        <h3 className="text-2xl font-bold text-[#2C2C2C] mb-2">No Photos Yet</h3>
        <p className="text-[#8B6F47] max-w-md">
          Start capturing beautiful moments with your vintage camera
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            delay: index * 0.03,
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="relative aspect-square group cursor-pointer"
          onClick={() => onPhotoClick(photo)}
          onMouseEnter={() => setHoveredId(photo.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {/* Polaroid-style frame */}
          <div className="w-full h-full bg-white p-3 rounded-sm shadow-lg hover:shadow-2xl transition-shadow duration-300" style={{ boxShadow: hoveredId === photo.id ? "0 20px 40px rgba(139, 111, 71, 0.3)" : "0 10px 20px rgba(0, 0, 0, 0.1)" }}>
            {/* Photo */}
            <div className="w-full h-[calc(100%-2rem)] overflow-hidden bg-gray-100 relative">
              <img
                src={photo.image_url}
                alt="Photo"
                className="w-full h-full object-cover"
                style={{ 
                  filter: photo.filter_applied !== "none" ? "sepia(0.1)" : "none"
                }}
              />
              
              {/* Film grain overlay */}
              <div 
                className="absolute inset-0 opacity-50 pointer-events-none"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")"
                }}
              />
            </div>

            {/* Caption area (like Polaroid bottom) */}
            <div className="h-8 flex items-center justify-center">
              {photo.ai_tags && photo.ai_tags.length > 0 && (
                <div className="flex items-center gap-1 text-[#8B6F47]">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs font-medium">AI Tagged</span>
                </div>
              )}
            </div>
          </div>

          {/* Hover overlay with vintage fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hoveredId === photo.id ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-t from-[#654321]/90 via-[#8B6F47]/60 to-transparent rounded-sm flex flex-col justify-end p-4 pointer-events-none"
          >
            {/* Actions */}
            <div className="flex items-center justify-between mb-2 pointer-events-auto">
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(photo);
                  }}
                  className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-[#654321] hover:bg-white transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onShareClick(photo);
                  }}
                  className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-[#654321] hover:bg-white transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="flex gap-2">
                {photo.edited && (
                  <Badge className="bg-[#C9A961] text-white text-xs border-none">
                    Edited
                  </Badge>
                )}
                {photo.visibility === "private" && (
                  <Badge className="bg-red-500 text-white text-xs border-none">
                    Private
                  </Badge>
                )}
              </div>
            </div>

            {/* Info */}
            {photo.caption && (
              <p className="text-white text-sm font-medium line-clamp-2 pointer-events-none">
                {photo.caption}
              </p>
            )}
          </motion.div>

          {/* Vintage corner marks */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#8B6F47]" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#8B6F47]" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#8B6F47]" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#8B6F47]" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}