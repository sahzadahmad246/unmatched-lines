"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  Download,
  Eye,
  Settings,
  ArrowLeft,
  ArrowRight,
  Star,
  Moon,
  BookOpen,
} from "lucide-react";
import { TransformedArticle } from "@/types/articleTypes";

interface DownloadArticleCoupletProps {
  articleSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Fetch article by slug
const fetchArticleBySlug = async (slug: string): Promise<TransformedArticle | null> => {
  try {
    const response = await fetch(`/api/articles/${slug}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }
    const data: TransformedArticle = await response.json();
    return data;
  } catch (error) {
    console.error("[fetchArticleBySlug] Error:", error);
    throw error;
  }
};

export default function DownloadArticleCouplet({
  articleSlug,
  open,
  onOpenChange,
}: DownloadArticleCoupletProps) {
  const [article, setArticle] = useState<TransformedArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "ur">("en");
  const [selectedCoupletIndex, setSelectedCoupletIndex] = useState<number>(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string>("default");
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"customize" | "preview">("customize");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch article when dialog opens
  useEffect(() => {
    if (open && !article) {
      setLoading(true);
      setError(null);
      fetchArticleBySlug(articleSlug)
        .then((fetchedArticle) => {
          if (fetchedArticle) {
            setArticle(fetchedArticle);
            if (!fetchedArticle.couplets?.length) {
              setError("No couplets available for this article");
              toast.error("No couplets available for this article");
            }
          } else {
            setError("Article not found");
            toast.error("Article not found");
          }
        })
        .catch((err) => {
          console.error("[DownloadArticleCouplet] Failed to fetch article:", err);
          setError("Failed to load article");
          toast.error("Failed to load article");
        })
        .finally(() => setLoading(false));
    }
  }, [open, articleSlug, article]);

  // Reset tab and couplet index when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab("customize");
      setSelectedCoupletIndex(0);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setSelectedBackground("custom");
      };
      reader.onerror = () => toast.error("Failed to read the image file");
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setSelectedBackground("default");
    }
  };

  const drawImageOnCanvas = async () => {
    if (!canvasRef.current || !article) return null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = 1080;
    canvas.height = 1080;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      if (selectedBackground === "custom" && selectedImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = selectedImage;
        });
        
        // Calculate crop dimensions for square aspect ratio
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        
        // Draw cropped square image
        ctx.drawImage(img, x, y, size, size, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        drawBackgroundByType(ctx, canvas.width, canvas.height, selectedBackground);
      }

      const couplet = article.couplets?.[selectedCoupletIndex]?.[selectedLanguage] || "";
      drawText(ctx, couplet, canvas.width, canvas.height);
      return canvas.toDataURL("image/png", 1.0);
    } catch (error) {
      console.error("Error drawing on canvas:", error);
      throw error;
    }
  };

  const drawBackgroundByType = (ctx: CanvasRenderingContext2D, width: number, height: number, type: string) => {
    switch (type) {
      case "sunset":
        drawSunsetBackground(ctx, width, height);
        break;
      case "ocean":
        drawOceanBackground(ctx, width, height);
        break;
      case "forest":
        drawForestBackground(ctx, width, height);
        break;
      case "gradient":
        drawGradientBackground(ctx, width, height);
        break;
      default:
        drawDefaultBackground(ctx, width, height);
    }
  };

  const drawDefaultBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Dark black background with subtle gradient
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    gradient.addColorStop(0, "#1a1a1a");
    gradient.addColorStop(0.7, "#0d0d0d");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    drawOrnamentalCorners(ctx, width, height);
  };

  const drawSunsetBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Dark red gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#2d1b1b");
    gradient.addColorStop(0.5, "#1a0f0f");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    drawOrnamentalCorners(ctx, width, height);
  };

  const drawOceanBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Dark blue gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#1a1d2e");
    gradient.addColorStop(0.5, "#0f111a");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    drawOrnamentalCorners(ctx, width, height);
  };

  const drawForestBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Dark green gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#1a2e1a");
    gradient.addColorStop(0.5, "#0f1a0f");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    drawOrnamentalCorners(ctx, width, height);
  };

  const drawGradientBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Dark purple gradient
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    gradient.addColorStop(0, "#2e1a2e");
    gradient.addColorStop(0.7, "#1a0f1a");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    drawOrnamentalCorners(ctx, width, height);
  };


  const drawOrnamentalCorners = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    const cornerSize = 60;
    ctx.beginPath();
    ctx.moveTo(30, 30 + cornerSize);
    ctx.lineTo(30, 30);
    ctx.lineTo(30 + cornerSize, 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width - 30 - cornerSize, 30);
    ctx.lineTo(width - 30, 30);
    ctx.lineTo(width - 30, 30 + cornerSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(30, height - 30 - cornerSize);
    ctx.lineTo(30, height - 30);
    ctx.lineTo(30 + cornerSize, height - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width - 30 - cornerSize, height - 30);
    ctx.lineTo(width - 30, height - 30);
    ctx.lineTo(width - 30, height - 30 - cornerSize);
    ctx.stroke();
  };

  const drawText = (ctx: CanvasRenderingContext2D, text: string, width: number, height: number) => {
    const isUrdu = selectedLanguage === "ur";
    const maxWidth = width * 0.8; // Use 80% of canvas width for text
    
    // Draw couplet text with better font
    ctx.font = isUrdu ? 'bold 48px "Noto Nastaliq Urdu", serif' : 'bold 44px "Georgia", serif';
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    
    const lines = text.split("\n");
    const lineHeight = isUrdu ? 80 : 70;
    const totalHeight = lines.length * lineHeight;
    const startY = (height - totalHeight) / 2 + lineHeight / 2;
    
    let currentY = startY;
    
    lines.forEach((line) => {
      // Wrap long lines
      const words = line.trim().split(' ');
      let currentLine = '';
      
      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(currentLine.trim(), width / 2, currentY);
          currentLine = words[i] + ' ';
          currentY += lineHeight; // Move to next line
        } else {
          currentLine = testLine;
        }
      }
      ctx.fillText(currentLine.trim(), width / 2, currentY);
      currentY += lineHeight; // Move to next line after each original line
    });
    
    // Draw poet name below the couplet with proper spacing
    if (article?.poet?.name) {
      currentY += lineHeight * 0.5; // Add extra spacing before poet name
      ctx.font = 'bold 28px "Georgia", serif';
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText(`— ${article.poet.name}`, width / 2, currentY);
    }
  };

  const handleDownload = async () => {
    if (!article) {
      toast.error("Cannot download: Missing article data");
      return;
    }
    setIsDownloading(true);
    try {
      const dataUrl = await drawImageOnCanvas();
      if (!dataUrl) throw new Error("Failed to generate image");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${article.title}-couplet-${selectedCoupletIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded successfully");
    } catch {
      toast.error("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const renderPreview = () => {
    const couplet = article?.couplets?.[selectedCoupletIndex]?.[selectedLanguage] || "Select a couplet";
    const isUrdu = selectedLanguage === "ur";
    
    const getBackgroundStyle = () => {
      if (selectedBackground === "custom" && selectedImage) {
        return {
          background: `url(${selectedImage}) center/cover`,
          filter: "brightness(0.3)"
        };
      }
      
      switch (selectedBackground) {
        case "sunset":
          return { background: "linear-gradient(to bottom, #2d1b1b, #1a0f0f, #000000)" };
        case "ocean":
          return { background: "linear-gradient(to bottom, #1a1d2e, #0f111a, #000000)" };
        case "forest":
          return { background: "linear-gradient(to bottom, #1a2e1a, #0f1a0f, #000000)" };
        case "gradient":
          return { background: "radial-gradient(circle at center, #2e1a2e, #1a0f1a, #000000)" };
        default:
          return { background: "radial-gradient(circle at center, #1a1a1a, #0d0d0d, #000000)" };
      }
    };
    
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-full max-w-[250px] aspect-square mx-auto rounded-md shadow-md border border-white/20">
          <div
            className="absolute inset-0"
            style={getBackgroundStyle()}
          />
          {selectedBackground === "custom" && selectedImage && <div className="absolute inset-0 bg-black/70" />}
          {selectedBackground === "default" && (
            <>
              <div className="absolute top-2 left-2">
                <Star className="h-2 w-2 text-white/60" />
              </div>
              <div className="absolute top-4 right-2">
                <Star className="h-3 w-3 text-white/70" />
              </div>
              <div className="absolute bottom-2 left-3">
                <Star className="h-2 w-2 text-white/50" />
              </div>
              <div className="absolute top-3 right-6">
                <Moon className="h-6 w-6 text-white/80" />
              </div>
              <div className="absolute top-1 left-1 w-4 h-4 border-l-2 border-t-2 border-white/30" />
              <div className="absolute top-1 right-1 w-4 h-4 border-r-2 border-t-2 border-white/30" />
              <div className="absolute bottom-1 left-1 w-4 h-4 border-l-2 border-b-2 border-white/30" />
              <div className="absolute bottom-1 right-1 w-4 h-4 border-r-2 border-b-2 border-white/30" />
            </>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
            <p
              className={`text-white text-center font-bold ${isUrdu ? "font-noto-nastaliq text-[10px]" : "font-inter text-[9px]"}`}
              style={{
                textShadow: "0 2px 6px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.9)",
                direction: isUrdu ? "rtl" : "ltr",
                whiteSpace: "pre-wrap",
              }}
            >
              {couplet}
            </p>
            {article?.poet?.name && (
              <p className="text-white text-center font-bold text-[6px] mt-1" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.95)" }}>
                — {article.poet.name}
              </p>
            )}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">Final image: 1080x1080 pixels</p>
      </div>
    );
  };

  const renderCustomizationSection = () => {
    const truncateCouplet = (couplet: string) => {
      const maxLength = window.innerWidth < 640 ? 20 : 50;
      if (couplet.length <= maxLength) return couplet;
      return couplet.substring(0, maxLength - 3) + "...";
    };

    return (
      <div className="space-y-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm">Customize Article Couplet Image</h3>
            </div>
            <div className="flex flex-row gap-4">
              <div className="space-y-1 flex-1">
                <Label htmlFor="language" className="text-xs font-semibold flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-primary" /> Language
                </Label>
                <Select
                  value={selectedLanguage}
                  onValueChange={(value: "en" | "hi" | "ur") => {
                    setSelectedLanguage(value);
                    setSelectedCoupletIndex(0);
                  }}
                >
                  <SelectTrigger id="language" className="bg-background/80 border-primary/30 h-8 text-xs">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="ur">Urdu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 flex-1">
                <Label htmlFor="couplet" className="text-xs font-semibold flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-primary" /> Couplet
                </Label>
                <Select
                  value={selectedCoupletIndex.toString()}
                  onValueChange={(value) => setSelectedCoupletIndex(Number.parseInt(value))}
                  disabled={!article?.couplets?.length}
                >
                  <SelectTrigger id="couplet" className="bg-background/80 border-primary/30 h-8 text-xs">
                    <SelectValue placeholder={article?.couplets?.length ? "Select couplet" : "No couplets available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {article?.couplets?.length ? (
                      article.couplets.map((item, index) => {
                        const coupletText = item[selectedLanguage] || `Couplet ${index + 1}`;
                        return (
                          <SelectItem
                            key={index}
                            value={index.toString()}
                            className="text-xs overflow-hidden text-ellipsis whitespace-nowrap"
                          >
                            {truncateCouplet(coupletText)}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="none" disabled>
                        No couplets available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Upload className="h-3 w-3 text-primary" /> Background Options
              </Label>
              
              {/* Background Type Selection */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button
                  variant={selectedBackground === "default" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBackground("default")}
                  className="text-xs h-8"
                >
                  Starry Night
                </Button>
                <Button
                  variant={selectedBackground === "sunset" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBackground("sunset")}
                  className="text-xs h-8"
                >
                  Sunset
                </Button>
                <Button
                  variant={selectedBackground === "ocean" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBackground("ocean")}
                  className="text-xs h-8"
                >
                  Ocean
                </Button>
                <Button
                  variant={selectedBackground === "forest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBackground("forest")}
                  className="text-xs h-8"
                >
                  Forest
                </Button>
                <Button
                  variant={selectedBackground === "gradient" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBackground("gradient")}
                  className="text-xs h-8"
                >
                  Gradient
                </Button>
                <Button
                  variant={selectedBackground === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBackground("custom")}
                  className="text-xs h-8"
                >
                  Custom
                </Button>
              </div>
              
              {/* Custom Image Upload */}
              {selectedBackground === "custom" && (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    variant="outline"
                    className="w-full h-16 border-dashed border-primary/40 hover:border-primary/60 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="h-6 w-6 text-primary" />
                      <span>{selectedImage ? "Change Background" : "Upload Background Image"}</span>
                    </div>
                  </Button>
                  {selectedImage && (
                    <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200">
                      <span className="text-xs text-green-700 dark:text-green-300">✓ Custom background uploaded</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedImage(null);
                          setSelectedBackground("default");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </>
              )}
              <p className="text-[10px] text-muted-foreground">
                {selectedBackground === "custom" 
                  ? "Upload a custom image (will be cropped to square)" 
                  : "Choose from beautiful background options"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Button
          onClick={handleDownload}
          disabled={isDownloading || !article?.couplets?.[selectedCoupletIndex]?.[selectedLanguage]}
          className="w-full h-10 text-xs font-bold bg-primary hover:bg-primary/90"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" /> Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-1" /> Download Image
            </>
          )}
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full sm:max-w-[50%] max-h-[90vh] overflow-y-auto overflow-x-hidden p-4">
          <div className="flex justify-center items-center h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading article...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!article || error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full sm:max-w-[50%] max-h-[90vh] overflow-y-auto overflow-x-hidden p-4">
          <div className="flex justify-center items-center h-full">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Article not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[50%] max-h-[90vh] overflow-y-auto overflow-x-hidden p-4">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Download className="h-4 w-4 text-primary" />
            Download Article Couplet Image
          </DialogTitle>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "customize" | "preview")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full h-8">
            <TabsTrigger value="customize" className="flex items-center gap-1 text-xs">
              <Settings className="h-3 w-3" /> Customize
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-1 text-xs">
              <Eye className="h-3 w-3" /> Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="customize" className="mt-2">
            {renderCustomizationSection()}
            <div className="flex justify-end mt-2">
              <Button onClick={() => setActiveTab("preview")} variant="outline" className="h-8 text-xs">
                Preview <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="preview" className="mt-2">
            {renderPreview()}
            <Button
              onClick={handleDownload}
              disabled={isDownloading || !article?.couplets?.[selectedCoupletIndex]?.[selectedLanguage]}
              className="w-full h-10 text-xs font-bold bg-primary hover:bg-primary/90 mt-2"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" /> Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" /> Download Image
                </>
              )}
            </Button>
            <div className="flex justify-start mt-2">
              <Button onClick={() => setActiveTab("customize")} variant="outline" className="h-8 text-xs">
                <ArrowLeft className="h-3 w-3 mr-1" /> Back to Customize
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <canvas ref={canvasRef} style={{ display: "none" }} width={1080} height={1080} />
      </DialogContent>
    </Dialog>
  );
}