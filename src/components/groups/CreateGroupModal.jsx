import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Group } from "@/api/entities";
import { User } from "@/api/entities";

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated, createAsEvent = false }) {
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Auto-submit for events when modal opens
  useEffect(() => {
    if (isOpen && createAsEvent) {
      handleEventCreation();
    }
  }, [isOpen, createAsEvent]);

  const handleEventCreation = async () => {
    setIsCreating(true);

    try {
      const user = await User.me();
      
      const finalName = `Event - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

      const groupData = {
        name: finalName,
        type: "event",
        privacy: "invite_only",
        members: [
          {
            email: user.email,
            role: "owner",
            joined_date: new Date().toISOString(),
          },
        ],
        photo_ids: [],
        tags: [],
        event_date: new Date().toISOString().split('T')[0]
      };

      await Group.create(groupData);
      onGroupCreated();
      handleClose();
    } catch (error) {
      console.error("Error creating event:", error);
    }

    setIsCreating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const user = await User.me();

      const groupData = {
        name: groupName,
        type: "album",
        privacy: "invite_only",
        members: [
          {
            email: user.email,
            role: "owner",
            joined_date: new Date().toISOString(),
          },
        ],
        photo_ids: [],
        tags: [],
      };

      await Group.create(groupData);
      onGroupCreated();
      handleClose();
    } catch (error) {
      console.error("Error creating group:", error);
    }

    setIsCreating(false);
  };

  const handleClose = () => {
    setGroupName("");
    onClose();
  };

  // Don't show modal content for events (auto-creates)
  if (createAsEvent) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#F8F6F3] border-[#8B6F47]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C2C2C]">
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#654321] text-lg">
              Group Name *
            </Label>
            <Input
              id="name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Summer Vacation 2024"
              required
              autoFocus
              className="bg-white border-[#8B6F47]/20 text-lg h-12"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !groupName.trim()}
              className="bg-[#8B6F47] hover:bg-[#654321] text-white"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}