import React from "react";
import { Shield, Eye, Download, Share2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

const actionIcons = {
  viewed: Eye,
  downloaded: Download,
  shared: Share2,
};

const actionColors = {
  viewed: "text-blue-600 bg-blue-50",
  downloaded: "text-green-600 bg-green-50",
  shared: "text-purple-600 bg-purple-50",
};

export default function SecurityLog({ accessLog }) {
  if (!accessLog || accessLog.length === 0) {
    return (
      <Card className="border-[#8B6F47]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2C2C2C]">
            <Shield className="w-5 h-5 text-[#8B6F47]" />
            Activity Log
          </CardTitle>
          <CardDescription>
            Track who accesses your photos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[#8B6F47]">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No activity recorded yet</p>
            <p className="text-sm mt-1">Photo access will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#8B6F47]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#2C2C2C]">
          <Shield className="w-5 h-5 text-[#8B6F47]" />
          Activity Log
        </CardTitle>
        <CardDescription>
          Recent activity on your photos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {accessLog.slice(0, 10).map((log, index) => {
            const Icon = actionIcons[log.action];
            const colorClass = actionColors[log.action];
            
            return (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#2C2C2C]">
                    {log.user_email}
                  </p>
                  <p className="text-sm text-[#8B6F47] capitalize">
                    {log.action} your photo
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#8B6F47]">
                  <Clock className="w-3 h-3" />
                  {format(new Date(log.timestamp), "MMM d, h:mm a")}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}