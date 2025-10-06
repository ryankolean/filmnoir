
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Photo } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User as UserIcon, Activity, HardDrive, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom"; // Assuming react-router-dom for navigation

import PrivacySettings from "../components/settings/PrivacySettings";
import AccountSettings from "../components/settings/AccountSettings";
import SecurityLog from "../components/settings/SecurityLog";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [privacySettings, setPrivacySettings] = useState({
    default_photo_visibility: "private",
    allow_downloads: false,
    watermark_photos: true,
    show_location: false,
    show_camera_settings: true,
  });
  const [accessLog, setAccessLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState(false);

  const navigate = useNavigate();

  // A simple placeholder for createPageUrl. In a real application,
  // this utility function would likely be imported from a centralized routing module.
  const createPageUrl = (pageName) => {
    switch (pageName) {
      case "DataManagement":
        return "/settings/data-management"; // Example path for the Data Management page
      default:
        return `/${pageName.toLowerCase().replace(/ /g, '-')}`;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const currentUser = await User.me();
    setUser(currentUser);
    
    if (currentUser.privacy_settings) {
      setPrivacySettings(currentUser.privacy_settings);
    }

    // Load access logs from all photos
    const photos = await Photo.list("-created_date");
    const allLogs = photos
      .filter(p => p.access_log && p.access_log.length > 0)
      .flatMap(p => p.access_log)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setAccessLog(allLogs);

    setIsLoading(false);
  };

  const handlePrivacySettingChange = async (key, value) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    
    await User.updateMyUserData({
      privacy_settings: newSettings,
    });

    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F6F3]">
        <div className="w-16 h-16 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F3] film-grain py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2C2C2C] mb-2">Settings</h1>
          <p className="text-[#8B6F47]">Manage your account, privacy, and security</p>
        </div>

        {saveMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Settings saved successfully!
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="privacy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-[#8B6F47]/20">
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="privacy">
            <PrivacySettings
              settings={privacySettings}
              onSettingChange={handlePrivacySettingChange}
            />
          </TabsContent>

          <TabsContent value="account">
            <AccountSettings user={user} onUpdate={loadData} />
          </TabsContent>

          <TabsContent value="activity">
            <SecurityLog accessLog={accessLog} />
          </TabsContent>

          <TabsContent value="data">
            <Card className="border-[#8B6F47]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2C2C2C]">
                  <HardDrive className="w-5 h-5 text-[#8B6F47]" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Export and backup your FilmVault data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate(createPageUrl("DataManagement"))}
                  className="w-full bg-[#8B6F47] hover:bg-[#654321] text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Go to Data Management
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
