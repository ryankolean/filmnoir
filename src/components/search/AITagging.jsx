import React, { useState } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Photo } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AITagging({ photo, onTagsGenerated }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedTags, setGeneratedTags] = useState(null);

  const analyzePhoto = async () => {
    setIsAnalyzing(true);
    try {
      const result = await InvokeLLM({
        prompt: `Analyze this photo and provide detailed information.
        Return a JSON object with:
        - tags: array of 5-10 relevant tags (single words, lowercase)
        - description: a brief 2-sentence description of what's in the photo
        - objects: array of main objects/subjects visible in the photo
        - colors: array of 3-5 dominant colors (color names, lowercase)
        - mood: overall mood or atmosphere (one word)
        
        Focus on being specific and accurate. Include photography-related tags if relevant (e.g., portrait, landscape, macro).`,
        file_urls: [photo.image_url],
        response_json_schema: {
          type: "object",
          properties: {
            tags: {
              type: "array",
              items: { type: "string" }
            },
            description: {
              type: "string"
            },
            objects: {
              type: "array",
              items: { type: "string" }
            },
            colors: {
              type: "array",
              items: { type: "string" }
            },
            mood: {
              type: "string"
            }
          }
        }
      });

      setGeneratedTags(result);

      // Update photo with AI tags
      await Photo.update(photo.id, {
        ai_tags: result.tags,
        ai_description: result.description,
        objects_detected: result.objects,
        colors: result.colors,
      });

      if (onTagsGenerated) {
        onTagsGenerated(result);
      }
    } catch (error) {
      console.error("Error analyzing photo:", error);
    }
    setIsAnalyzing(false);
  };

  const hasAIData = photo.ai_tags || generatedTags;

  return (
    <div className="space-y-4">
      {!hasAIData ? (
        <Button
          onClick={analyzePhoto}
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Tags
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#2C2C2C]">AI Analysis</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={analyzePhoto}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
            </Button>
          </div>

          {(generatedTags?.description || photo.ai_description) && (
            <div>
              <p className="text-xs font-medium text-[#8B6F47] mb-2">Description</p>
              <p className="text-sm text-[#654321]">
                {generatedTags?.description || photo.ai_description}
              </p>
            </div>
          )}

          {(generatedTags?.tags || photo.ai_tags) && (
            <div>
              <p className="text-xs font-medium text-[#8B6F47] mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {(generatedTags?.tags || photo.ai_tags).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="bg-purple-100 text-purple-800">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(generatedTags?.objects || photo.objects_detected) && (
            <div>
              <p className="text-xs font-medium text-[#8B6F47] mb-2">Objects Detected</p>
              <div className="flex flex-wrap gap-2">
                {(generatedTags?.objects || photo.objects_detected).map((obj, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {obj}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(generatedTags?.colors || photo.colors) && (
            <div>
              <p className="text-xs font-medium text-[#8B6F47] mb-2">Dominant Colors</p>
              <div className="flex flex-wrap gap-2">
                {(generatedTags?.colors || photo.colors).map((color, i) => (
                  <Badge key={i} variant="outline" className="text-xs capitalize">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}