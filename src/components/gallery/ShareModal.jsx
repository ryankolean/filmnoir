import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Facebook, Twitter, Instagram, Link as LinkIcon, Mail, MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Photo } from "@/api/entities";

const platforms = [
  { name: "Facebook", icon: Facebook, color: "#1877F2", share: (url) => `https://www.facebook.com/sharer/sharer.php?u=${url}` },
  { name: "Twitter", icon: Twitter, color: "#1DA1F2", share: (url, text) => `https://twitter.com/intent/tweet?url=${url}&text=${text}` },
  { name: "Instagram", icon: Instagram, color: "#E4405F", share: null },
  { name: "Email", icon: Mail, color: "#EA4335", share: (url, text) => `mailto:?subject=Check out this photo&body=${text} ${url}` },
  { name: "WhatsApp", icon: MessageCircle, color: "#25D366", share: (url, text) => `https://wa.me/?text=${text} ${url}` },
];

export default function ShareModal({ photo, isOpen, onClose }) {
  const [caption, setCaption] = useState(photo?.caption || "");
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform) => {
    if (!photo) return;

    const shareUrl = photo.image_url;
    const shareText = encodeURIComponent(caption || "Check out my photo!");

    if (platform.name === "Instagram") {
      alert("Please save the photo and share it directly from the Instagram app");
      return;
    }

    const url = platform.share(shareUrl, shareText);
    if (url) {
      window.open(url, "_blank");

      // Track shared platform
      const sharedPlatforms = photo.shared_platforms || [];
      if (!sharedPlatforms.includes(platform.name)) {
        await Photo.update(photo.id, {
          shared_platforms: [...sharedPlatforms, platform.name],
        });
      }
    }
  };

  const copyLink = async () => {
    if (!photo) return;
    await navigator.clipboard.writeText(photo.image_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateCaption = async () => {
    if (!photo) return;
    await Photo.update(photo.id, { caption });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-[#F8F6F3] border-[#8B6F47]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C2C2C]">Share Your Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Photo Preview */}
          <div className="relative rounded-lg overflow-hidden shadow-lg bg-white p-3">
            <img
              src={photo?.image_url}
              alt="Share preview"
              className="w-full h-48 object-cover rounded"
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#654321]">Add a caption</label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onBlur={updateCaption}
              placeholder="Write something about this photo..."
              className="bg-white border-[#8B6F47]/20 focus:border-[#8B6F47] resize-none"
              rows={3}
            />
          </div>

          {/* Share Platforms */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#654321]">Share to</label>
            <div className="grid grid-cols-5 gap-3">
              {platforms.map((platform) => (
                <motion.button
                  key={platform.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShare(platform)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white hover:shadow-md transition-shadow"
                  style={{ borderLeft: `4px solid ${platform.color}` }}
                >
                  <platform.icon className="w-6 h-6" style={{ color: platform.color }} />
                  <span className="text-xs font-medium text-[#2C2C2C]">{platform.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#654321]">Or copy link</label>
            <div className="flex gap-2">
              <Input
                value={photo?.image_url || ""}
                readOnly
                className="bg-white border-[#8B6F47]/20"
              />
              <Button
                onClick={copyLink}
                className="bg-[#8B6F47] hover:bg-[#654321] text-white"
              >
                {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}