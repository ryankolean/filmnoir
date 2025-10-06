import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Circle, RotateCw, Grid3x3, Zap, ZapOff, Sun, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CameraControls({ 
  onCapture, 
  onFlip, 
  isCapturing,
  showGrid,
  onToggleGrid,
  flashMode,
  onToggleFlash,
  exposure,
  onExposureChange
}) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pb-8">
      {/* Settings Panel - Slides up when active */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-6 px-4"
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 space-y-4">
              {/* Grid Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleGrid}
                className={`w-full p-3 rounded-lg transition-all duration-300 flex items-center justify-between ${
                  showGrid 
                    ? "bg-[#C9A961] text-white shadow-lg" 
                    : "bg-white/20 text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Grid3x3 className="w-5 h-5" />
                  <span className="font-medium">Grid Overlay</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  showGrid ? "bg-white/30" : "bg-white/10"
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform m-0.5 ${
                    showGrid ? "translate-x-6" : "translate-x-0"
                  }`} />
                </div>
              </motion.button>

              {/* Flash Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleFlash}
                className={`w-full p-3 rounded-lg transition-all duration-300 flex items-center justify-between ${
                  flashMode 
                    ? "bg-[#C9A961] text-white shadow-lg" 
                    : "bg-white/20 text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  {flashMode ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
                  <span className="font-medium">Flash</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  flashMode ? "bg-white/30" : "bg-white/10"
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform m-0.5 ${
                    flashMode ? "translate-x-6" : "translate-x-0"
                  }`} />
                </div>
              </motion.button>

              {/* Exposure Control */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">Exposure</span>
                  </div>
                  <span className="text-white text-sm font-mono">{exposure > 0 ? '+' : ''}{exposure}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.5"
                  value={exposure}
                  onChange={(e) => onExposureChange(parseFloat(e.target.value))}
                  className="w-full h-2 accent-[#C9A961] cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #654321 0%, #C9A961 ${((exposure + 2) / 4) * 100}%, rgba(255,255,255,0.3) ${((exposure + 2) / 4) * 100}%)`
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Controls */}
      <div className="flex items-center justify-between px-8">
        {/* Settings Button - Left side */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(!showSettings)}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg border-2 transition-all ${
            showSettings 
              ? "bg-[#C9A961] border-[#C9A961]" 
              : "bg-white/20 backdrop-blur-sm border-white/30"
          }`}
        >
          <Settings className="w-6 h-6" />
        </motion.button>

        {/* Capture Button - Vintage film advance style */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={onCapture}
          disabled={isCapturing}
          className="relative group"
        >
          {/* Outer ring */}
          <div className="w-24 h-24 rounded-full border-[6px] border-white/90 flex items-center justify-center shadow-2xl backdrop-blur-sm bg-white/10">
            {/* Inner button */}
            <motion.div
              animate={{ 
                scale: isCapturing ? 0.7 : 1,
                backgroundColor: isCapturing ? "#C9A961" : "#ffffff"
              }}
              transition={{ duration: 0.2 }}
              className="w-20 h-20 rounded-full shadow-inner"
            />
            
            {/* Decorative notches (like film advance) */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <div
                key={angle}
                className="absolute w-1 h-3 bg-white/50 rounded-full"
                style={{
                  transform: `rotate(${angle}deg) translateY(-42px)`,
                  transformOrigin: 'center'
                }}
              />
            ))}
          </div>

          {/* Flash effect */}
          {isCapturing && (
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-full border-4 border-white"
            />
          )}
        </motion.button>

        {/* Flip Camera Button - Right side (mirrors settings button) */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={onFlip}
          transition={{ duration: 0.3 }}
          className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg border-2 border-white/30"
        >
          <RotateCw className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Film Counter - Vintage style */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-6"
      >
        <div className="inline-block bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
          <p className="text-white/90 text-xs font-mono tracking-widest">FRAME 01 / 36</p>
        </div>
      </motion.div>
    </div>
  );
}