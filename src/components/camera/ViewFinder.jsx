import React from "react";
import { motion } from "framer-motion";

export default function ViewFinder({ videoRef, showGrid, facingMode }) {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)',
        }}
      />

      {/* Golden Ratio Grid Overlay */}
      {showGrid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Vertical Lines - Golden Ratio (38.2% and 61.8%) */}
          <div className="absolute left-[38.2%] top-0 bottom-0 w-[2px] bg-[#C9A961]/60" />
          <div className="absolute left-[61.8%] top-0 bottom-0 w-[2px] bg-[#C9A961]/60" />
          
          {/* Horizontal Lines - Golden Ratio (38.2% and 61.8%) */}
          <div className="absolute top-[38.2%] left-0 right-0 h-[2px] bg-[#C9A961]/60" />
          <div className="absolute top-[61.8%] left-0 right-0 h-[2px] bg-[#C9A961]/60" />

          {/* Golden Ratio Intersection Points */}
          <div className="absolute" style={{ left: '38.2%', top: '38.2%', transform: 'translate(-50%, -50%)' }}>
            <div className="w-3 h-3 rounded-full border-2 border-[#C9A961]/80 bg-[#C9A961]/20" />
          </div>
          <div className="absolute" style={{ left: '61.8%', top: '38.2%', transform: 'translate(-50%, -50%)' }}>
            <div className="w-3 h-3 rounded-full border-2 border-[#C9A961]/80 bg-[#C9A961]/20" />
          </div>
          <div className="absolute" style={{ left: '38.2%', top: '61.8%', transform: 'translate(-50%, -50%)' }}>
            <div className="w-3 h-3 rounded-full border-2 border-[#C9A961]/80 bg-[#C9A961]/20" />
          </div>
          <div className="absolute" style={{ left: '61.8%', top: '61.8%', transform: 'translate(-50%, -50%)' }}>
            <div className="w-3 h-3 rounded-full border-2 border-[#C9A961]/80 bg-[#C9A961]/20" />
          </div>
        </motion.div>
      )}

      {/* Corner Marks */}
      <div className="absolute inset-0 pointer-events-none p-4">
        {[
          "top-0 left-0",
          "top-0 right-0",
          "bottom-0 left-0",
          "bottom-0 right-0",
        ].map((position, i) => (
          <div key={i} className={`absolute ${position} w-8 h-8`}>
            <div className={`absolute ${position.includes('top') ? 'top-0' : 'bottom-0'} ${position.includes('left') ? 'left-0' : 'right-0'} w-6 h-px bg-white/50`} />
            <div className={`absolute ${position.includes('top') ? 'top-0' : 'bottom-0'} ${position.includes('left') ? 'left-0' : 'right-0'} w-px h-6 bg-white/50`} />
          </div>
        ))}
      </div>

      {/* Center Focus Point */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <div className="w-16 h-16 border-2 border-white/50 rounded-full" />
      </motion.div>

      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/40 pointer-events-none" />
    </div>
  );
}