"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Download, Share2, Sparkles, Upload, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VerseDownloadProps {
  verse: string;
  author: string;
  title?: string;
  imageUrl: string;
  languages?: {
    en?: string[] | string;
    hi?: string[] | string;
    ur?: string[] | string;
  };
}

interface CoverImage {
  _id: string;
  url: string;
  uploadedBy: { name: string };
  createdAt: string;
}

export function VerseDownload({
  verse,
  author,
  title = "Verse",
  languages,
}: VerseDownloadProps) {
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [downloadLanguage, setDownloadLanguage] = useState<"en" | "hi" | "ur">(
    "en"
  );
  const [selectedVerse, setSelectedVerse] = useState<string>(verse);
  const [coverImages, setCoverImages] = useState<CoverImage[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(
    null
  );
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"select" | "preview">("preview");
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processVerses = (input: string | string[] | undefined): string[] => {
    if (!input) return [];
    let lines: string[];
    if (typeof input === "string") {
      lines = input.split("\n").filter(Boolean);
    } else if (Array.isArray(input)) {
      lines = input.flatMap((stanza) =>
        typeof stanza === "string" ? stanza.split("\n").filter(Boolean) : stanza
      );
    } else {
      return [];
    }

    const pairedVerses: string[] = [];
    for (let i = 0; i < lines.length; i += 2) {
      const firstLine = lines[i];
      const secondLine = lines[i + 1] || "";
      pairedVerses.push(`${firstLine}\n${secondLine}`);
    }
    return pairedVerses;
  };

  const versesMap = {
    en: processVerses(languages?.en) || [verse],
    hi: processVerses(languages?.hi) || [],
    ur: processVerses(languages?.ur) || [],
  };

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (versesMap.en.length > 0) {
      setSelectedVerse(versesMap.en[0]);
    }
  }, [verse, languages]);

  useEffect(() => {
    const fetchCoverImages = async () => {
      try {
        const res = await fetch("/api/cover-images", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch cover images");
        const data = await res.json();
        setCoverImages(data.coverImages || []);
        if (data.coverImages.length > 0) {
          setSelectedImageUrl(data.coverImages[0].url);
        }
      } catch (error) {
        console.error("Error fetching cover images:", error);
        toast.error("Failed to load cover images");
      }
    };

    fetchCoverImages();
  }, []);

  useEffect(() => {
    if (selectedVerse && selectedImageUrl) {
      generateImagePreview(selectedVerse, selectedImageUrl);
    }
  }, [selectedVerse, selectedImageUrl]);

  const handleLanguageChange = (lang: "en" | "hi" | "ur") => {
    setDownloadLanguage(lang);
    if (versesMap[lang].length > 0) setSelectedVerse(versesMap[lang][0]);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCustomImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomImagePreview(result);
        setSelectedImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateImagePreview = async (verse: string, imageUrl: string) => {
    try {
      const dataUrl = await renderVerseToCanvas(verse, imageUrl);
      setImagePreviewUrl(dataUrl);
    } catch (error) {
      console.error("Error generating image preview:", error);
    }
  };

  const renderVerseToCanvas = async (
    verse: string,
    imageUrl: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject("Canvas not found");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Unable to get canvas context");

      const img: HTMLImageElement = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let fontFamily = "serif";
        if (downloadLanguage === "ur") {
          fontFamily = "Noto Nastaliq Urdu, serif";
          ctx.direction = "rtl";
        } else if (downloadLanguage === "hi") {
          fontFamily = "Noto Sans Devanagari, serif";
        }
        const fontSize = Math.max(canvas.width * 0.035, 24);
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = "white";

        const lines = verse.split("\n").filter(Boolean);
        const lineHeight = fontSize * 1.5;
        const totalTextHeight = lines.length * lineHeight;
        let yPosition = (canvas.height - totalTextHeight) / 2;

        for (const line of lines) {
          ctx.fillText(line, canvas.width / 2, yPosition);
          yPosition += lineHeight;
        }

        ctx.font = `italic ${fontSize * 0.8}px ${fontFamily}`;
        ctx.fillText(`— ${author}`, canvas.width / 2, canvas.height * 0.85);

        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = () => reject("Failed to load image");
      img.src = imageUrl;
    });
  };

  const downloadVerseImage = async () => {
    if (!selectedVerse || !selectedImageUrl) return;
    try {
      toast.loading("Creating your verse image...");
      const dataUrl = await renderVerseToCanvas(
        selectedVerse,
        selectedImageUrl
      );

      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      const formattedTitle = title.replace(/\s+/g, "-").toLowerCase();
      downloadLink.download = `${formattedTitle}-verse.jpg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setCustomImage(null);
      setCustomImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (coverImages.length > 0) setSelectedImageUrl(coverImages[0].url);

      setShowDownloadDialog(false);
      toast.dismiss();
      toast.success("Verse image downloaded", {
        description: "Your verse has been captured as an image",
        icon: <Sparkles className="h-4 w-4" />,
      });
    } catch (error) {
      console.error("Error generating verse image:", error);
      toast.dismiss();
      toast.error("Download failed", {
        description: "Could not create your verse image. Please try again.",
      });
    }
  };

  const shareVerse = async () => {
    if (!verse) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `"${selectedVerse}" — ${author}`,
          url: window.location.href,
        });
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(`"${selectedVerse}" — ${author}`);
        toast.success("Copied to clipboard", {
          description: "The verse has been copied to your clipboard",
        });
        setShowShareDialog(true);
      }
    } catch (error) {
      setShowShareDialog(true);
      toast.error("Sharing failed", {
        description: "Could not share the verse. Please try again.",
      });
    }
  };

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <div className="flex sm:flex-row items-center gap-1 text-black">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDownloadDialog(true)}
          className="gap-2 font-serif text-xs sm:text-sm w-full"
        >
          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline"></span>
        </Button>
      </div>

      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="border border-primary/20 sm:max-w-[800px] p-0 overflow-hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="font-serif text-xl flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Verse Image
              </DialogTitle>
              <DialogDescription>
                Select a verse, language, and cover image to create a shareable
                image
              </DialogDescription>
            </DialogHeader>

            {isMobile ? (
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as "select" | "preview")
                }
                className="w-full"
              >
                <div className="px-6">
                  <TabsList className="w-full grid grid-cols-2 mb-4">
                    <TabsTrigger value="preview" className="font-serif">
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="select" className="font-serif">
                      Select Options
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="select" className="m-0 p-6 pt-0">
                  <div className="space-y-5">
                    {(versesMap.hi.length > 0 || versesMap.ur.length > 0) && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="download-language"
                          className="font-serif"
                        >
                          Language
                        </Label>
                        <RadioGroup
                          defaultValue={downloadLanguage}
                          onValueChange={(value: string) =>
                            handleLanguageChange(value as "en" | "hi" | "ur")
                          }
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="en"
                              id="en"
                              disabled={!versesMap.en.length}
                            />
                            <Label htmlFor="en">English</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="hi"
                              id="hi"
                              disabled={!versesMap.hi.length}
                            />
                            <Label htmlFor="hi">Hindi</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="ur"
                              id="ur"
                              disabled={!versesMap.ur.length}
                            />
                            <Label htmlFor="ur">Urdu</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="selected-verse" className="font-serif">
                        Select Verse
                      </Label>
                      <Select
                        value={selectedVerse}
                        onValueChange={setSelectedVerse}
                      >
                        <SelectTrigger className="w-full font-serif">
                          <SelectValue placeholder="Choose a verse" />
                        </SelectTrigger>
                        <SelectContent>
                          {versesMap[downloadLanguage].map((verse, index) => (
                            <SelectItem
                              key={index}
                              value={verse}
                              className="font-serif whitespace-pre-wrap"
                            >
                              {verse.split("\n")[0].substring(0, 30)}...{"\n"}
                              {verse.split("\n")[1]?.substring(0, 30) || ""}...
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-serif">Select Cover Image</Label>
                      <ScrollArea className="h-[calc(80vh-400px)] md:h-[280px] rounded-md border">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3">
                          {coverImages.map((image) => (
                            <motion.div
                              key={image._id}
                              whileHover={{ scale: 1.05 }}
                              className={`relative w-full aspect-square cursor-pointer rounded-md overflow-hidden group`}
                              onClick={() => setSelectedImageUrl(image.url)}
                            >
                              <Image
                                src={image.url || "/placeholder.svg"}
                                alt="Cover Image"
                                fill
                                className="object-cover"
                              />
                              {selectedImageUrl === image.url && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                                    <Check className="h-4 w-4" />
                                  </div>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                          ))}
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`relative w-full aspect-square cursor-pointer border-2 ${
                              selectedImageUrl === customImagePreview
                                ? "border-primary"
                                : "border-dashed border-muted-foreground"
                            } rounded-md flex items-center justify-center`}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {customImagePreview ? (
                              <>
                                <Image
                                  src={customImagePreview || "/placeholder.svg"}
                                  alt="Custom Image"
                                  fill
                                  className="object-cover"
                                />
                                {selectedImageUrl === customImagePreview && (
                                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                                      <Check className="h-4 w-4" />
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-center text-muted-foreground">
                                <Upload className="h-6 w-6 mx-auto mb-1" />
                                <span className="text-xs">Upload</span>
                              </div>
                            )}
                          </motion.div>
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Download Button in Mobile Select Section */}
                    <Button
                      onClick={downloadVerseImage}
                      className="font-serif gap-2 w-full"
                      disabled={!selectedVerse || !selectedImageUrl}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="m-0 p-6 pt-0">
                  <div className="space-y-4 h-full flex flex-col">
                    <Label className="font-serif">Preview</Label>
                    {imagePreviewUrl ? (
                      <div className="relative flex-1 rounded-md border overflow-hidden flex items-center justify-center bg-black/5">
                        <Image
                          src={imagePreviewUrl || "/placeholder.svg"}
                          alt="Verse Preview"
                          width={500}
                          height={300}
                          className="object-contain max-h-full"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-muted-foreground italic">
                        Select a verse and image to preview
                      </div>
                    )}

                    <Button
                      onClick={downloadVerseImage}
                      className="font-serif gap-2 w-full"
                      disabled={!selectedVerse || !selectedImageUrl}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col md:flex-row md:h-[500px] p-6 pt-0">
                <div className="flex-1 space-y-5 md:pr-6">
                  {(versesMap.hi.length > 0 || versesMap.ur.length > 0) && (
                    <div className="space-y-2">
                      <Label htmlFor="download-language" className="font-serif">
                        Language
                      </Label>
                      <RadioGroup
                        defaultValue={downloadLanguage}
                        onValueChange={(value: string) =>
                          handleLanguageChange(value as "en" | "hi" | "ur")
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="en"
                            id="en"
                            disabled={!versesMap.en.length}
                          />
                          <Label htmlFor="en">English</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="hi"
                            id="hi"
                            disabled={!versesMap.hi.length}
                          />
                          <Label htmlFor="hi">Hindi</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="ur"
                            id="ur"
                            disabled={!versesMap.ur.length}
                          />
                          <Label htmlFor="ur">Urdu</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="selected-verse" className="font-serif">
                      Select Verse
                    </Label>
                    <Select
                      value={selectedVerse}
                      onValueChange={setSelectedVerse}
                    >
                      <SelectTrigger className="w-full font-serif">
                        <SelectValue placeholder="Choose a verse" />
                      </SelectTrigger>
                      <SelectContent>
                        {versesMap[downloadLanguage].map((verse, index) => (
                          <SelectItem
                            key={index}
                            value={verse}
                            className="font-serif whitespace-pre-wrap"
                          >
                            {verse.split("\n")[0].substring(0, 30)}...{"\n"}
                            {verse.split("\n")[1]?.substring(0, 30) || ""}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-serif">Select Cover Image</Label>
                    <ScrollArea className="h-[calc(100vh-400px)] md:h-[350px] rounded-md border">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3">
                        {coverImages.map((image) => (
                          <motion.div
                            key={image._id}
                            whileHover={{ scale: 1.05 }}
                            className={`relative w-full aspect-square cursor-pointer rounded-md overflow-hidden group`}
                            onClick={() => setSelectedImageUrl(image.url)}
                          >
                            <Image
                              src={image.url || "/placeholder.svg"}
                              alt="Cover Image"
                              fill
                              className="object-cover"
                            />
                            {selectedImageUrl === image.url && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <div className="bg-primary text-primary-foreground rounded-full p-1">
                                  <Check className="h-4 w-4" />
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.div>
                        ))}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`relative w-full aspect-square cursor-pointer border-2 ${
                            selectedImageUrl === customImagePreview
                              ? "border-primary"
                              : "border-dashed border-muted-foreground"
                          } rounded-md flex items-center justify-center`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {customImagePreview ? (
                            <>
                              <Image
                                src={customImagePreview || "/placeholder.svg"}
                                alt="Custom Image"
                                fill
                                className="object-cover"
                              />
                              {selectedImageUrl === customImagePreview && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                                    <Check className="h-4 w-4" />
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <Upload className="h-6 w-6 mx-auto mb-1" />
                              <span className="text-xs">Upload</span>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                <div className="flex-1 border-t md:border-t-0 md:border-l p-6 pt-4 md:pl-6">
                  <div className="space-y-4 h-full flex flex-col">
                    <Label className="font-serif">Preview</Label>
                    {imagePreviewUrl ? (
                      <div className="relative flex-1 rounded-md border overflow-hidden flex items-center justify-center bg-black/5">
                        <Image
                          src={imagePreviewUrl || "/placeholder.svg"}
                          alt="Verse Preview"
                          width={500}
                          height={300}
                          className="object-contain max-h-full"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-muted-foreground italic">
                        Select a verse and image to preview
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="p-6 pt-0">
              <Button
                variant="outline"
                onClick={() => setShowDownloadDialog(false)}
                className="font-serif"
              >
                Cancel
              </Button>
              {!isMobile && (
                <Button
                  onClick={downloadVerseImage}
                  className="font-serif gap-2"
                  disabled={!selectedVerse || !selectedImageUrl}
                >
                  <Download className="h-4 w-4" />
                  Download Image
                </Button>
              )}
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="border border-primary/20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                Share this verse
              </DialogTitle>
              <DialogDescription>
                Copy the link below to share this beautiful verse with others
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={
                  typeof window !== "undefined" ? window.location.href : ""
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied", {
                    description:
                      "The verse's link has been copied to your clipboard",
                    icon: <Sparkles className="h-4 w-4" />,
                  });
                  setShowShareDialog(false);
                }}
              >
                Copy
              </Button>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowShareDialog(false)}
                className="font-serif"
              >
                Close
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
