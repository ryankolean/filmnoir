import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Link as LinkIcon, Camera, Users, Calendar, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Group } from "@/api/entities";
import { User } from "@/api/entities";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function JoinGroupModal({ isOpen, onClose, onGroupJoined }) {
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [user, setUser] = useState(null);
  const [previewGroup, setPreviewGroup] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };

    const checkUrlForJoinCode = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const joinCodeFromUrl = urlParams.get('join');
      
      if (joinCodeFromUrl) {
        setJoinCode(joinCodeFromUrl);
      }
    };

    if (isOpen) {
      checkAuth();
      checkUrlForJoinCode();
    }
  }, [isOpen]);

  // Auto-process join code when user is authenticated and join code exists
  useEffect(() => {
    if (isOpen && user && joinCode && !showConfirmation && !isJoining) {
      handleJoinByCode({ preventDefault: () => {} });
    }
  }, [user, joinCode, isOpen]);

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    setError("");

    // Check if user is authenticated
    if (!user) {
      // Redirect to login with callback to current page with join code
      const currentUrl = window.location.origin + window.location.pathname + `?join=${encodeURIComponent(joinCode.trim())}`;
      await User.loginWithRedirect(currentUrl);
      return;
    }

    setIsJoining(true);

    try {
      // Extract group ID from code/link
      let groupId = joinCode.trim();
      
      // Handle full URLs
      if (groupId.includes('join=')) {
        const url = new URL(groupId.includes('http') ? groupId : `https://example.com${groupId}`);
        groupId = url.searchParams.get('join');
      }

      // Find the group
      const groups = await Group.list();
      const group = groups.find(g => g.id === groupId);

      if (!group) {
        setError("Invalid group code. Please check and try again.");
        setIsJoining(false);
        return;
      }

      // Check if already a member
      if (group.members?.some(m => m.email === user.email)) {
        setError("You're already a member of this group!");
        setIsJoining(false);
        return;
      }

      // Show confirmation screen
      setPreviewGroup(group);
      setShowConfirmation(true);
      setIsJoining(false);
    } catch (err) {
      setError("Failed to find group. Please try again.");
      console.error("Join error:", err);
      setIsJoining(false);
    }
  };

  const confirmJoin = async () => {
    setIsJoining(true);
    setError("");

    try {
      // Add user to group
      await Group.update(previewGroup.id, {
        members: [
          ...(previewGroup.members || []),
          {
            email: user.email,
            role: "member",
            joined_date: new Date().toISOString()
          }
        ]
      });

      onGroupJoined();
      handleClose();
    } catch (err) {
      setError("Failed to join group. Please try again.");
      console.error("Join error:", err);
    }

    setIsJoining(false);
  };

  const handleClose = () => {
    setJoinCode("");
    setError("");
    setScannerActive(false);
    setPreviewGroup(null);
    setShowConfirmation(false);
    
    // Clear join code from URL
    if (window.location.search.includes('join=')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    onClose();
  };

  const startScanner = () => {
    setScannerActive(true);
  };

  // Show confirmation screen
  if (showConfirmation && previewGroup) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-[#F8F6F3] border-[#8B6F47]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2C2C2C]">
              Join {previewGroup.type === 'event' ? 'Event' : 'Group'}?
            </DialogTitle>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="border-[#8B6F47]/20 mt-4">
            <CardContent className="pt-6">
              {previewGroup.cover_photo && (
                <img
                  src={previewGroup.cover_photo}
                  alt={previewGroup.name}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}
              
              <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">
                {previewGroup.name}
              </h3>

              {previewGroup.description && (
                <p className="text-sm text-[#654321] mb-4">
                  {previewGroup.description}
                </p>
              )}

              <div className="space-y-2 text-sm text-[#654321]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#8B6F47]" />
                  <span>{previewGroup.members?.length || 0} members</span>
                </div>
                
                {previewGroup.photo_ids && previewGroup.photo_ids.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#8B6F47]" />
                    <span>{previewGroup.photo_ids.length} photos</span>
                  </div>
                )}

                {previewGroup.event_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#8B6F47]" />
                    <span>{new Date(previewGroup.event_date).toLocaleDateString()}</span>
                  </div>
                )}

                {previewGroup.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#8B6F47]" />
                    <span>{previewGroup.location}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isJoining}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmJoin}
              disabled={isJoining}
              className="flex-1 bg-[#8B6F47] hover:bg-[#654321] text-white"
            >
              {isJoining ? "Joining..." : `Join ${previewGroup.type === 'event' ? 'Event' : 'Group'}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#F8F6F3] border-[#8B6F47]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C2C2C]">
            Join Group or Event
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!user && (
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              Please sign in to join groups and events
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="code" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-[#8B6F47]/20">
            <TabsTrigger value="code">
              <LinkIcon className="w-4 h-4 mr-2" />
              Enter Code
            </TabsTrigger>
            <TabsTrigger value="scan">
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="space-y-4 mt-4">
            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-[#654321]">
                  Group Code or Link
                </Label>
                <Input
                  id="code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Paste group link or code here"
                  className="bg-white border-[#8B6F47]/20"
                  autoFocus
                />
                <p className="text-xs text-[#8B6F47]">
                  Enter the group code or paste the invitation link
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isJoining || !joinCode.trim()}
                  className="flex-1 bg-[#8B6F47] hover:bg-[#654321] text-white"
                >
                  {isJoining ? "Processing..." : user ? "Continue" : "Sign In to Join"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="scan" className="space-y-4 mt-4">
            <div className="flex flex-col items-center py-8">
              <div className="w-48 h-48 border-4 border-dashed border-[#8B6F47]/40 rounded-lg flex items-center justify-center mb-4">
                {scannerActive ? (
                  <Camera className="w-16 h-16 text-[#8B6F47]/60 animate-pulse" />
                ) : (
                  <QrCode className="w-16 h-16 text-[#8B6F47]/40" />
                )}
              </div>
              <p className="text-center text-[#654321] mb-4">
                {scannerActive 
                  ? "Point camera at QR code to join" 
                  : "Scan a group's QR code to join instantly"}
              </p>
              <Button
                onClick={startScanner}
                className="bg-[#8B6F47] hover:bg-[#654321] text-white"
                disabled={!user}
              >
                <Camera className="w-4 h-4 mr-2" />
                {scannerActive ? "Scanning..." : user ? "Open Camera" : "Sign In to Scan"}
              </Button>
              <p className="text-xs text-[#8B6F47] mt-4 text-center max-w-xs">
                {user 
                  ? "Note: QR scanning requires camera permissions. You can also use the 'Enter Code' tab to paste invitation links."
                  : "Please sign in first to join groups via QR code"}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}