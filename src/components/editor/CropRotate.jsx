import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crop, RotateCw, RotateCcw, Maximize2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function CropRotate({ onRotate, onCrop, rotation, setRotation }) {
  const [aspectRatio, setAspectRatio] = useState("free");

  const aspectRatios = [
    { id: "free", name: "Free", ratio: null },
    { id: "1:1", name: "1:1", ratio: 1 },
    { id: "4:3", name: "4:3", ratio: 4/3 },
    { id: "16:9", name: "16:9", ratio: 16/9 },
    { id: "3:2", name: "3:2", ratio: 3/2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">Transform</h3>
        
        {/* Rotation Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-[#654321]">Rotation</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation((rotation - 90) % 360)}
              className="flex-1 border-[#8B6F47]/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              -90°
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation((rotation + 90) % 360)}
              className="flex-1 border-[#8B6F47]/20"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              +90°
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Slider
              value={[rotation]}
              onValueChange={([value]) => setRotation(value)}
              min={-180}
              max={180}
              step={1}
              className="flex-1 [&_[role=slider]]:bg-[#8B6F47]"
            />
            <span className="text-sm text-[#8B6F47] font-mono w-12">
              {rotation}°
            </span>
          </div>
        </div>
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-[#654321]">Aspect Ratio</Label>
        <div className="grid grid-cols-5 gap-2">
          {aspectRatios.map((ratio) => (
            <Button
              key={ratio.id}
              variant={aspectRatio === ratio.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAspectRatio(ratio.id);
                if (ratio.ratio) {
                  onCrop(ratio.ratio);
                }
              }}
              className={aspectRatio === ratio.id ? "bg-[#8B6F47] hover:bg-[#654321] text-white" : "border-[#8B6F47]/20"}
            >
              {ratio.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRotation(0)}
          className="w-full border-[#8B6F47]/20"
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Reset Rotation
        </Button>
      </div>
    </div>
  );
}