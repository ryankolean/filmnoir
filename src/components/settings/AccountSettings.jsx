import React, { useState } from "react";
import { User as UserIcon, Mail, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";

export default function AccountSettings({ user, onUpdate }) {
  const [bio, setBio] = useState(user.bio || "");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      await User.updateMyUserData({ profile_picture: file_url });
      onUpdate();
      setMessage({ type: "success", text: "Profile picture updated!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to upload profile picture" });
    }
    setIsUploading(false);
  };

  const handleBioUpdate = async () => {
    try {
      await User.updateMyUserData({ bio });
      onUpdate();
      setMessage({ type: "success", text: "Bio updated!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update bio" });
    }
  };

  const handleLogout = async () => {
    await User.logout();
  };

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-[#8B6F47]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2C2C2C]">
            <UserIcon className="w-5 h-5 text-[#8B6F47]" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your account details and public profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#8B6F47]/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8B6F47] to-[#654321] flex items-center justify-center text-white text-3xl font-bold">
                {user.full_name?.[0] || user.email[0].toUpperCase()}
              </div>
            )}
            <div>
              <Label htmlFor="profile-pic" className="cursor-pointer">
                <div className="px-4 py-2 bg-[#8B6F47] hover:bg-[#654321] text-white rounded-lg text-sm font-medium transition-colors inline-block">
                  {isUploading ? "Uploading..." : "Change Photo"}
                </div>
              </Label>
              <Input
                id="profile-pic"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
                disabled={isUploading}
              />
              <p className="text-xs text-[#8B6F47] mt-2">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#654321]">Full Name</Label>
            <Input value={user.full_name} disabled className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-[#654321]">Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8B6F47]" />
              <Input value={user.email} disabled className="bg-gray-50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-[#654321]">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="resize-none bg-white border-[#8B6F47]/20"
              rows={4}
            />
            <Button
              onClick={handleBioUpdate}
              className="bg-[#8B6F47] hover:bg-[#654321] text-white"
              size="sm"
            >
              Update Bio
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#8B6F47] bg-blue-50 p-3 rounded-lg">
            <Shield className="w-4 h-4" />
            <span>Your account is secured with Google authentication</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#8B6F47]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2C2C2C]">
            Account Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}