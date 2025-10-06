import React, { useState, useEffect, useCallback } from "react";
import { Group } from "@/api/entities";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Plus, Users as UsersIcon, Calendar, UserPlus, QrCode } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

import GroupCard from "../components/groups/GroupCard";
import CreateGroupModal from "../components/groups/CreateGroupModal";
import JoinGroupModal from "../components/groups/JoinGroupModal";

export default function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createAsEvent, setCreateAsEvent] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadData();
    checkForJoinCode();
  }, []);

  const checkForJoinCode = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    
    if (joinCode) {
      // Auto-open join modal with code
      setShowJoinModal(true);
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const allGroups = await Group.list("-created_at");

      const userGroups = allGroups.filter((group) =>
        group.group_members?.some((member) => member.user_id === currentUser.id)
      );

      setGroups(userGroups);
    } catch (error) {
      console.error("Error loading data:", error);
      setUser(null);
      setGroups([]);
    }
    setIsLoading(false);
  };

  const applyFilter = useCallback(() => {
    if (filterType === "all") {
      setFilteredGroups(groups);
    } else if (filterType === "owned") {
      setFilteredGroups(
        groups.filter((g) =>
          g.group_members?.some((m) => m.user_id === user?.id && m.role === "owner")
        )
      );
    } else {
      setFilteredGroups(groups.filter((g) => g.type === filterType));
    }
  }, [filterType, groups, user]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  const handleGroupClick = (group) => {
    navigate(createPageUrl(`GroupDetail?groupId=${group.id}`));
  };

  const checkAuthAndProceed = async (action) => {
    if (!user) {
      // User not authenticated, redirect to login
      const currentUrl = window.location.href;
      await User.loginWithRedirect(currentUrl);
      return false;
    }
    return true;
  };

  const handleCreateGroup = async () => {
    const isAuth = await checkAuthAndProceed();
    if (!isAuth) return;
    
    setCreateAsEvent(false);
    setShowCreateModal(true);
  };

  const handleCreateEvent = async () => {
    const isAuth = await checkAuthAndProceed();
    if (!isAuth) return;
    
    setCreateAsEvent(true);
    setShowCreateModal(true);
    // Show success message after event is created
    setTimeout(() => {
      setSuccessMessage("Event created successfully with today's date!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 500);
  };

  const handleJoinGroup = async () => {
    const isAuth = await checkAuthAndProceed();
    if (!isAuth) return;
    
    setShowJoinModal(true);
  };

  const handleGroupCreated = () => {
    loadData();
    if (!createAsEvent) {
      setSuccessMessage("Group created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3] film-grain py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#2C2C2C] mb-2">Groups & Events</h1>
            <p className="text-[#8B6F47]">
              Share photos and memories with friends and family
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleCreateGroup}
              className="w-full h-24 bg-white hover:bg-gray-50 border-2 border-[#8B6F47]/20 hover:border-[#8B6F47] text-[#2C2C2C] flex flex-col gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-[#8B6F47]/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-[#8B6F47]" />
              </div>
              <span className="text-lg font-semibold">Create Group</span>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleCreateEvent}
              className="w-full h-24 bg-white hover:bg-gray-50 border-2 border-[#8B6F47]/20 hover:border-[#8B6F47] text-[#2C2C2C] flex flex-col gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-lg font-semibold">Create Event</span>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="md:col-span-2"
          >
            <Button
              onClick={handleJoinGroup}
              className="w-full h-24 bg-white hover:bg-gray-50 border-2 border-[#8B6F47]/20 hover:border-[#8B6F47] text-[#2C2C2C] flex flex-col gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-lg font-semibold">Join Group or Event</span>
            </Button>
          </motion.div>
        </div>

        {/* Filters */}
        {user && (
          <Tabs value={filterType} onValueChange={setFilterType} className="mb-8">
            <TabsList className="bg-white border border-[#8B6F47]/20">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="owned">My Groups</TabsTrigger>
              <TabsTrigger value="event">Events</TabsTrigger>
              <TabsTrigger value="album">Albums</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Groups Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="w-16 h-16 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="w-32 h-32 rounded-full bg-[#8B6F47]/10 flex items-center justify-center mb-6">
              <UsersIcon className="w-16 h-16 text-[#8B6F47]/40" />
            </div>
            <h3 className="text-2xl font-bold text-[#2C2C2C] mb-2">Sign In to View Groups</h3>
            <p className="text-[#8B6F47] max-w-md mb-6">
              Create an account or sign in to start creating and joining groups
            </p>
            <Button
              onClick={() => User.login()}
              className="bg-[#8B6F47] hover:bg-[#654321] text-white"
            >
              Sign In
            </Button>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="w-32 h-32 rounded-full bg-[#8B6F47]/10 flex items-center justify-center mb-6">
              <UsersIcon className="w-16 h-16 text-[#8B6F47]/40" />
            </div>
            <h3 className="text-2xl font-bold text-[#2C2C2C] mb-2">No Groups Yet</h3>
            <p className="text-[#8B6F47] max-w-md mb-6">
              Create your first group or join one to start sharing photos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={() => handleGroupClick(group)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={handleGroupCreated}
        createAsEvent={createAsEvent}
      />

      <JoinGroupModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onGroupJoined={loadData}
      />
    </div>
  );
}