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
  Image,
  Sparkles,
  Plane,
} from "lucide-react";

type FormState = {
  title: string;
  destination: string;
  price: number | "";
  startDate: string;
  endDate: string;
  guests: number | "";
  description: string;
};

const initialState: FormState = {
  title: "",
  destination: "",
  price: "",
  startDate: "",
  endDate: "",
  guests: "",
  description: "",
};

export default function CreateListingForm() {
  const [state, setState] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const user = useAuth((s) => s.user);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function handleSuccessClose() {
    setShowSuccessDialog(false);
    window.location.href = "/";
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!user) throw new Error("You must be logged in to create a listing.");
      const rawSession = localStorage.getItem(
        "sb-tomxahjmbfkcrfszuhpo-auth-token"
      );
      const session = rawSession ? JSON.parse(rawSession) : null;
      const accessToken = session?.access_token;

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
          priceMin: state.price === "" ? null : Number(state.price),
          priceMax: state.price === "" ? null : Number(state.price),
          instantBookable: false,
          status: "draft",
          tags: [],

          // send extra form fields (even though not in DB yet)
          startDate: state.startDate,
          endDate: state.endDate,
          guests: state.guests === "" ? null : Number(state.guests),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create listing");

      // Show success dialog
      setState(initialState);
      setShowSuccessDialog(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Card className="w-full shadow-lg border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 h-2"></div>
        <CardHeader className="space-y-3 bg-slate-50/50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Travel Listing Details
              </CardTitle>
              <CardDescription className="text-slate-600">
                All fields marked with{" "}
                <span className="text-rose-600 font-medium">*</span> are
                required
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={onSubmit} className="space-y-10">
            {/* Basic Information Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Basic Information
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tell us about your travel listing
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-slate-700"
                  >
                    Travel Listing Title{" "}
                    <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={state.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="e.g., Luxury Beachfront Villa with Ocean Views"
                    required
                    className="transition-all border-slate-300 focus:border-rose-500 focus:ring-rose-500"
                  />
                  <p className="text-xs text-slate-500">
                    Choose a descriptive and appealing title
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="destination"
                    className="text-sm font-medium text-slate-700"
                  >
                    Destination <span className="text-rose-600">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="destination"
                      value={state.destination}
                      onChange={(e) => update("destination", e.target.value)}
                      placeholder="e.g., Bali, Indonesia"
                      required
                      className="pl-10 transition-all border-slate-300 focus:border-rose-500 focus:ring-rose-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    City, Country or Region
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing & Capacity Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Pricing & Capacity
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set your rates and guest limits
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="price"
                    className="text-sm font-medium text-slate-700"
                  >
                    Price per Night (USD){" "}
                    <span className="text-rose-600">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      step="0.01"
                      value={state.price}
                      onChange={(e) =>
                        update(
                          "price",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="250.00"
                      required
                      className="pl-10 transition-all border-slate-300 focus:border-green-500 focus:ring-green-500 font-medium"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Average rate for similar properties: $150-300
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="guests"
                    className="text-sm font-medium text-slate-700"
                  >
                    Maximum Guests <span className="text-rose-600">*</span>
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      value={state.guests}
                      onChange={(e) =>
                        update(
                          "guests",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="4"
                      required
                      className="pl-10 transition-all border-slate-300 focus:border-blue-500 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Maximum number of people your property can accommodate
                  </p>
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Availability
                  </h3>
                  <p className="text-xs text-slate-500">
                    When is your property available?
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="startDate"
                    className="text-sm font-medium text-slate-700"
                  >
                    Available From <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={state.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="transition-all border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500">
                    Start date of availability
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="endDate"
                    className="text-sm font-medium text-slate-700"
                  >
                    Available Until <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={state.endDate}
                    onChange={(e) => update("endDate", e.target.value)}
                    min={
                      state.startDate || new Date().toISOString().split("T")[0]
                    }
                    required
                    className="transition-all border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500">
                    End date of availability
                  </p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Property Description
                  </h3>
                  <p className="text-xs text-slate-500">
                    Help guests imagine their stay
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-700"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={state.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe your property in detail...\n\n• What makes your property unique?\n• What amenities do you offer?\n• What's nearby? (beaches, restaurants, attractions)\n• What's your space like? (rooms, layout, views)\n• Any house rules or important information?"
                  rows={8}
                  className="resize-none transition-all border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Write a detailed description to attract more guests
                  </p>
                  <p className="text-xs font-medium text-slate-600">
                    {state.description.length} characters
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="animate-in fade-in-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 bg-slate-50/50 -mx-6 px-6 py-4 mt-8 rounded-b-xl">
              <div className="text-sm text-slate-600 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-500" />
                <span>Your listing will be reviewed before going live</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setState(initialState)}
                  disabled={submitting}
                  className="w-full sm:w-auto border-slate-300 hover:bg-slate-100"
                >
                  Reset Form
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto min-w-[160px] bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Listing
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-lg border-t-4 border-t-green-500">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-xl">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-slate-900">
              🎉 Listing Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Your property listing has been created and saved as a{" "}
              <span className="font-semibold text-slate-700">draft</span>.
              <br />
              <br />
              Our team will review it shortly. You can now view it on the home
              page or make additional edits.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 my-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">
              ✨ What's Next?
            </h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Add photos to make your listing stand out</li>
              <li>• Complete your host profile</li>
              <li>• Set up instant booking preferences</li>
            </ul>
          </div>
          <DialogFooter className="sm:justify-center gap-3">
            <Button
              onClick={handleSuccessClose}
              className="w-full sm:w-auto min-w-[140px] bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
            >
              View My Listings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
