import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function HistogramView({ imageUrl }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Create temporary canvas for analysis
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      tempCtx.drawImage(img, 0, 0);

      const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      // Calculate histogram
      const histogram = {
        r: new Array(256).fill(0),
        g: new Array(256).fill(0),
        b: new Array(256).fill(0),
      };

      for (let i = 0; i < data.length; i += 4) {
        histogram.r[data[i]]++;
        histogram.g[data[i + 1]]++;
        histogram.b[data[i + 2]]++;
      }

      // Find max value for scaling
      const maxValue = Math.max(
        Math.max(...histogram.r),
        Math.max(...histogram.g),
        Math.max(...histogram.b)
      );

      // Draw histogram
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = "#F8F6F3";
      ctx.fillRect(0, 0, width, height);

      // Draw channels
      const channels = [
        { data: histogram.r, color: "rgba(255, 100, 100, 0.6)" },
        { data: histogram.g, color: "rgba(100, 255, 100, 0.6)" },
        { data: histogram.b, color: "rgba(100, 100, 255, 0.6)" },
      ];

      channels.forEach(({ data, color }) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        for (let i = 0; i < 256; i++) {
          const x = (i / 256) * width;
          const y = height - (data[i] / maxValue) * height;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Grid lines
      ctx.strokeStyle = "rgba(139, 111, 71, 0.2)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const y = (i / 4) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    img.src = imageUrl;
  }, [imageUrl]);

  return (
    <Card className="border-[#8B6F47]/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-[#654321] flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Histogram
        </CardTitle>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          className="w-full rounded border border-[#8B6F47]/10"
        />
        <div className="flex justify-between mt-2 text-xs text-[#8B6F47]">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            Red
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            Green
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            Blue
          </span>
        </div>
      </CardContent>
    </Card>
  );
}