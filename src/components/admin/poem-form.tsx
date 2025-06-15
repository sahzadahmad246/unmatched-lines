"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { usePoemStore } from "@/store/poem-store"
import { usePoetStore } from "@/store/poet-store"
import { useUserStore } from "@/store/user-store"
import { useDebounce } from "@/hooks/use-debounce"
import type { IPoem, SerializedPoem } from "@/types/poemTypes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus, Trash2, Upload, FileText, Globe, Settings, Search, X, Save, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Category = "poem" | "ghazal" | "sher" | "nazm" | "rubai" | "marsiya" | "qataa" | "other"
type Status = "draft" | "published"
type ContentLang = "en" | "hi" | "ur"

interface PoemFormProps {
  initialData?: IPoem | SerializedPoem
  slug?: string
}

interface DraftData {
  title: { en: string; hi: string; ur: string }
  content: {
    en: Array<{ couplet: string; meaning?: string }>
    hi: Array<{ couplet: string; meaning?: string }>
    ur: Array<{ couplet: string; meaning?: string }>
  }
  topics: string[]
  category: Category
  status: Status
  poet: string
  summary: { en?: string; hi?: string; ur?: string }
  didYouKnow: { en?: string; hi?: string; ur?: string }
  faqs: Array<{
    question: { en?: string; hi?: string; ur?: string }
    answer: { en?: string; hi?: string; ur?: string }
  }>
  savedAt: string
}

const languageNames: Record<ContentLang, string> = {
  en: "English",
  hi: "हिंदी",
  ur: "اردو",
}

const DRAFT_KEY = "poem-form-draft"
const DRAFT_SAVE_INTERVAL = 5000 // Save every 5 seconds

// Utility function to convert SerializedPoem to IPoem
const convertSerializedPoemToIPoem = (data: SerializedPoem): IPoem => ({
  ...data,
  createdAt: new Date(data.createdAt),
  updatedAt: new Date(data.updatedAt),
  bookmarks: data.bookmarks.map((bookmark) => ({
    userId: bookmark.userId,
    bookmarkedAt: new Date(bookmark.bookmarkedAt),
  })),
})

export default function PoemForm({ initialData, slug }: PoemFormProps) {
  const router = useRouter()
  const { createPoem, updatePoem, loading } = usePoemStore()
  const { poets, fetchAllPoets, searchPoets } = usePoetStore()
  const { userData } = useUserStore()
  const isEdit = !!initialData

  // Convert initialData to IPoem if it's a SerializedPoem
  const normalizedInitialData = initialData
    ? "bookmarks" in initialData && initialData.bookmarks.some((b) => typeof b.bookmarkedAt === "string")
      ? convertSerializedPoemToIPoem(initialData as SerializedPoem)
      : initialData
    : undefined

  const [formData, setFormData] = useState({
    title: normalizedInitialData?.title || { en: "", hi: "", ur: "" },
    content: normalizedInitialData?.content || {
      en: [{ couplet: "", meaning: "" }],
      hi: [{ couplet: "", meaning: "" }],
      ur: [{ couplet: "", meaning: "" }],
    },
    coverImage: null as File | null,
    topics: normalizedInitialData?.topics || [],
    category: (normalizedInitialData?.category || "poem") as Category,
    status: (normalizedInitialData?.status || "published") as Status,
    poet: normalizedInitialData?.poet?._id || "",
    summary: normalizedInitialData?.summary || { en: "", hi: "", ur: "" },
    didYouKnow: normalizedInitialData?.didYouKnow || { en: "", hi: "", ur: "" },
    faqs: normalizedInitialData?.faqs?.length
      ? normalizedInitialData.faqs
      : [{ question: { en: "", hi: "", ur: "" }, answer: { en: "", hi: "", ur: "" } }],
  })

  const [errors, setErrors] = useState<string[]>([])
  const [topicsInput, setTopicsInput] = useState<string>(formData.topics.join(", "))

  // Draft-related states
  const [showDraftDialog, setShowDraftDialog] = useState(false)
  const [draftData, setDraftData] = useState<DraftData | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Poet search states
  const [poetSearchQuery, setPoetSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(poetSearchQuery, 300)
  const [isSearching, setIsSearching] = useState(false)
  const [showPoetDropdown, setShowPoetDropdown] = useState(false)
  const poetDropdownRef = useRef<HTMLDivElement>(null)

  // Get selected poet details
  const selectedPoet = useMemo(() => {
    return poets.find((poet) => poet._id === formData.poet)
  }, [poets, formData.poet])

  // Draft management functions
  const saveDraft = useCallback(() => {
    if (isEdit) return // Don't save drafts for editing

    const draftData: DraftData = {
      title: formData.title,
      content: {
        en: formData.content.en.map((item) => ({
          couplet: item.couplet,
          meaning: item.meaning || "",
        })),
        hi: formData.content.hi.map((item) => ({
          couplet: item.couplet,
          meaning: item.meaning || "",
        })),
        ur: formData.content.ur.map((item) => ({
          couplet: item.couplet,
          meaning: item.meaning || "",
        })),
      },
      topics: formData.topics,
      category: formData.category,
      status: formData.status,
      poet: formData.poet,
      summary: {
        en: formData.summary.en || "",
        hi: formData.summary.hi || "",
        ur: formData.summary.ur || "",
      },
      didYouKnow: {
        en: formData.didYouKnow.en || "",
        hi: formData.didYouKnow.hi || "",
        ur: formData.didYouKnow.ur || "",
      },
      faqs: formData.faqs.map((faq) => ({
        question: {
          en: faq.question.en || "",
          hi: faq.question.hi || "",
          ur: faq.question.ur || "",
        },
        answer: {
          en: faq.answer.en || "",
          hi: faq.answer.hi || "",
          ur: faq.answer.ur || "",
        },
      })),
      savedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
      setLastSaved(new Date())
    } catch (error) {
      console.error("Failed to save draft:", error)
    }
  }, [formData, isEdit])

  const loadDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY)
      if (savedDraft) {
        const parsed: DraftData = JSON.parse(savedDraft)
        return parsed
      }
    } catch (error) {
      console.error("Failed to load draft:", error)
    }
    return null
  }, [])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY)
      setLastSaved(null)
    } catch (error) {
      console.error("Failed to clear draft:", error)
    }
  }, [])

  const restoreFromDraft = useCallback((draft: DraftData) => {
    setFormData({
      title: draft.title,
      content: draft.content,
      coverImage: null, // Can't restore file from localStorage
      topics: draft.topics,
      category: draft.category,
      status: draft.status,
      poet: draft.poet,
      summary: draft.summary,
      didYouKnow: draft.didYouKnow,
      faqs: draft.faqs,
    })
    setTopicsInput(draft.topics.join(", "))
    toast.success("Draft restored successfully!")
    setShowDraftDialog(false)
  }, [])

  const isDraftEmpty = useCallback((draft: DraftData) => {
    return (
      !draft.title.en.trim() &&
      !draft.title.hi.trim() &&
      !draft.title.ur.trim() &&
      !draft.content.en.some((item) => item.couplet.trim()) &&
      !draft.content.hi.some((item) => item.couplet.trim()) &&
      !draft.content.ur.some((item) => item.couplet.trim()) &&
      draft.topics.length === 0 &&
      !draft.summary.en?.trim() &&
      !draft.summary.hi?.trim() &&
      !draft.summary.ur?.trim() &&
      !draft.didYouKnow.en?.trim() &&
      !draft.didYouKnow.hi?.trim() &&
      !draft.didYouKnow.ur?.trim()
    )
  }, [])

  // Check for existing draft on component mount
  useEffect(() => {
    if (!isEdit) {
      const existingDraft = loadDraft()
      if (existingDraft && !isDraftEmpty(existingDraft)) {
        setDraftData(existingDraft)
        setShowDraftDialog(true)
      }
    }
  }, [isEdit, loadDraft, isDraftEmpty])

  // Auto-save draft periodically
  useEffect(() => {
    if (isEdit) return

    const interval = setInterval(() => {
      saveDraft()
    }, DRAFT_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [saveDraft, isEdit])

  // Save draft when form data changes (debounced)
  const debouncedFormData = useDebounce(formData, 2000)
  useEffect(() => {
    if (!isEdit) {
      saveDraft()
    }
  }, [debouncedFormData, saveDraft, isEdit])

  // Fetch poets on component mount
  useEffect(() => {
    if (userData?.role === "admin") {
      fetchAllPoets()
    }
  }, [userData?.role, fetchAllPoets])

  // Handle poet search with debouncing
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      if (userData?.role === "admin") {
        fetchAllPoets()
      }
      setIsSearching(false)
      return
    }

    if (userData?.role === "admin") {
      setIsSearching(true)
      searchPoets(debouncedSearchQuery).finally(() => {
        setIsSearching(false)
      })
    }
  }, [debouncedSearchQuery, userData?.role, searchPoets, fetchAllPoets])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (poetDropdownRef.current && !poetDropdownRef.current.contains(event.target as Node)) {
        setShowPoetDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle beforeunload to save draft
  useEffect(() => {
    if (isEdit) return

    const handleBeforeUnload = () => {
      saveDraft()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [saveDraft, isEdit])

  if (!userData?.role || (userData.role !== "admin" && userData.role !== "poet")) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to {isEdit ? "edit" : "create"} poems.</p>
        </CardContent>
      </Card>
    )
  }

  const handleContentChange = (lang: ContentLang, index: number, field: "couplet" | "meaning", value: string) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [lang]: prev.content[lang].map((item, i) => (i === index ? { ...item, [field]: value } : item)),
      },
    }))
  }

  const addCouplet = (lang: ContentLang) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [lang]: [...prev.content[lang], { couplet: "", meaning: "" }],
      },
    }))
  }

  const removeCouplet = (lang: ContentLang, index: number) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [lang]: prev.content[lang].filter((_, i) => i !== index),
      },
    }))
  }

  const handleFaqChange = (index: number, field: "question" | "answer", lang: ContentLang, value: string) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => (i === index ? { ...faq, [field]: { ...faq[field], [lang]: value } } : faq)),
    }))
  }

  const addFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: { en: "", hi: "", ur: "" }, answer: { en: "", hi: "", ur: "" } }],
    }))
  }

  const removeFaq = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }))
  }

  const handleTopicsChange = (value: string) => {
    setTopicsInput(value)
    const topics = value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10)
    setFormData((prev) => ({
      ...prev,
      topics,
    }))
  }

  const handlePoetSelect = (poetId: string) => {
    setFormData((prev) => ({ ...prev, poet: poetId }))
    setPoetSearchQuery("")
    setShowPoetDropdown(false)
  }

  const clearPoetSelection = () => {
    setFormData((prev) => ({ ...prev, poet: "" }))
    setPoetSearchQuery("")
    setShowPoetDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    // Validation
    const newErrors: string[] = []
    if (!formData.title.en.trim() || !formData.title.hi.trim() || !formData.title.ur.trim()) {
      newErrors.push("All title fields are required")
    }
    if (
      !formData.content.en.some((item) => item.couplet.trim()) ||
      !formData.content.hi.some((item) => item.couplet.trim()) ||
      !formData.content.ur.some((item) => item.couplet.trim())
    ) {
      newErrors.push("At least one couplet is required for each language")
    }
    if (userData.role === "admin" && !formData.poet) {
      newErrors.push("Poet selection is required for admin users")
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    const data = new FormData()
    data.append("title[en]", formData.title.en)
    data.append("title[hi]", formData.title.hi)
    data.append("title[ur]", formData.title.ur)
    data.append("content", JSON.stringify(formData.content))
    if (formData.coverImage) data.append("coverImage", formData.coverImage)
    if (formData.topics.length) data.append("topics", JSON.stringify(formData.topics))
    data.append("category", formData.category)
    data.append("status", formData.status)
    data.append("summary[en]", formData.summary.en || "")
    data.append("summary[hi]", formData.summary.hi || "")
    data.append("summary[ur]", formData.summary.ur || "")
    data.append("didYouKnow[en]", formData.didYouKnow.en || "")
    data.append("didYouKnow[hi]", formData.didYouKnow.hi || "")
    data.append("didYouKnow[ur]", formData.didYouKnow.ur || "")
    data.append("faqs", JSON.stringify(formData.faqs))
    if (userData.role === "admin" && formData.poet) {
      data.append("poet", formData.poet)
    }

    const result = isEdit ? await updatePoem(slug!, data) : await createPoem(data)

    if (result.success) {
      // Clear draft only on successful creation (not editing)
      if (!isEdit) {
        clearDraft()
      }
      toast.success(`Poem ${isEdit ? "updated" : "created"} successfully`)
      router.push("/admin/poems")
    } else {
      toast.error(result.message || "An error occurred")
      setErrors([result.message || "An error occurred"])
    }
  }

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <FileText className="h-6 w-6" />
              {isEdit ? "Edit Poem" : "Create New Poem"}
            </CardTitle>
            <p className="text-muted-foreground">Share your poetry with the world in multiple languages</p>

            {/* Draft status indicator */}
            {!isEdit && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Save className="h-4 w-4" />
                {lastSaved ? (
                  <span>Draft saved at {lastSaved.toLocaleTimeString()}</span>
                ) : (
                  <span>Auto-save enabled</span>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-6">
            {errors.length > 0 && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  {errors.map((err, i) => (
                    <p key={i} className="text-sm">
                      {err}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="media" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Media
                  </TabsTrigger>
                  <TabsTrigger value="additional" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Extra
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 mt-6">
                  <div className="grid gap-6">
                    {(["en", "hi", "ur"] as const).map((lang) => (
                      <div key={lang} className="space-y-2">
                        <Label htmlFor={`title-${lang}`} className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Title ({languageNames[lang]})
                        </Label>
                        <Input
                          id={`title-${lang}`}
                          value={formData.title[lang]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              title: { ...formData.title, [lang]: e.target.value },
                            })
                          }
                          required
                          placeholder={`Enter title in ${languageNames[lang]}`}
                          className="text-lg"
                        />
                      </div>
                    ))}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value: Category) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {["poem", "ghazal", "sher", "nazm", "rubai", "marsiya", "qataa", "other"].map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: Status) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {userData.role === "admin" && (
                      <div className="space-y-2">
                        <Label htmlFor="poet" className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Poet *
                        </Label>

                        {selectedPoet ? (
                          <div className="flex items-center gap-2 p-2 border rounded-md">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={selectedPoet.profilePicture?.url || ""} alt={selectedPoet.name} />
                              <AvatarFallback>{selectedPoet.name?.charAt(0) || "P"}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{selectedPoet.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="ml-auto"
                              onClick={clearPoetSelection}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="relative" ref={poetDropdownRef}>
                            <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                              <Search className="h-4 w-4 m-3 text-muted-foreground" />
                              <Input
                                placeholder="Click to search and select a poet..."
                                value={poetSearchQuery}
                                onChange={(e) => setPoetSearchQuery(e.target.value)}
                                onFocus={() => setShowPoetDropdown(true)}
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </div>

                            {showPoetDropdown && (
                              <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md">
                                {isSearching ? (
                                  <div className="p-3 text-center text-sm text-muted-foreground">Searching...</div>
                                ) : poets.length === 0 ? (
                                  <div className="p-3 text-center text-sm text-muted-foreground">
                                    {poetSearchQuery.trim() ? "No poets found" : "Start typing to search poets"}
                                  </div>
                                ) : (
                                  <div className="max-h-60 overflow-auto py-1">
                                    {poets.map((poet) => (
                                      <div
                                        key={poet._id}
                                        className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer transition-colors"
                                        onClick={() => handlePoetSelect(poet._id)}
                                      >
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={poet.profilePicture?.url || ""} alt={poet.name} />
                                          <AvatarFallback>{poet.name?.charAt(0) || "P"}</AvatarFallback>
                                        </Avatar>
                                        <span>{poet.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          <span className="text-destructive">*</span> Required: Search and select a poet to attribute
                          this poem to
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="content" className="mt-6">
                  <Tabs defaultValue="en" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      {(["en", "hi", "ur"] as const).map((lang) => (
                        <TabsTrigger key={lang} value={lang}>
                          {languageNames[lang]}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {(["en", "hi", "ur"] as const).map((lang) => (
                      <TabsContent key={lang} value={lang} className="space-y-4 mt-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{languageNames[lang]} Content</h3>
                          <Button type="button" variant="outline" size="sm" onClick={() => addCouplet(lang)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Couplet
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {formData.content[lang].map((item, index) => (
                            <Card key={index} className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-medium">Couplet {index + 1}</Label>
                                  {formData.content[lang].length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeCouplet(lang, index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <Textarea
                                  placeholder="Enter your couplet here..."
                                  value={item.couplet}
                                  onChange={(e) => handleContentChange(lang, index, "couplet", e.target.value)}
                                  required
                                  rows={3}
                                  className="resize-none"
                                />
                                <Textarea
                                  placeholder="Enter meaning or explanation (optional)"
                                  value={item.meaning || ""}
                                  onChange={(e) => handleContentChange(lang, index, "meaning", e.target.value)}
                                  rows={2}
                                  className="resize-none"
                                />
                              </div>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </TabsContent>

                <TabsContent value="media" className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="coverImage" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Cover Image
                    </Label>
                    <Input
                      id="coverImage"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.files?.[0] || null })}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <p className="text-xs text-muted-foreground">Upload a JPEG or PNG image (max 5MB)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topics">Topics</Label>
                    <Input
                      id="topics"
                      value={topicsInput}
                      onChange={(e) => handleTopicsChange(e.target.value)}
                      placeholder="e.g., love, nature, life, philosophy"
                    />
                    <p className="text-xs text-muted-foreground">Separate topics with commas (max 10 topics)</p>
                    {formData.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.topics.map((topic, index) => (
                          <Badge key={index} variant="secondary">
                            #{topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="additional" className="space-y-6 mt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Summary</h3>
                      <div className="space-y-4">
                        {(["en", "hi", "ur"] as const).map((lang) => (
                          <div key={lang} className="space-y-2">
                            <Label htmlFor={`summary-${lang}`}>Summary ({languageNames[lang]})</Label>
                            <Textarea
                              id={`summary-${lang}`}
                              value={formData.summary[lang] || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  summary: { ...formData.summary, [lang]: e.target.value },
                                })
                              }
                              rows={3}
                              placeholder={`Enter summary in ${languageNames[lang]}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Did You Know</h3>
                      <div className="space-y-4">
                        {(["en", "hi", "ur"] as const).map((lang) => (
                          <div key={lang} className="space-y-2">
                            <Label htmlFor={`didYouKnow-${lang}`}>Did You Know ({languageNames[lang]})</Label>
                            <Textarea
                              id={`didYouKnow-${lang}`}
                              value={formData.didYouKnow[lang] || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  didYouKnow: { ...formData.didYouKnow, [lang]: e.target.value },
                                })
                              }
                              rows={3}
                              placeholder={`Enter interesting facts in ${languageNames[lang]}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">FAQs</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addFaq}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add FAQ
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {formData.faqs.map((faq, index) => (
                          <Card key={index} className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">FAQ {index + 1}</Label>
                                {formData.faqs.length > 1 && (
                                  <Button type="button" variant="ghost" size="sm" onClick={() => removeFaq(index)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              {(["en", "hi", "ur"] as const).map((lang) => (
                                <div key={lang} className="space-y-2">
                                  <Input
                                    placeholder={`Question (${languageNames[lang]})`}
                                    value={faq.question[lang] || ""}
                                    onChange={(e) => handleFaqChange(index, "question", lang, e.target.value)}
                                  />
                                  <Textarea
                                    placeholder={`Answer (${languageNames[lang]})`}
                                    value={faq.answer[lang] || ""}
                                    onChange={(e) => handleFaqChange(index, "answer", lang, e.target.value)}
                                    rows={2}
                                  />
                                </div>
                              ))}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Saving..." : isEdit ? "Update Poem" : "Create Poem"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Draft Restoration Dialog */}
      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Restore Draft?
            </AlertDialogTitle>
            <AlertDialogDescription>
              We found a saved draft from {draftData && new Date(draftData.savedAt).toLocaleString()}. Would you like to
              restore it? This will replace any current content in the form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDraftDialog(false)}>Start Fresh</AlertDialogCancel>
            <AlertDialogAction onClick={() => draftData && restoreFromDraft(draftData)}>
              Restore Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
