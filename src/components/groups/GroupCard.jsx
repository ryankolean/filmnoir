
import React from "react";
import { motion } from "framer-motion";
import { Users, Calendar, MapPin, Lock, Globe, UserPlus, Share2 } from "lucide-react"; // Added Share2
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Added Button import
import { format } from "date-fns";
import ShareGroupModal from "./ShareGroupModal"; // Assuming ShareGroupModal is in the same directory or adjust path as needed

const typeColors = {
  event: "bg-purple-100 text-purple-800",
  project: "bg-blue-100 text-blue-800",
  collection: "bg-green-100 text-green-800",
  album: "bg-orange-100 text-orange-800",
};

export default function GroupCard({ group, onClick }) {
  const [showShareModal, setShowShareModal] = React.useState(false);
  const memberCount = group.members?.length || 0;
  const photoCount = group.photo_ids?.length || 0;

  const handleShare = (e) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    setShowShareModal(true);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer border border-[#8B6F47]/10"
      >
        {/* Cover Photo */}
        <div className="relative h-48 bg-gradient-to-br from-[#8B6F47]/20 to-[#654321]/20">
          {group.cover_photo ? (
            <img
              src={group.cover_photo}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-16 h-16 text-[#8B6F47]/40" />
            </div>
          )}
          
          {/* Privacy Badge */}
          <div className="absolute top-3 right-3">
            {group.privacy === "private" ? (
              <Badge className="bg-black/60 text-white border-none">
                <Lock className="w-3 h-3 mr-1" />
                Private
              </Badge>
            ) : group.privacy === "invite_only" ? (
              <Badge className="bg-black/60 text-white border-none">
                <UserPlus className="w-3 h-3 mr-1" />
                Invite Only
              </Badge>
            ) : (
              <Badge className="bg-black/60 text-white border-none">
                <Globe className="w-3 h-3 mr-1" />
                Public
              </Badge>
            )}
          </div>

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${typeColors[group.type]} border-none capitalize`}>
              {group.type}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-[#8B6F47] mb-4 line-clamp-2">
              {group.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-3 text-sm text-[#654321]">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{photoCount} {photoCount === 1 ? "photo" : "photos"}</span>
            </div>
            {group.event_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(group.event_date), "MMM d, yyyy")}</span>
              </div>
            )}
            {group.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{group.location}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {group.tags && group.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {group.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {group.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{group.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Share Button */}
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full mt-4 border-[#8B6F47]/20 hover:bg-[#8B6F47]/10"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Group
          </Button>
        </div>
      </motion.div>

      <ShareGroupModal
        group={group}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </>
  );
}
