import React from "react";
import { Group } from "@/api/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Calendar, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function GroupsDiscovery({ groups, user, onRefresh }) {
  const joinGroup = async (group) => {
    const newMember = {
      email: user.email,
      role: "member",
      joined_date: new Date().toISOString()
    };

    const updatedMembers = [...(group.members || []), newMember];
    
    await Group.update(group.id, {
      members: updatedMembers
    });
    
    onRefresh();
  };

  if (groups.length === 0) {
    return (
      <Card className="border-[#8B6F47]/20">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="w-16 h-16 text-[#8B6F47]/40 mb-4" />
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">
            No public groups yet
          </h3>
          <p className="text-[#8B6F47] text-center max-w-md">
            Create the first public group and build a community
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group, index) => {
        const isMember = group.members?.some(m => m.email === user.email);
        const memberCount = group.members?.length || 0;
        const photoCount = group.photo_ids?.length || 0;

        return (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-[#8B6F47]/20 hover:shadow-lg transition-shadow h-full">
              {/* Cover Photo */}
              <div className="relative h-32 bg-gradient-to-br from-[#8B6F47]/20 to-[#654321]/20">
                {group.cover_photo ? (
                  <img
                    src={group.cover_photo}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-[#8B6F47]/40" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-[#C9A961] text-white capitalize">
                  {group.type}
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="text-[#2C2C2C]">{group.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {group.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex gap-4 text-sm text-[#654321]">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{memberCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{photoCount} photos</span>
                  </div>
                </div>

                {/* Location/Date */}
                {group.location && (
                  <div className="flex items-center gap-2 text-sm text-[#8B6F47]">
                    <MapPin className="w-4 h-4" />
                    <span>{group.location}</span>
                  </div>
                )}

                {group.event_date && (
                  <div className="flex items-center gap-2 text-sm text-[#8B6F47]">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(group.event_date), "MMM d, yyyy")}</span>
                  </div>
                )}

                {/* Tags */}
                {group.tags && group.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {group.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => joinGroup(group)}
                  disabled={isMember}
                  variant={isMember ? "outline" : "default"}
                  className={isMember ? "w-full border-[#8B6F47]/20" : "w-full bg-[#8B6F47] hover:bg-[#654321] text-white"}
                >
                  {isMember ? (
                    "Already a member"
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Join Group
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}