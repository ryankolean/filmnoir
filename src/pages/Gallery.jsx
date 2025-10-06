import React, { useState, useEffect, useCallback } from "react";
import { Photo } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Grid3x3, Columns } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PhotoGrid from "../components/gallery/PhotoGrid";
import GesturePhotoViewer from "../components/gallery/GesturePhotoViewer";
import ShareModal from "../components/gallery/ShareModal";

export default function GalleryPage() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [sharePhoto, setSharePhoto] = useState(null);
  const [filterValue, setFilterValue] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    loadPhotos();
  }, []);

  const applyFilter = useCallback(() => {
    if (filterValue === "all") {
      setFilteredPhotos(photos);
    } else if (filterValue === "edited") {
      setFilteredPhotos(photos.filter(p => p.edited));
    } else {
      setFilteredPhotos(photos.filter(p => p.filter_applied === filterValue));
    }
  }, [filterValue, photos]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  const loadPhotos = async () => {
    setIsLoading(true);
    const data = await Photo.list("-created_date");
    setPhotos(data);
    setIsLoading(false);
  };

  const handlePhotoClick = (photo) => {
    const index = filteredPhotos.findIndex(p => p.id === photo.id);
    setSelectedPhotoIndex(index);
  };

  const handleEdit = (photo) => {
    navigate(createPageUrl(`Editor?photoId=${photo.id}`));
  };

  const handleShare = (photo) => {
    setSharePhoto(photo);
    setSelectedPhotoIndex(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3] film-grain">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 mb-8"
        >
          {/* View Mode Toggle */}
          <Tabs value={viewMode} onValueChange={setViewMode} className="bg-white rounded-lg border border-[#8B6F47]/20">
            <TabsList className="bg-transparent">
              <TabsTrigger value="grid" className="data-[state=active]:bg-[#8B6F47] data-[state=active]:text-white">
                <Grid3x3 className="w-4 h-4 mr-2" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="masonry" className="data-[state=active]:bg-[#8B6F47] data-[state=active]:text-white">
                <Columns className="w-4 h-4 mr-2" />
                Masonry
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filter */}
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="w-40 bg-white border-[#8B6F47]/20">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Photos</SelectItem>
              <SelectItem value="edited">Edited</SelectItem>
              <SelectItem value="vintage_warm">Vintage Warm</SelectItem>
              <SelectItem value="classic_bw">Classic B&W</SelectItem>
              <SelectItem value="faded_film">Faded Film</SelectItem>
              <SelectItem value="golden_hour">Golden Hour</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Decorative divider */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="h-px bg-gradient-to-r from-transparent via-[#8B6F47] to-transparent mb-8"
        />

        {/* Gallery */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-[#8B6F47] border-t-transparent rounded-full mb-4"
            />
            <p className="text-[#8B6F47] italic">Developing photographs...</p>
          </div>
        ) : (
          <PhotoGrid
            photos={filteredPhotos}
            onPhotoClick={handlePhotoClick}
            onEditClick={handleEdit}
            onShareClick={handleShare}
          />
        )}
      </div>

      {/* Gesture Photo Viewer */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <GesturePhotoViewer
            photos={filteredPhotos}
            initialIndex={selectedPhotoIndex}
            onClose={() => setSelectedPhotoIndex(null)}
            onEdit={handleEdit}
            onShare={handleShare}
          />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <ShareModal
        photo={sharePhoto}
        isOpen={!!sharePhoto}
        onClose={() => setSharePhoto(null)}
      />
    </div>
  );
}