import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const filters = [
  { id: "none", name: "Original", effect: "" },
  { id: "vintage_warm", name: "Vintage Warm", effect: "sepia(0.3) contrast(1.1) brightness(1.05)" },
  { id: "classic_bw", name: "Classic B&W", effect: "grayscale(1) contrast(1.2)" },
  { id: "faded_film", name: "Faded Film", effect: "contrast(0.85) brightness(1.1) saturate(0.7)" },
  { id: "golden_hour", name: "Golden Hour", effect: "sepia(0.2) saturate(1.3) brightness(1.1)" },
  { id: "kodachrome", name: "Kodachrome", effect: "saturate(1.5) contrast(1.2) hue-rotate(-5deg)" },
  { id: "polaroid", name: "Polaroid", effect: "contrast(1.1) brightness(1.1) saturate(0.9)" },
  { id: "cinestill", name: "Cinestill", effect: "saturate(1.2) contrast(1.15) brightness(1.05) hue-rotate(5deg)" },
  { id: "cross_process", name: "Cross Process", effect: "saturate(1.4) contrast(1.3) hue-rotate(10deg)" },
  { id: "bleach_bypass", name: "Bleach Bypass", effect: "saturate(0.7) contrast(1.4)" },
  { id: "push_process", name: "Push Process", effect: "contrast(1.3) brightness(0.95) saturate(1.1)" },
  { id: "velvia", name: "Velvia", effect: "saturate(1.6) contrast(1.2)" },
];

export default function FilterPreview({ imageUrl, selectedFilter, onFilterSelect }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#2C2C2C]">Film Filters</h3>
      
      <div className="h-[400px] overflow-y-auto pr-4">
        <div className="grid grid-cols-3 gap-3">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterSelect(filter)}
              className={`relative aspect-square rounded-lg overflow-hidden shadow-md ${
                selectedFilter.id === filter.id ? "ring-4 ring-[#8B6F47]" : ""
              }`}
            >
              <img
                src={imageUrl}
                alt={filter.name}
                className="w-full h-full object-cover"
                style={{ filter: filter.effect }}
              />
              
              {selectedFilter.id === filter.id && (
                <div className="absolute inset-0 bg-[#8B6F47]/30 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <Check className="w-5 h-5 text-[#8B6F47]" />
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-xs font-medium text-center">{filter.name}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}