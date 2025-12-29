import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../stores/useAuth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Home,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Plane,
  Clock,
  Activity,
  CheckSquare,
  XSquare,
  List,
  Shield,
  ArrowRight,
  ArrowLeft,
  Star,
  Plus,
  Trash2,
} from "lucide-react";
import { ImageUploader } from "../ui/image-uploader";
import { uploadImage } from "../../lib/storage";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "../../lib/utils";

type FormState = {
  // Basic Info
  title: string;
  destination: string;
  shortDescription: string;
  description: string;
  tags: string[];

  // Dates & Pricing
  startDate: string;
  endDate: string;
  priceMin: number | "";
  priceMax: number | "";
  currency: string;

  // Group Details
  maxGroupSize: number | "";
  availableSpots: number | "";
  ageRangeMin: number | "";
  ageRangeMax: number | "";
  difficulty: string;

  // What's Included/Not Included
  includedItems: Array<{ title: string; description: string }>;
  notIncludedItems: string[];

  // Itinerary
  itinerary: Array<{ day: number; title: string; description: string }>;

  // Policies
  cancellationPolicy: string;
};

interface ImageFile {
  id: string;
  file?: File;
  url: string;
  caption?: string;
  displayOrder: number;
}

const initialState: FormState = {
  title: "",
  destination: "",
  shortDescription: "",
  description: "",
  tags: [],
  startDate: "",
  endDate: "",
  priceMin: "",
  priceMax: "",
  currency: "MYR",
  maxGroupSize: 12,
  availableSpots: 10,
  ageRangeMin: 18,
  ageRangeMax: 65,
  difficulty: "moderate",
  includedItems: [
    { title: "Accommodation", description: "" },
    { title: "Meals", description: "" },
    { title: "Activities", description: "" },
    { title: "Transportation", description: "" },
  ],
  notIncludedItems: [
    "International flights",
    "Travel insurance",
    "Personal expenses",
  ],
  itinerary: [],
  cancellationPolicy: "",
};

const STEPS = [
  { id: 1, title: "Basic Info", icon: FileText },
  { id: 2, title: "Dates & Pricing", icon: Calendar },
  { id: 3, title: "Group Details", icon: Users },
  { id: 4, title: "What's Included", icon: CheckSquare },
  { id: 5, title: "Itinerary", icon: List },
  { id: 6, title: "Photos", icon: ImageIcon },
  { id: 7, title: "Review", icon: Sparkles },
];

const POPULAR_TAGS = [
  "adventure",
  "cultural",
  "wellness",
  "beach",
  "mountain",
  "city",
  "food",
  "photography",
  "wildlife",
  "luxury",
  "budget",
  "family",
  "solo",
  "couples",
  "groups",
];

export default function CreateListingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<FormState>(initialState);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const user = useAuth((s) => s.user);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function toggleTag(tag: string) {
    setState((s) => ({
      ...s,
      tags: s.tags.includes(tag)
        ? s.tags.filter((t) => t !== tag)
        : [...s.tags, tag],
    }));
  }

  function addIncludedItem() {
    setState((s) => ({
      ...s,
      includedItems: [...s.includedItems, { title: "", description: "" }],
    }));
  }

  function updateIncludedItem(
    index: number,
    field: "title" | "description",
    value: string
  ) {
    setState((s) => ({
      ...s,
      includedItems: s.includedItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function removeIncludedItem(index: number) {
    setState((s) => ({
      ...s,
      includedItems: s.includedItems.filter((_, i) => i !== index),
    }));
  }

  function addNotIncludedItem() {
    setState((s) => ({
      ...s,
      notIncludedItems: [...s.notIncludedItems, ""],
    }));
  }

  function updateNotIncludedItem(index: number, value: string) {
    setState((s) => ({
      ...s,
      notIncludedItems: s.notIncludedItems.map((item, i) =>
        i === index ? value : item
      ),
    }));
  }

  function removeNotIncludedItem(index: number) {
    setState((s) => ({
      ...s,
      notIncludedItems: s.notIncludedItems.filter((_, i) => i !== index),
    }));
  }

  function addItineraryDay() {
    setState((s) => ({
      ...s,
      itinerary: [
        ...s.itinerary,
        {
          day: s.itinerary.length + 1,
          title: "",
          description: "",
        },
      ],
    }));
  }

  function updateItinerary(
    index: number,
    field: "title" | "description",
    value: string
  ) {
    setState((s) => ({
      ...s,
      itinerary: s.itinerary.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function removeItineraryDay(index: number) {
    setState((s) => ({
      ...s,
      itinerary: s.itinerary
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          day: i + 1,
        })),
    }));
  }

  function nextStep() {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleSuccessClose() {
    setShowSuccessDialog(false);
    if (createdListingId) {
      window.location.href = `/travel/${createdListingId}`;
    } else {
      window.location.href = "/";
    }
  }

  async function handleCreateListing() {
    console.log("🚀 handleCreateListing called, current step:", currentStep);

    // Only submit if we're on the final review step
    if (currentStep !== STEPS.length) {
      console.log("❌ Not on final step, aborting");
      return;
    }

    console.log("✅ On final step, proceeding with creation");

    setSubmitting(true);
    setError(null);

    try {
      if (!user) throw new Error("You must be logged in to create a listing.");
      const rawSession = localStorage.getItem(
        "sb-tomxahjmbfkcrfszuhpo-auth-token"
      );
      const session = rawSession ? JSON.parse(rawSession) : null;
      const accessToken = session?.access_token;

      // First create the listing
      const res = await fetch("/api/create-listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          agentId: user.id,
          title: state.title,
          destination: state.destination,
          description: state.description,
          shortDescription: state.shortDescription,
          priceMin: state.priceMin === "" ? null : Number(state.priceMin),
          priceMax: state.priceMax === "" ? null : Number(state.priceMax),
          currency: state.currency,
          instantBookable: false,
          status: "draft",
          tags: state.tags,

          // Travel group fields
          startDate: state.startDate,
          endDate: state.endDate,
          maxGroupSize:
            state.maxGroupSize === "" ? null : Number(state.maxGroupSize),
          availableSpots:
            state.availableSpots === "" ? null : Number(state.availableSpots),
          ageRangeMin:
            state.ageRangeMin === "" ? null : Number(state.ageRangeMin),
          ageRangeMax:
            state.ageRangeMax === "" ? null : Number(state.ageRangeMax),
          difficulty: state.difficulty,
          includedItems: state.includedItems,
          notIncludedItems: state.notIncludedItems,
          itinerary: state.itinerary,
          cancellationPolicy: state.cancellationPolicy,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create listing");

      const listingId = data.listing.id;
      console.log("✅ Listing created successfully:", listingId);

      // Upload images if any
      if (images.length > 0) {
        console.log(`📸 Uploading ${images.length} images...`);

        const uploadPromises = images.map(async (image, index) => {
          if (image.file) {
            try {
              console.log(
                `⬆️  Uploading image ${index + 1}/${images.length}:`,
                image.file.name
              );

              const result = await uploadImage(image.file, listingId);
              console.log(`✅ Image uploaded to storage:`, result.path);

              // Save image metadata to database
              const imageRes = await fetch("/api/images", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  id: crypto.randomUUID(),
                  listingId,
                  url: result.url,
                  storagePath: result.path,
                  caption: image.caption,
                  displayOrder: image.displayOrder,
                }),
              });

              if (!imageRes.ok) {
                const errorData = await imageRes.json();
                throw new Error(
                  errorData.error || "Failed to save image metadata"
                );
              }

              const imageData = await imageRes.json();
              console.log(`✅ Image metadata saved to database:`, imageData);

              return { success: true, index };
            } catch (imgError: any) {
              console.error(
                `❌ Failed to upload image ${index + 1}:`,
                imgError
              );
              return { success: false, index, error: imgError.message };
            }
          }
        });

        const results = await Promise.allSettled(uploadPromises);
        const successful = results.filter(
          (r) => r.status === "fulfilled"
        ).length;
        console.log(
          `📊 Image upload complete: ${successful}/${images.length} successful`
        );
      }

      // Show success dialog
      setState(initialState);
      setImages([]);
      setCreatedListingId(data.id);
      setShowSuccessDialog(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 border-b border-rose-100">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] bg-[size:40px_40px]" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 shadow-xl mb-6 animate-in zoom-in-50 duration-500">
              <Plane className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
              Create Your Dream
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600">
                Travel Experience
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
              Share your unique travel listing with adventurers around the
              world. Fill in the details step by step, and we'll help you create
              something amazing.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 mb-12 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-slate-600">Average time</div>
                  <div className="font-bold text-slate-900">8 minutes</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-slate-600">Active hosts</div>
                  <div className="font-bold text-slate-900">1,247+</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-slate-600">Avg rating</div>
                  <div className="font-bold text-slate-900">4.8/5.0</div>
                </div>
              </div>
            </div>

            {/* Progress Bar - Enhanced */}
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Background track */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full" />
                {/* Progress fill */}
                <div
                  className="absolute top-5 left-0 h-1 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                  }}
                />

                {/* Step indicators */}
                <div className="relative flex justify-between">
                  {STEPS.map((step) => {
                    const StepIcon = step.icon;
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;

                    return (
                      <div key={step.id} className="flex flex-col items-center">
                        <div
                          className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCompleted
                              ? "bg-gradient-to-br from-green-500 to-green-600 shadow-lg scale-100"
                              : isCurrent
                              ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-2xl scale-110 ring-4 ring-rose-100"
                              : "bg-white border-2 border-slate-300 scale-90"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-white" />
                          ) : (
                            <StepIcon
                              className={`h-5 w-5 ${
                                isCurrent ? "text-white" : "text-slate-400"
                              }`}
                            />
                          )}
                          {isCurrent && (
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 opacity-20 animate-ping" />
                          )}
                        </div>
                        <span
                          className={`mt-3 text-xs font-medium transition-all hidden sm:block ${
                            isCurrent
                              ? "text-rose-600 scale-110"
                              : isCompleted
                              ? "text-green-600"
                              : "text-slate-400"
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step counter */}
              <div className="mt-6 text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">
                    Step
                  </span>
                  <span className="text-lg font-bold text-rose-600">
                    {currentStep}
                  </span>
                  <span className="text-sm text-slate-400">of</span>
                  <span className="text-sm font-medium text-slate-600">
                    {STEPS.length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="w-full max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Current Step Title Card */}
          <div className="text-center animate-in fade-in-50 slide-in-from-top-4 duration-500">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-xl mb-4">
              {(() => {
                const StepIcon = STEPS[currentStep - 1].icon;
                return <StepIcon className="h-6 w-6" />;
              })()}
              <span className="text-lg font-bold">
                {STEPS[currentStep - 1].title}
              </span>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {currentStep === 1 &&
                "Let's start with the basics. Give your travel experience a compelling title and description."}
              {currentStep === 2 &&
                "When does your adventure happen? Set the dates and pricing for travelers."}
              {currentStep === 3 &&
                "Help travelers know if this trip is right for them. Set group size and difficulty level."}
              {currentStep === 4 &&
                "Be transparent about what's included in your package and what's not."}
              {currentStep === 5 &&
                "Create a day-by-day breakdown of what travelers can expect."}
              {currentStep === 6 &&
                "A picture is worth a thousand words. Add stunning photos to showcase your experience."}
              {currentStep === 7 &&
                "Almost there! Review everything and hit that create button."}
            </p>
          </div>

          {/* Form Card with Step Content */}
          <Card className="border-2 border-slate-200 shadow-xl rounded-3xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-500">
            <CardContent className="p-8 sm:p-12">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in-50 duration-500">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Travel Title <span className="text-rose-600">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={state.title}
                        onChange={(e) => update("title", e.target.value)}
                        placeholder="e.g., Bali Surf & Yoga Retreat"
                        required
                        className="text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="destination"
                        className="text-sm font-medium"
                      >
                        Destination <span className="text-rose-600">*</span>
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="destination"
                          value={state.destination}
                          onChange={(e) =>
                            update("destination", e.target.value)
                          }
                          placeholder="e.g., Uluwatu, Bali"
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="shortDescription"
                        className="text-sm font-medium"
                      >
                        Short Description{" "}
                        <span className="text-rose-600">*</span>
                      </Label>
                      <Input
                        id="shortDescription"
                        value={state.shortDescription}
                        onChange={(e) =>
                          update("shortDescription", e.target.value)
                        }
                        placeholder="A catchy one-liner about your trip"
                        required
                        maxLength={100}
                      />
                      <p className="text-xs text-slate-500">
                        {state.shortDescription.length}/100 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium"
                      >
                        Full Description{" "}
                        <span className="text-rose-600">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={state.description}
                        onChange={(e) => update("description", e.target.value)}
                        placeholder="Describe your travel experience in detail..."
                        required
                        rows={6}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_TAGS.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                              state.tags.includes(tag)
                                ? "bg-rose-500 text-white shadow-md"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Dates & Pricing */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in-50 duration-500">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Start Date <span className="text-rose-600">*</span>
                      </Label>
                      <Popover
                        open={startDateOpen}
                        onOpenChange={setStartDateOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !state.startDate && "text-muted-foreground"
                            )}
                          >
                            {state.startDate ? (
                              format(new Date(state.startDate), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={
                              state.startDate
                                ? new Date(state.startDate)
                                : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                update("startDate", format(date, "yyyy-MM-dd"));
                                setStartDateOpen(false);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        End Date <span className="text-rose-600">*</span>
                      </Label>
                      <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !state.endDate && "text-muted-foreground"
                            )}
                          >
                            {state.endDate ? (
                              format(new Date(state.endDate), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={
                              state.endDate
                                ? new Date(state.endDate)
                                : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                update("endDate", format(date, "yyyy-MM-dd"));
                                setEndDateOpen(false);
                              }
                            }}
                            initialFocus
                            disabled={(date) =>
                              state.startDate
                                ? date < new Date(state.startDate)
                                : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="priceMin" className="text-sm font-medium">
                        Price <span className="text-rose-600">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-green-600">
                          RM
                        </span>
                        <Input
                          id="priceMin"
                          type="number"
                          min={0}
                          value={state.priceMin}
                          onChange={(e) =>
                            update(
                              "priceMin",
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                          placeholder="999"
                          required
                          className="pl-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm font-medium">
                        Currency
                      </Label>
                      <select
                        id="currency"
                        value={state.currency}
                        onChange={(e) => update("currency", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="USD">USD</option>
                        <option value="MYR">MYR</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Duration</Label>
                      <div className="px-3 py-2 bg-slate-100 rounded-md text-slate-700">
                        {state.startDate && state.endDate
                          ? `${Math.ceil(
                              (new Date(state.endDate).getTime() -
                                new Date(state.startDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )} days`
                          : "Select dates"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Group Details */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in-50 duration-500">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="maxGroupSize"
                        className="text-sm font-medium"
                      >
                        Max Group Size <span className="text-rose-600">*</span>
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="maxGroupSize"
                          type="number"
                          min={1}
                          value={state.maxGroupSize}
                          onChange={(e) =>
                            update(
                              "maxGroupSize",
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                          placeholder="12"
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="availableSpots"
                        className="text-sm font-medium"
                      >
                        Available Spots <span className="text-rose-600">*</span>
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="availableSpots"
                          type="number"
                          min={0}
                          value={state.availableSpots}
                          onChange={(e) =>
                            update(
                              "availableSpots",
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                          placeholder="10"
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="ageRangeMin"
                        className="text-sm font-medium"
                      >
                        Minimum Age
                      </Label>
                      <Input
                        id="ageRangeMin"
                        type="number"
                        min={0}
                        value={state.ageRangeMin}
                        onChange={(e) =>
                          update(
                            "ageRangeMin",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="18"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="ageRangeMax"
                        className="text-sm font-medium"
                      >
                        Maximum Age
                      </Label>
                      <Input
                        id="ageRangeMax"
                        type="number"
                        min={0}
                        value={state.ageRangeMax}
                        onChange={(e) =>
                          update(
                            "ageRangeMax",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="65"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-sm font-medium">
                      Activity Level <span className="text-rose-600">*</span>
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {["easy", "moderate", "challenging"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => update("difficulty", level)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            state.difficulty === level
                              ? "border-rose-500 bg-rose-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <Activity
                            className={`h-6 w-6 mx-auto mb-2 ${
                              state.difficulty === level
                                ? "text-rose-500"
                                : "text-slate-400"
                            }`}
                          />
                          <div className="text-sm font-medium capitalize">
                            {level}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: What's Included */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in-50 duration-500">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">
                        What's Included
                      </Label>
                      <Button
                        type="button"
                        onClick={addIncludedItem}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {state.includedItems.map((item, index) => (
                        <div
                          key={index}
                          className="border border-slate-200 rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start gap-3">
                            <CheckSquare className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="flex-1 space-y-2">
                              <Input
                                value={item.title}
                                onChange={(e) =>
                                  updateIncludedItem(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Accommodation"
                                className="font-medium"
                              />
                              <Input
                                value={item.description}
                                onChange={(e) =>
                                  updateIncludedItem(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., 7 nights in shared rooms"
                                className="text-sm"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeIncludedItem(index)}
                              size="sm"
                              variant="ghost"
                              className="text-rose-600 hover:text-rose-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">
                        Not Included
                      </Label>
                      <Button
                        type="button"
                        onClick={addNotIncludedItem}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {state.notIncludedItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <XSquare className="h-5 w-5 text-slate-400" />
                          <Input
                            value={item}
                            onChange={(e) =>
                              updateNotIncludedItem(index, e.target.value)
                            }
                            placeholder="e.g., International flights"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => removeNotIncludedItem(index)}
                            size="sm"
                            variant="ghost"
                            className="text-rose-600 hover:text-rose-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="cancellationPolicy"
                      className="text-sm font-medium"
                    >
                      Cancellation Policy
                    </Label>
                    <Textarea
                      id="cancellationPolicy"
                      value={state.cancellationPolicy}
                      onChange={(e) =>
                        update("cancellationPolicy", e.target.value)
                      }
                      placeholder="Describe your cancellation policy..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Itinerary */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in-50 duration-500">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">
                      Day-by-Day Itinerary
                    </Label>
                    <Button
                      type="button"
                      onClick={addItineraryDay}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Day
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {state.itinerary.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                        <List className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No itinerary added yet</p>
                        <Button
                          type="button"
                          onClick={addItineraryDay}
                          size="sm"
                          variant="outline"
                          className="mt-4"
                        >
                          Add First Day
                        </Button>
                      </div>
                    ) : (
                      state.itinerary.map((day, index) => (
                        <div
                          key={index}
                          className="border border-slate-200 rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                              {day.day}
                            </div>
                            <div className="flex-1 space-y-2">
                              <Input
                                value={day.title}
                                onChange={(e) =>
                                  updateItinerary(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Arrival & Welcome"
                                className="font-medium"
                              />
                              <Textarea
                                value={day.description}
                                onChange={(e) =>
                                  updateItinerary(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Describe the day's activities..."
                                rows={3}
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeItineraryDay(index)}
                              size="sm"
                              variant="ghost"
                              className="text-rose-600 hover:text-rose-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Step 6: Photos */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-in fade-in-50 duration-500">
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">
                      Property Images
                    </Label>
                    <p className="text-sm text-slate-600">
                      Add high-quality photos to showcase your travel experience
                    </p>
                  </div>
                  <ImageUploader onImagesChange={setImages} maxImages={10} />
                </div>
              )}

              {/* Step 7: Review */}
              {currentStep === 7 && (
                <div className="space-y-6 animate-in fade-in-50 duration-500">
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                          Review Your Listing
                        </h3>
                        <p className="text-sm text-slate-600">
                          Please review all the information before submitting.
                          Your listing will be saved as a draft and reviewed by
                          our team.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border border-slate-200 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Basic Information
                      </h4>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-600">Title:</dt>
                          <dd className="font-medium">
                            {state.title || "Not set"}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-600">Destination:</dt>
                          <dd className="font-medium">
                            {state.destination || "Not set"}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-600">Tags:</dt>
                          <dd className="font-medium">
                            {state.tags.length} selected
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Dates & Pricing
                      </h4>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-600">Dates:</dt>
                          <dd className="font-medium">
                            {state.startDate && state.endDate
                              ? `${state.startDate} to ${state.endDate}`
                              : "Not set"}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-600">Price:</dt>
                          <dd className="font-medium">
                            {state.priceMin
                              ? `${state.currency} ${state.priceMin}`
                              : "Not set"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Group Details
                      </h4>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-600">Group Size:</dt>
                          <dd className="font-medium">
                            {state.maxGroupSize} people max
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-600">Available Spots:</dt>
                          <dd className="font-medium">
                            {state.availableSpots} spots
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-600">Age Range:</dt>
                          <dd className="font-medium">
                            {state.ageRangeMin}-{state.ageRangeMax} years
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-600">Difficulty:</dt>
                          <dd className="font-medium capitalize">
                            {state.difficulty}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Additional Info
                      </h4>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-600">Included Items:</dt>
                          <dd className="font-medium">
                            {state.includedItems.length} items
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-600">Not Included:</dt>
                          <dd className="font-medium">
                            {state.notIncludedItems.length} items
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-600">Itinerary Days:</dt>
                          <dd className="font-medium">
                            {state.itinerary.length} days
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-600">Photos:</dt>
                          <dd className="font-medium">
                            {images.length} uploaded
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <Alert
                  variant="destructive"
                  className="animate-in fade-in-50 border-2"
                >
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="text-base">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Navigation Buttons - Enhanced */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t-2 border-slate-200">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    onClick={prevStep}
                    disabled={submitting}
                    variant="outline"
                    size="lg"
                    className="gap-2 px-6 border-2 hover:border-slate-400 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-semibold">Previous</span>
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Continue button clicked");
                      nextStep();
                    }}
                    disabled={submitting}
                    size="lg"
                    className="gap-2 px-8 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    <span className="font-semibold">Continue</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Create Listing button clicked");
                      handleCreateListing();
                    }}
                    disabled={submitting}
                    size="lg"
                    className="gap-3 px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-2xl transition-all text-lg"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin text-xl">⏳</span>
                        <span className="font-bold">Creating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-6 w-6" />
                        <span className="font-bold">Create Listing</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Helpful Tips Section */}
          {/* {currentStep < STEPS.length && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 animate-in fade-in-50 duration-500 delay-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">💡 Pro Tip</h3>
                  <p className="text-sm text-slate-700">
                    {currentStep === 1 &&
                      "Use descriptive and engaging language. Think about what makes your trip unique and exciting!"}
                    {currentStep === 2 &&
                      "Competitive pricing attracts more bookings. Research similar trips in your area for reference."}
                    {currentStep === 3 &&
                      "Be realistic about fitness requirements to set proper expectations for travelers."}
                    {currentStep === 4 &&
                      "Clear transparency builds trust. List everything that's included to avoid surprises."}
                    {currentStep === 5 &&
                      "A detailed itinerary helps travelers visualize their adventure. Include highlights for each day!"}
                    {currentStep === 6 &&
                      "High-quality photos increase bookings by 3x! Use natural lighting and show diverse perspectives."}
                  </p>
                </div>
              </div>
            </div>
          )} */}

          {/* Help Cards Section - Three Column Layout */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {/* Pro Tip Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">💡 Pro Tip</h3>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {currentStep === 1 &&
                  "Use descriptive and engaging language. Think about what makes your trip unique and exciting!"}
                {currentStep === 2 &&
                  "Competitive pricing attracts more bookings. Research similar trips in your area for reference."}
                {currentStep === 3 &&
                  "Be realistic about fitness requirements to set proper expectations for travelers."}
                {currentStep === 4 &&
                  "Clear transparency builds trust. List everything that's included to avoid surprises."}
                {currentStep === 5 &&
                  "A detailed itinerary helps travelers visualize their adventure. Include highlights for each day!"}
                {currentStep === 6 &&
                  "High-quality photos increase bookings by 3x! Use natural lighting and show diverse perspectives."}
                {currentStep === 7 &&
                  "Review everything carefully before submitting. You can always edit later!"}
              </p>
            </div>

            {/* Hosting Tips Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  🌟 Hosting Tips
                </h3>
              </div>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Respond to inquiries within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Update your calendar regularly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Keep listing details accurate and current</span>
                </li>
              </ul>
            </div>

            {/* Need Help Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  💬 Need Help?
                </h3>
              </div>
              <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                Our support team is here to help you create the perfect listing.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-2 border-amber-300 hover:bg-amber-100 hover:border-amber-400 transition-colors"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-lg border-t-4 border-t-green-500">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-xl animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-slate-900">
              🎉 Listing Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Your travel listing has been created and saved as a{" "}
              <span className="font-semibold text-slate-700">draft</span>.
              <br />
              <br />
              Our team will review it shortly. You can now view it on the
              explore page.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 my-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">
              ✨ What's Next?
            </h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Your listing will be reviewed within 24 hours</li>
              <li>• Add more details to stand out</li>
              <li>• Share your listing with travelers</li>
            </ul>
          </div>
          <DialogFooter className="sm:justify-center gap-3">
            <Button
              onClick={handleSuccessClose}
              className="w-full sm:w-auto min-w-[140px] bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
            >
              View Listings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
