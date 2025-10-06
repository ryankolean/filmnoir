import React from "react";
import { Sun, Contrast as ContrastIcon, Droplet, Sparkles, Aperture, Focus, Maximize } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdvancedAdjustments({ adjustments, onAdjustmentChange }) {
  const basicControls = [
    { id: "brightness", label: "Brightness", icon: Sun, min: 0.5, max: 1.5, step: 0.05, default: 1 },
    { id: "contrast", label: "Contrast", icon: ContrastIcon, min: 0.5, max: 1.5, step: 0.05, default: 1 },
    { id: "saturation", label: "Saturation", icon: Droplet, min: 0, max: 2, step: 0.1, default: 1 },
  ];

  const advancedControls = [
    { id: "highlights", label: "Highlights", icon: Sun, min: -100, max: 100, step: 5, default: 0 },
    { id: "shadows", label: "Shadows", icon: Sun, min: -100, max: 100, step: 5, default: 0 },
    { id: "temperature", label: "Temperature", icon: Sun, min: -100, max: 100, step: 5, default: 0 },
    { id: "tint", label: "Tint", icon: Droplet, min: -100, max: 100, step: 5, default: 0 },
    { id: "vibrance", label: "Vibrance", icon: Droplet, min: -100, max: 100, step: 5, default: 0 },
    { id: "clarity", label: "Clarity", icon: Focus, min: -100, max: 100, step: 5, default: 0 },
  ];

  const effectControls = [
    { id: "grain", label: "Film Grain", icon: Sparkles, min: 0, max: 1, step: 0.1, default: 0 },
    { id: "vignette", label: "Vignette", icon: Aperture, min: 0, max: 1, step: 0.1, default: 0 },
    { id: "sharpen", label: "Sharpen", icon: Focus, min: 0, max: 1, step: 0.1, default: 0 },
    { id: "blur", label: "Blur", icon: Focus, min: 0, max: 10, step: 0.5, default: 0 },
  ];

  const renderControl = (control) => (
    <div key={control.id} className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <control.icon className="w-4 h-4 text-[#8B6F47]" />
          <Label className="text-sm font-medium text-[#654321]">{control.label}</Label>
        </div>
        <span className="text-sm text-[#8B6F47] font-mono min-w-12 text-right">
          {adjustments[control.id]?.toFixed(control.step >= 1 ? 0 : 2) || control.default}
        </span>
      </div>
      <Slider
        value={[adjustments[control.id] !== undefined ? adjustments[control.id] : control.default]}
        onValueChange={([value]) => onAdjustmentChange(control.id, value)}
        min={control.min}
        max={control.max}
        step={control.step}
        className="[&_[role=slider]]:bg-[#8B6F47] [&_[role=slider]]:border-[#654321]"
      />
    </div>
  );

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white border border-[#8B6F47]/20 mb-4">
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="effects">Effects</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-6">
        {basicControls.map(renderControl)}
      </TabsContent>

      <TabsContent value="advanced" className="space-y-6">
        {advancedControls.map(renderControl)}
      </TabsContent>

      <TabsContent value="effects" className="space-y-6">
        {effectControls.map(renderControl)}
      </TabsContent>
    </Tabs>
  );
}