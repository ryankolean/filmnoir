
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Photo } from "@/api/entities";
import { User } from "@/api/entities"; // Added User import
import { UploadFile } from "@/api/integrations";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import ViewFinder from "../components/camera/ViewFinder";
import CameraControls from "../components/camera/CameraControls";

export default function CameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [flashMode, setFlashMode] = useState(false);
  const [exposure, setExposure] = useState(0);
  const [facingMode, setFacingMode] = useState("environment");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [user, setUser] = useState(null); // Added user state

  // Effect to load user on component mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
      // Optionally, set an error state here to inform the user
    }
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraReady(true);
      setError(null);
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      console.error("Camera error:", err);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !isCameraReady || isCapturing) return;

    setIsCapturing(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Create canvas and capture image
      const canvas = document.createElement("canvas");
      const maxWidth = 1920;
      const maxHeight = 1080;
      
      let width = videoRef.current.videoWidth;
      let height = videoRef.current.videoHeight;

      // Resize if too large
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      // Apply mirror effect if front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(videoRef.current, 0, 0, width, height);

      // Apply exposure adjustment
      if (exposure !== 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const adjust = exposure * 25;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, Math.min(255, data[i] + adjust));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjust));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjust));
        }
        ctx.putImageData(imageData, 0, 0);
      }

      setUploadProgress(30);

      // Convert to blob with compression
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.85)
      );
      
      const file = new File([blob], `photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      setUploadProgress(50);

      // Upload with retry logic
      let uploadAttempts = 0;
      let file_url = null;
      
      while (uploadAttempts < 3 && !file_url) {
        try {
          const result = await UploadFile({ file });
          file_url = result.file_url;
          setUploadProgress(80);
        } catch (uploadError) {
          uploadAttempts++;
          if (uploadAttempts === 3) {
            throw new Error("Failed to upload photo after 3 attempts. Please try again.");
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Get default visibility from user settings
      const userData = await User.me();
      const defaultVisibility = userData?.user_metadata?.privacy_settings?.default_photo_visibility || "private";
      const shouldWatermark = userData?.user_metadata?.privacy_settings?.watermark_photos || false;
      const allowDownload = userData?.user_metadata?.privacy_settings?.allow_downloads || false;

      await Photo.create({
        title: `Photo ${new Date().toLocaleString()}`,
        file_url: file_url,
        thumbnail_url: file_url,
        metadata: {
          filter_applied: "none",
          edited: false,
          visibility: defaultVisibility,
          allow_download: allowDownload,
          has_watermark: shouldWatermark,
          access_log: [],
          camera_settings: {
            iso: "AUTO",
            aperture: "f/2.8",
            shutter_speed: "1/60",
          }
        }
      });

      setUploadProgress(100);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        navigate(createPageUrl("Gallery"));
      }, 1000);
    } catch (err) {
      console.error("Capture error:", err);
      setError(err.message || "Failed to capture photo. Please try again.");
      setUploadProgress(0);
    }

    setIsCapturing(false);
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Camera Viewfinder */}
      <ViewFinder 
        videoRef={videoRef} 
        showGrid={showGrid}
        facingMode={facingMode}
      />

      {/* Camera Controls */}
      {isCameraReady && (
        <CameraControls
          onCapture={capturePhoto}
          onFlip={flipCamera}
          isCapturing={isCapturing}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          flashMode={flashMode}
          onToggleFlash={() => setFlashMode(!flashMode)}
          exposure={exposure}
          onExposureChange={setExposure}
        />
      )}

      {/* Loading State */}
      {!isCameraReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#C9A961] border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Upload Progress */}
      {isCapturing && uploadProgress > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 min-w-64">
            <p className="text-white text-center mb-3">Saving photo...</p>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-[#C9A961]"
              />
            </div>
            <p className="text-white/60 text-center text-sm mt-2">{uploadProgress}%</p>
          </div>
        </div>
      )}

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-50"
          >
            <Alert variant="destructive" className="bg-[#B85450]/90 backdrop-blur-sm border-none">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-white">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-4 left-4 right-4 z-50"
          >
            <Alert className="bg-[#8B6F47]/90 backdrop-blur-sm border-none">
              <CheckCircle className="h-4 w-4 text-white" />
              <AlertDescription className="text-white">Photo captured successfully!</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash Effect */}
      <AnimatePresence>
        {isCapturing && flashMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white pointer-events-none z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
