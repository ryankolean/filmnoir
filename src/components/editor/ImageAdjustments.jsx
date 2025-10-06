import React from "react";
import { Sun, Contrast as ContrastIcon, Droplet, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function ImageAdjustments({ adjustments, onAdjustmentChange }) {
  const controls = [
    { id: "brightness", label: "Brightness", icon: Sun, min: 0.5, max: 1.5, step: 0.05 },
    { id: "contrast", label: "Contrast", icon: ContrastIcon, min: 0.5, max: 1.5, step: 0.05 },
    { id: "saturation", label: "Saturation", icon: Droplet, min: 0, max: 2, step: 0.1 },
    { id: "grain", label: "Film Grain", icon: Sparkles, min: 0, max: 1, step: 0.1 },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#2C2C2C]">Adjustments</h3>
      
      {controls.map((control) => (
        <div key={control.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <control.icon className="w-4 h-4 text-[#8B6F47]" />
              <label className="text-sm font-medium text-[#654321]">{control.label}</label>
            </div>
            <span className="text-sm text-[#8B6F47] font-mono">
              {adjustments[control.id].toFixed(2)}
            </span>
          </div>
          <Slider
            value={[adjustments[control.id]]}
            onValueChange={([value]) => onAdjustmentChange(control.id, value)}
            min={control.min}
            max={control.max}
            step={control.step}
            className="[&_[role=slider]]:bg-[#8B6F47] [&_[role=slider]]:border-[#654321]"
          />
        </div>
      ))}
    </div>
  );
}