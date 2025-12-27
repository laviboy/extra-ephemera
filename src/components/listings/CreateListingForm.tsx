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
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Create New Listing
          </CardTitle>
          <CardDescription>
            Fill in the details below to create a new property listing. All
            fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Property Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={state.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="e.g., Luxury Beachfront Villa with Ocean Views"
                    required
                    className="transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">
                    Destination <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="destination"
                    value={state.destination}
                    onChange={(e) => update("destination", e.target.value)}
                    placeholder="e.g., Bali, Indonesia"
                    required
                    className="transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Capacity Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Pricing & Capacity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price per Night (USD){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      className="pl-10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">
                    Maximum Guests <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      className="pl-10 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Availability
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    Available From <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={state.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                    required
                    className="transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    Available Until <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={state.endDate}
                    onChange={(e) => update("endDate", e.target.value)}
                    required
                    className="transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={state.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe your property, including amenities, nearby attractions, and what makes it special..."
                  rows={6}
                  className="resize-none transition-all"
                />
                <p className="text-sm text-muted-foreground">
                  {state.description.length} characters
                </p>
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
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setState(initialState)}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                Reset Form
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto min-w-[140px]"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Creating...
                  </>
                ) : (
                  "Create Listing"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">
              Listing Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your property listing has been created and saved as a draft. You
              can now view it on the home page or continue editing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleSuccessClose}
              className="w-full sm:w-auto min-w-[120px]"
            >
              Go to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
