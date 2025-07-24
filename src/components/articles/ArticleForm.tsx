"use client";

import type React from "react";
import { useState, useTransition, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createArticleSchema,
  type CreateArticleSchema,
} from "@/validators/articleValidator";
import { generateSlugFromTitle } from "@/lib/clientUtils/slugifyClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { XIcon, PlusIcon } from "lucide-react";
import RichTextEditor from "./RichTextEditor"; // Assuming this component exists
import { CoupletInputGroup } from "./couplet-input-group"; // Assuming this component exists
import { usePoetStore } from "@/store/poet-store"; // Assuming this store exists
import { Checkbox } from "@/components/ui/checkbox"; // Assuming shadcn checkbox

// Generic Array Input Component (used for tags)
interface ArrayInputProps {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (newValues: string[]) => void;
  error?: string;
}

function ArrayInput({
  label,
  placeholder,
  value,
  onChange,
  error,
}: ArrayInputProps) {
  const [inputValue, setInputValue] = useState("");
  const handleAdd = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };
  const handleRemove = (itemToRemove: string) => {
    onChange(value.filter((item) => item !== itemToRemove));
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" onClick={handleAdd}>
          <PlusIcon className="h-4 w-4 mr-2" /> Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground"
          >
            {item}
            <button
              type="button"
              onClick={() => handleRemove(item)}
              className="ml-1 -mr-0.5 h-4 w-4 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
              aria-label={`Remove ${item}`}
            >
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface ArticleFormProps {
  initialData?: CreateArticleSchema & {
    _id?: string;
    coverImage?: string;
    poet?: { _id: string; name: string };
  }; // Add _id and coverImage URL for initial data
  isEdit?: boolean;
  articleSlug?: string;
}

export default function ArticleForm({
  initialData,
  isEdit = false,
  articleSlug,
}: ArticleFormProps) {
  const [isPending, startTransition] = useTransition();
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const { poets, fetchAllPoets, searchPoets } = usePoetStore();
  const [poetSearchQuery, setPoetSearchQuery] = useState("");
  const [debouncedPoetSearchQuery, setDebouncedPoetSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<CreateArticleSchema>({
    resolver: zodResolver(createArticleSchema), // Use createArticleSchema for validation, but handle partial updates in onSubmit
    defaultValues: {
      title: "",
      content: "",
      slug: "",
      summary: "",
      metaDescription: "",
      metaKeywords: "",
      status: "draft",
      poetId: "",
      couplets: [],
      category: [],
      tags: [],
      removeCoverImage: false,
    },
  });

  const title = watch("title");
  const content = watch("content");
  const coverImageFile = watch("coverImage");
  const selectedPoetId = watch("poetId");
  const removeCoverImage = watch("removeCoverImage"); // Watch the new checkbox

  // Fetch all poets on component mount
  useEffect(() => {
    fetchAllPoets();
  }, [fetchAllPoets]);

  // Debounce poet search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPoetSearchQuery(poetSearchQuery);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [poetSearchQuery]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedPoetSearchQuery) {
      searchPoets(debouncedPoetSearchQuery);
    } else {
      fetchAllPoets();
    }
  }, [debouncedPoetSearchQuery, searchPoets, fetchAllPoets]);

  // Auto-generate slug from title (only if not in edit mode or slug is empty)
  useEffect(() => {
    if (!isEdit || !initialData?.slug) {
      // Only auto-generate if creating or initial slug is empty
      if (title) {
        setValue("slug", generateSlugFromTitle(title), {
          shouldValidate: true,
        });
      } else {
        setValue("slug", "", { shouldValidate: true });
      }
    }
  }, [title, setValue, isEdit, initialData?.slug]);

  // Handle initial data for editing
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        poetId: initialData.poet?._id || "", // Set poetId from initialData.poet._id
        coverImage: undefined, // Clear file input for security/consistency
        // Ensure couplets, category, tags are arrays if they might be null/undefined
        couplets: initialData.couplets || [],
        category: initialData.category || [],
        tags: initialData.tags || [],
        removeCoverImage: false,
      });
      // Set initial cover image preview if available
      if (initialData.coverImage) {
        setCoverImagePreview(initialData.coverImage);
      }
    }
  }, [initialData, reset]);

  // Handle cover image preview for new uploads
  useEffect(() => {
    if (coverImageFile && coverImageFile.length > 0) {
      const file = coverImageFile[0];
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else if (!initialData?.coverImage && !removeCoverImage) {
      // Clear preview if no new file and no initial image, and not explicitly removing
      setCoverImagePreview(null);
    }
  }, [coverImageFile, initialData?.coverImage, removeCoverImage]);

  // Field array for couplets
  const {
    fields: coupletFields,
    append: appendCouplet,
    remove: removeCouplet,
  } = useFieldArray({
    control,
    name: "couplets",
  });

  // Predefined category options
  const categoryOptions = [
    "Ghazal",
    "Sher",
    "Nazm",
    "Qasida",
    "Marsiya",
    "Rubaai",
    "Masnavi",
    "Free Verse",
    "Other",
  ];

  const onSubmit = async (data: CreateArticleSchema) => {
    startTransition(async () => {
      const formData = new FormData();

      // Append simple string fields
      formData.append("title", data.title);
      formData.append("content", data.content);
      if (data.summary) formData.append("summary", data.summary);
      formData.append("slug", data.slug);
      if (data.metaDescription)
        formData.append("metaDescription", data.metaDescription);
      if (data.metaKeywords) formData.append("metaKeywords", data.metaKeywords);
      if (data.status) formData.append("status", data.status);
      formData.append("poetId", data.poetId);

      // Append JSON stringified arrays
      if (data.couplets && data.couplets.length > 0) {
        formData.append("couplets", JSON.stringify(data.couplets));
      }
      if (data.category && data.category.length > 0) {
        formData.append("category", JSON.stringify(data.category));
      }
      if (data.tags && data.tags.length > 0) {
        formData.append("tags", JSON.stringify(data.tags));
      }

      // Append cover image file or removal flag
      if (
        data.coverImage &&
        data.coverImage.length > 0 &&
        data.coverImage[0] instanceof File
      ) {
        formData.append("coverImage", data.coverImage[0]);
      } else if (isEdit && removeCoverImage) {
        formData.append("removeCoverImage", "true");
      }

      try {
        const url = isEdit ? `/api/articles/${articleSlug}` : "/api/articles";
        const method = isEdit ? "PUT" : "POST";

        const response = await fetch(url, {
          method: method,
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          toast.success(
            `Article ${isEdit ? "updated" : "created"} successfully!`,
            {
              description: `Slug: ${result.slug}`,
            }
          );
          if (!isEdit) {
            reset();
            setCoverImagePreview(null);
          }
          // In edit mode, you might want to re-fetch data or update state
          // For simplicity, we'll just show success and keep the form filled
        } else {
          toast.error(`Failed to ${isEdit ? "update" : "create"} article`, {
            description: result.message || "An unknown error occurred.",
          });
          console.error("API Error:", result);
        }
      } catch (error) {
        console.error("Submission error:", error);
        toast.error("Submission Error", {
          description: "Could not connect to the server.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Article" : "Create New Article"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                {...register("slug")}
                disabled={isEdit && initialData?.slug !== undefined}
              />{" "}
              {/* Disable slug editing if initialData has a slug */}
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              content={content}
              onChange={(newContent) =>
                setValue("content", newContent, { shouldValidate: true })
              }
              placeholder="Start writing your article here..."
              className="min-h-[300px]"
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" {...register("summary")} rows={3} />
            {errors.summary && (
              <p className="text-sm text-red-500">{errors.summary.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="poet">
              Poet <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue("poetId", value, { shouldValidate: true })
              }
              value={selectedPoetId}
            >
              <SelectTrigger id="poet">
                <SelectValue placeholder="Select a poet" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Search poets..."
                    value={poetSearchQuery}
                    onChange={(e) => setPoetSearchQuery(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {poets.length > 0 ? (
                  poets.map((poet) => (
                    <SelectItem key={poet._id} value={poet._id}>
                      {poet.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-muted-foreground">
                    No poets found.
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.poetId && (
              <p className="text-sm text-red-500">{errors.poetId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image</Label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              {...register("coverImage")}
            />
            {coverImagePreview && (
              <div className="mt-2 relative w-[200px] h-[150px]">
                <Image
                  src={coverImagePreview || "/placeholder.svg"}
                  alt="Cover Image Preview"
                  fill
                  className="object-cover rounded-md"
                />
                {isEdit && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={() => {
                      setCoverImagePreview(null);
                      setValue("coverImage", undefined); // Clear file input
                      setValue("removeCoverImage", true); // Mark for removal
                    }}
                  >
                    <XIcon className="h-4 w-4" />
                    <span className="sr-only">Remove current image</span>
                  </Button>
                )}
              </div>
            )}
            {isEdit && initialData?.coverImage && !coverImageFile?.length && (
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="removeCoverImage"
                  checked={removeCoverImage}
                  onCheckedChange={(checked) => {
                    setValue("removeCoverImage", checked as boolean);
                    if (checked) {
                      setCoverImagePreview(null); // Clear preview if removing
                    } else if (initialData?.coverImage) {
                      setCoverImagePreview(initialData.coverImage); // Restore preview if unchecking
                    }
                  }}
                />
                <label
                  htmlFor="removeCoverImage"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remove existing cover image
                </label>
              </div>
            )}
            {errors.coverImage && (
              <p className="text-sm text-red-500">
                {errors.coverImage.message?.toString()}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              onValueChange={(value: "draft" | "published") =>
                setValue("status", value)
              }
              value={watch("status")}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Couplets (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {coupletFields.map((field, index) => (
            <CoupletInputGroup
              key={field.id}
              index={index}
              control={control}
              onRemove={() => removeCouplet(index)}
            />
          ))}
          <Button
            type="button"
            onClick={() => appendCouplet({ en: "", hi: "", ur: "" })}
            variant="outline"
          >
            <PlusIcon className="h-4 w-4 mr-2" /> Add Couplet
          </Button>
          {errors.couplets && (
            <p className="text-sm text-red-500">{errors.couplets.message}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Categorization & SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(value) =>
                setValue("category", [value], { shouldValidate: true })
              }
              value={watch("category")?.[0] || ""}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>
          <ArrayInput
            label="Tags"
            placeholder="Add a tag (e.g., Love, Nature)"
            value={watch("tags") || []}
            onChange={(newTags) =>
              setValue("tags", newTags, { shouldValidate: true })
            }
            error={errors.tags?.message}
          />
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              {...register("metaDescription")}
              rows={3}
            />
            {errors.metaDescription && (
              <p className="text-sm text-red-500">
                {errors.metaDescription.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaKeywords">Meta Keywords</Label>
            <Input id="metaKeywords" {...register("metaKeywords")} />
            {errors.metaKeywords && (
              <p className="text-sm text-red-500">
                {errors.metaKeywords.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? isEdit
            ? "Updating Article..."
            : "Creating Article..."
          : isEdit
          ? "Update Article"
          : "Create Article"}
      </Button>
    </form>
  );
}
