import React, { useState } from "react";
import { Challenge } from "@/api/entities/Challenge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, Plus, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { format, isPast, isFuture } from "date-fns";

export default function ChallengesTab({ challenges, user, onRefresh }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("active");

  const filteredChallenges = challenges.filter(challenge => {
    const now = new Date();
    const start = new Date(challenge.start_date);
    const end = new Date(challenge.end_date);

    if (filter === "active") {
      return now >= start && now <= end;
    } else if (filter === "upcoming") {
      return isFuture(start);
    } else if (filter === "past") {
      return isPast(end);
    }
    return true;
  });

  const joinChallenge = async (challenge) => {
    if (!challenge.participant_emails) {
      challenge.participant_emails = [];
    }
    
    if (!challenge.participant_emails.includes(user.email)) {
      await Challenge.update(challenge.id, {
        participant_emails: [...challenge.participant_emails, user.email]
      });
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        {["active", "upcoming", "past"].map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? "default" : "outline"}
            onClick={() => setFilter(filterType)}
            className={filter === filterType ? "bg-[#8B6F47] hover:bg-[#654321] text-white" : "border-[#8B6F47]/20"}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </Button>
        ))}
      </div>

      {/* Challenges Grid */}
      {filteredChallenges.length === 0 ? (
        <Card className="border-[#8B6F47]/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="w-16 h-16 text-[#8B6F47]/40 mb-4" />
            <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">
              No {filter} challenges
            </h3>
            <p className="text-[#8B6F47] text-center max-w-md">
              Check back later for new photography challenges and competitions
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredChallenges.map((challenge, index) => {
            const isParticipant = challenge.participant_emails?.includes(user.email);
            const submissionCount = challenge.submission_ids?.length || 0;
            const participantCount = challenge.participant_emails?.length || 0;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-[#8B6F47]/20 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-[#C9A961] text-white">
                        {challenge.theme}
                      </Badge>
                      {filter === "active" && (
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          Active
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-[#2C2C2C]">{challenge.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {challenge.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="flex gap-4 text-sm text-[#654321]">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{participantCount} participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        <span>{submissionCount} photos</span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-sm text-[#8B6F47]">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(challenge.start_date), "MMM d")} - {format(new Date(challenge.end_date), "MMM d, yyyy")}
                      </span>
                    </div>

                    {/* Action Button */}
                    {filter === "active" && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isParticipant) {
                            navigate(createPageUrl(`ChallengeDetail?id=${challenge.id}`));
                          } else {
                            joinChallenge(challenge);
                          }
                        }}
                        disabled={isParticipant}
                        variant={isParticipant ? "outline" : "default"}
                        className={isParticipant ? "w-full border-[#8B6F47]/20" : "w-full bg-[#8B6F47] hover:bg-[#654321] text-white"}
                      >
                        {isParticipant ? (
                          <>View Challenge</>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Join Challenge
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}