import React from "react";
import { Shield, Eye, Download, Droplets, MapPin, Camera } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacySettings({ settings, onSettingChange }) {
  return (
    <div className="space-y-6">
      <Card className="border-[#8B6F47]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2C2C2C]">
            <Shield className="w-5 h-5 text-[#8B6F47]" />
            Default Photo Visibility
          </CardTitle>
          <CardDescription>
            Choose who can see your photos by default
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={settings.default_photo_visibility}
            onValueChange={(value) => onSettingChange("default_photo_visibility", value)}
          >
            <SelectTrigger className="bg-white border-[#8B6F47]/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Private</p>
                    <p className="text-xs text-gray-500">Only you can see</p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="friends_only">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Friends Only</p>
                    <p className="text-xs text-gray-500">Only your friends</p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Public</p>
                    <p className="text-xs text-gray-500">Anyone can see</p>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-[#8B6F47]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2C2C2C]">
            <Droplets className="w-5 h-5 text-[#8B6F47]" />
            Photo Protection
          </CardTitle>
          <CardDescription>
            Control how your photos can be used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="downloads" className="text-[#654321] font-medium">
                Allow Downloads
              </Label>
              <p className="text-sm text-[#8B6F47]">
                Let others download your photos
              </p>
            </div>
            <Switch
              id="downloads"
              checked={settings.allow_downloads}
              onCheckedChange={(checked) => onSettingChange("allow_downloads", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="watermark" className="text-[#654321] font-medium">
                Add Watermark
              </Label>
              <p className="text-sm text-[#8B6F47]">
                Protect photos with your watermark
              </p>
            </div>
            <Switch
              id="watermark"
              checked={settings.watermark_photos}
              onCheckedChange={(checked) => onSettingChange("watermark_photos", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#8B6F47]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2C2C2C]">
            <MapPin className="w-5 h-5 text-[#8B6F47]" />
            Metadata Visibility
          </CardTitle>
          <CardDescription>
            Choose what information to show
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="location" className="text-[#654321] font-medium">
                Show Location
              </Label>
              <p className="text-sm text-[#8B6F47]">
                Display where photos were taken
              </p>
            </div>
            <Switch
              id="location"
              checked={settings.show_location}
              onCheckedChange={(checked) => onSettingChange("show_location", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="camera-settings" className="text-[#654321] font-medium">
                Show Camera Settings
              </Label>
              <p className="text-sm text-[#8B6F47]">
                Display ISO, aperture, and shutter speed
              </p>
            </div>
            <Switch
              id="camera-settings"
              checked={settings.show_camera_settings}
              onCheckedChange={(checked) => onSettingChange("show_camera_settings", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}