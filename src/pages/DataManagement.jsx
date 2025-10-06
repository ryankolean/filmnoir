import React, { useState, useEffect } from "react";
import { Photo } from "@/api/entities";
import { Group } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, HardDrive, Image, Users, Package, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function DataManagementPage() {
  const [photos, setPhotos] = useState([]);
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [error, setError] = useState(null);
  const [storageStats, setStorageStats] = useState({
    totalPhotos: 0,
    totalGroups: 0,
    estimatedSize: "Calculating..."
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [photosData, groupsData, userData] = await Promise.all([
        Photo.list(),
        Group.list(),
        User.me()
      ]);

      setPhotos(photosData);
      setGroups(groupsData);
      setUser(userData);

      // Calculate storage stats
      setStorageStats({
        totalPhotos: photosData.length,
        totalGroups: groupsData.length,
        estimatedSize: `${(photosData.length * 0.5).toFixed(1)} MB` // Rough estimate
      });
    } catch (err) {
      setError("Failed to load data. Please refresh the page.");
    }
  };

  const exportAllData = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setError(null);

    try {
      // Create export data object
      const exportData = {
        user: {
          email: user.email,
          full_name: user.full_name,
          bio: user.bio,
          privacy_settings: user.privacy_settings
        },
        photos: photos.map(photo => ({
          id: photo.id,
          image_url: photo.image_url,
          caption: photo.caption,
          filter_applied: photo.filter_applied,
          location: photo.location,
          created_date: photo.created_date,
          camera_settings: photo.camera_settings,
          ai_tags: photo.ai_tags,
          ai_description: photo.ai_description
        })),
        groups: groups.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description,
          type: group.type,
          created_date: group.created_date,
          members: group.members,
          photo_ids: group.photo_ids
        })),
        exported_at: new Date().toISOString()
      };

      setExportProgress(50);

      // Convert to JSON and download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `filmvault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportProgress(100);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 5000);
    } catch (err) {
      setError("Failed to export data. Please try again.");
      console.error("Export error:", err);
    }

    setIsExporting(false);
  };

  const downloadAllPhotos = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setError(null);

    try {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        setExportProgress(Math.round(((i + 1) / photos.length) * 100));

        // Download each photo
        const response = await fetch(photo.image_url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `photo-${photo.id}-${photo.created_date}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 5000);
    } catch (err) {
      setError("Failed to download photos. Please try again.");
      console.error("Download error:", err);
    }

    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3] film-grain py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2C2C2C] mb-2">Data Management</h1>
          <p className="text-[#8B6F47]">Export and manage your FilmVault data</p>
        </div>

        {/* Alerts */}
        {exportComplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Export completed successfully!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Storage Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-[#8B6F47]/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Image className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2C2C2C]">{storageStats.totalPhotos}</p>
                  <p className="text-sm text-[#8B6F47]">Total Photos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#8B6F47]/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2C2C2C]">{storageStats.totalGroups}</p>
                  <p className="text-sm text-[#8B6F47]">Total Groups</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#8B6F47]/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <HardDrive className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2C2C2C]">{storageStats.estimatedSize}</p>
                  <p className="text-sm text-[#8B6F47]">Estimated Size</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Card className="border-[#8B6F47]/20">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#654321]">Exporting data...</p>
                    <p className="text-sm text-[#8B6F47]">{exportProgress}%</p>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Export Options */}
        <div className="space-y-4">
          <Card className="border-[#8B6F47]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#2C2C2C]">
                <Package className="w-5 h-5 text-[#8B6F47]" />
                Export All Data
              </CardTitle>
              <CardDescription>
                Download a complete backup of your account data including photos metadata, groups, and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={exportAllData}
                disabled={isExporting}
                className="w-full bg-[#8B6F47] hover:bg-[#654321] text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data (JSON)
              </Button>
              <p className="text-xs text-[#8B6F47] mt-2">
                Includes photo URLs, captions, filters, groups, and account settings
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#8B6F47]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#2C2C2C]">
                <Image className="w-5 h-5 text-[#8B6F47]" />
                Download All Photos
              </CardTitle>
              <CardDescription>
                Download all your photos as individual image files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={downloadAllPhotos}
                disabled={isExporting || photos.length === 0}
                variant="outline"
                className="w-full border-[#8B6F47]/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All Photos ({photos.length})
              </Button>
              <p className="text-xs text-[#8B6F47] mt-2">
                Each photo will be downloaded separately to your device
              </p>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-[#8B6F47]/20 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <HardDrive className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-[#654321]">
                  <p className="font-medium">About Your Data</p>
                  <ul className="space-y-1 list-disc list-inside text-xs">
                    <li>All photos are securely stored in the cloud</li>
                    <li>Your data is automatically backed up by the platform</li>
                    <li>Export your data anytime for personal backups</li>
                    <li>Photos remain accessible even after export</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}