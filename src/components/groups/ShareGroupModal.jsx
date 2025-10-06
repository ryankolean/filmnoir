import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Link as LinkIcon, Share2, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function ShareGroupModal({ group, isOpen, onClose }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const joinLink = `${window.location.origin}${window.location.pathname}?join=${group?.id}`;

  useEffect(() => {
    if (isOpen && group) {
      // Generate QR code using a simple API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinLink)}&bgcolor=F8F6F3&color=654321`;
      setQrCodeUrl(qrUrl);
    }
  }, [isOpen, group, joinLink]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${group.name}`,
          text: `Join my ${group.type} '${group.name}' on FilmVault!`,
          url: joinLink
        });
      } catch (error) {
        // User cancelled sharing
        console.log("Share cancelled");
      }
    } else {
      copyLink();
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${group.name}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!group) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#F8F6F3] border-[#8B6F47]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C2C2C] text-center">
            Share {group.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* QR Code */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-[#8B6F47]/20">
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              )}
            </div>
            <p className="text-center text-[#654321] mt-4 font-medium">
              Scan to join {group.name}
            </p>
          </motion.div>

          {/* Sharing Buttons */}
          <div className="space-y-3">
            <Button
              onClick={shareNative}
              className="w-full bg-[#8B6F47] hover:bg-[#654321] text-white h-12"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Link
            </Button>

            <Button
              onClick={downloadQRCode}
              variant="outline"
              className="w-full border-[#8B6F47]/20 h-12"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Save QR Code
            </Button>

            <Button
              onClick={copyLink}
              variant="outline"
              className="w-full border-[#8B6F47]/20 h-12"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 mr-2 text-green-600" />
                  <span className="text-green-600">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}