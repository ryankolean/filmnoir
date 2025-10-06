
import React from "react";
import { motion } from "framer-motion";
import { X, Edit, Share2, Download, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import AITagging from "../search/AITagging";

export default function PhotoDetail({ photo, onClose, onEdit, onShare }) {
  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="max-w-6xl w-full grid lg:grid-cols-3 gap-6" onClick={(e) => e.stopPropagation()}>
        {/* Image and Main Info - Left Side */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(photo)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare(photo)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <a href={photo.image_url} download>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          </div>

          {/* Image */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative rounded-lg overflow-hidden shadow-2xl bg-white p-4"
          >
            <img
              src={photo.image_url}
              alt="Photo"
              className="w-full h-auto max-h-[70vh] object-contain rounded"
            />
          </motion.div>

          {/* Caption */}
          {photo.caption && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white">{photo.caption}</p>
            </div>
          )}
        </div>

        {/* AI Tags and Details - Right Side */}
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          {/* AI Tagging */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <AITagging photo={photo} />
          </div>

          {/* Details */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-white/60 text-sm mb-3">Photo Details</p>
            <div className="space-y-3 text-white text-sm">
              <div>
                <span className="text-white/60">Date:</span>
                <p>{format(new Date(photo.created_date), "MMMM d, yyyy 'at' h:mm a")}</p>
              </div>
              {photo.location && (
                <div>
                  <span className="text-white/60">Location:</span>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {photo.location}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Camera Settings */}
          {photo.camera_settings && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white/60 text-sm mb-2">Camera Settings</p>
              <div className="space-y-1 text-white text-sm font-mono">
                <p>ISO: {photo.camera_settings.iso}</p>
                <p>Aperture: {photo.camera_settings.aperture}</p>
                <p>Shutter: {photo.camera_settings.shutter_speed}</p>
              </div>
            </div>
          )}

          {/* Filter Applied */}
          {photo.filter_applied && photo.filter_applied !== "none" && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white/60 text-sm mb-1">Filter Applied</p>
              <p className="text-white capitalize">{photo.filter_applied.replace(/_/g, " ")}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
