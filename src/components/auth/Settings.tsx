import { useState, useEffect } from "react";
import { useAuth } from "../../stores/useAuth";
import { getSupabase } from "../../lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  User,
  Mail,
  CreditCard,
  MapPin,
  Bell,
  Shield,
  Globe,
  Camera,
  Save,
  Building2,
  Phone,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  Smartphone,
  Laptop,
  Eye,
  EyeOff,
  Trash2,
  Plus,
} from "lucide-react";

type SettingsSection =
  | "profile"
  | "payment"
  | "address"
  | "notifications"
  | "security"
  | "preferences";

export default function Settings() {
  const user = useAuth((s) => s.user);
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Real data from Supabase
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    role: "traveler" as "traveler" | "agent" | "admin",
    phone: "",
    bio: "",
    company: "",
    website: "",
  });

  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    tripReminders: true,
    groupUpdates: true,
  });

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const supabase = getSupabase();

        // Fetch user data from users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (userError) throw userError;

        // Fetch profile data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        // Update profile data state
        setProfileData({
          fullName: userData?.name || "",
          email: userData?.email || "",
          role: userData?.role || "traveler",
          phone: userData?.phone || "",
          bio: profileData?.bio || "",
          company: "",
          website: "",
        });

        // You can add more data fetching for address, etc.
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-slate-500">
              Please log in to access settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sidebarItems: {
    id: SettingsSection;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    {
      id: "payment",
      label: "Payment Methods",
      icon: <CreditCard className="h-4 w-4" />,
    },
    { id: "address", label: "Address", icon: <MapPin className="h-4 w-4" /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
    },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
    {
      id: "preferences",
      label: "Preferences",
      icon: <Globe className="h-4 w-4" />,
    },
  ];

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      const supabase = getSupabase();

      // Update users table
      const { error: userError } = await supabase
        .from("users")
        .update({
          name: profileData.fullName,
          phone: profileData.phone,
        })
        .eq("id", user.id);

      if (userError) throw userError;

      // Update or insert profile data
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: user.id,
        display_name: profileData.fullName,
        bio: profileData.bio,
      });

      if (profileError) throw profileError;

      // Update the auth store
      const { setUser } = useAuth.getState();
      setUser({
        ...user,
        name: profileData.fullName,
        role: profileData.role,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (user.name || user.email || "").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header Section */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
              <p className="mt-1 text-slate-600">
                Manage your account preferences and security
              </p>
            </div>
            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-700 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Changes saved!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            {/* Navigation */}
            <Card className="shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        activeSection === item.id
                          ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md"
                          : "text-slate-700 hover:bg-slate-50 hover:text-rose-600"
                      }`}
                    >
                      <div
                        className={
                          activeSection === item.id
                            ? "text-white"
                            : "text-slate-400"
                        }
                      >
                        {item.icon}
                      </div>
                      <span>{item.label}</span>
                      {activeSection === item.id && (
                        <ArrowRight className="ml-auto h-4 w-4" />
                      )}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Agent CRM Access - Only shown for agents */}
            {profileData.role === "agent" && (
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
                    <LayoutDashboard className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 font-bold text-slate-900">Agent CRM</h3>
                  <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                    Access your professional dashboard to manage leads,
                    bookings, and client communications.
                  </p>
                  <a href="/crm">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-md">
                      Open Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Become Agent Promotion - Only shown for non-agents */}
            {profileData.role !== "agent" && (
              <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-md">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="mb-3 bg-amber-100 text-amber-700 border-0">
                    💼 Limited Offer
                  </Badge>
                  <h3 className="mb-2 font-bold text-slate-900">
                    Become a Travel Agent
                  </h3>
                  <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                    Turn your passion into profit. Join our network and earn up
                    to 25% commission on every booking.
                  </p>
                  <a href="/become-agent">
                    <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Account Status Card */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md">
              <CardContent className="p-6">
                <h3 className="mb-3 font-semibold text-slate-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Account Health
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Profile Completion</span>
                    <span className="font-semibold text-green-700">85%</span>
                  </div>
                  <div className="h-2 rounded-full bg-green-200 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 w-[85%]"></div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      <span>Email verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      <span>Profile complete</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      <span>2FA enabled</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeSection === "profile" && (
              <Card className="shadow-lg border-2">
                <div className="h-2 bg-gradient-to-r from-rose-500 to-pink-600"></div>
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Profile Information
                      </CardTitle>
                      <CardDescription>
                        Update your personal details and public profile
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-600 text-3xl font-bold text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border-2 border-slate-200 shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors">
                        <Camera className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-slate-900">
                        Profile Photo
                      </h3>
                      <p className="text-sm text-slate-600">
                        This will be displayed on your profile and visible to
                        other travelers.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Camera className="h-4 w-4" />
                          Upload Photo
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        JPG, GIF or PNG. Max size of 2MB.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-rose-500" />
                      Personal Information
                    </h3>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="fullName"
                          className="text-sm font-medium text-slate-700"
                        >
                          Full Name <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="fullName"
                            value={profileData.fullName}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                fullName: e.target.value,
                              })
                            }
                            placeholder="Your full name"
                            className="pl-10 border-slate-300 focus:border-rose-500 focus:ring-rose-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-slate-700"
                        >
                          Email <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                email: e.target.value,
                              })
                            }
                            placeholder="your@email.com"
                            className="pl-10 border-slate-300 focus:border-rose-500 focus:ring-rose-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium text-slate-700"
                        >
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+1 (555) 000-0000"
                            className="pl-10 border-slate-300 focus:border-rose-500 focus:ring-rose-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="company"
                          className="text-sm font-medium text-slate-700"
                        >
                          Company
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="company"
                            value={profileData.company}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                company: e.target.value,
                              })
                            }
                            placeholder="Your company"
                            className="pl-10 border-slate-300 focus:border-rose-500 focus:ring-rose-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Account Role
                      </Label>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border">
                        <Badge className="bg-gradient-to-r from-rose-500 to-pink-600 text-white border-0">
                          {profileData.role}
                        </Badge>
                        <span className="text-sm text-slate-600">
                          {profileData.role === "agent"
                            ? "You have access to agent features and CRM tools"
                            : "Standard traveler account"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="website"
                        className="text-sm font-medium text-slate-700"
                      >
                        Website
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="website"
                          value={profileData.website}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              website: e.target.value,
                            })
                          }
                          placeholder="www.yourwebsite.com"
                          className="pl-10 border-slate-300 focus:border-rose-500 focus:ring-rose-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="bio"
                        className="text-sm font-medium text-slate-700"
                      >
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                        placeholder="Tell travelers about yourself, your interests, and travel experiences..."
                        rows={5}
                        className="resize-none border-slate-300 focus:border-rose-500 focus:ring-rose-500"
                      />
                      <p className="text-xs text-slate-500">
                        {profileData.bio.length} characters • Share your story
                        with the community
                      </p>
                    </div>
                  </div>

                  {saveError && (
                    <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900">
                          Error saving changes
                        </p>
                        <p className="text-sm text-red-700 mt-1">{saveError}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
                    <p className="text-sm text-slate-500">
                      Last updated: {new Date().toLocaleDateString()}
                    </p>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => {
                          /* Reset form */
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md gap-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "payment" && (
              <Card className="shadow-lg border-2">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Payment Methods</CardTitle>
                      <CardDescription>
                        Manage your payment options and billing information
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Saved Cards */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-green-500" />
                      Saved Payment Methods
                    </h3>
                    <div className="space-y-3">
                      <div className="group flex items-center justify-between rounded-xl border-2 border-slate-200 p-5 hover:border-green-300 hover:bg-green-50/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                            <span className="text-white font-bold text-xs">
                              VISA
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              Visa ending in 4242
                            </p>
                            <p className="text-sm text-slate-500">
                              Expires 12/2026 • Primary card
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-700 border-0">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Edit
                          </Button>
                        </div>
                      </div>

                      <div className="group flex items-center justify-between rounded-xl border-2 border-slate-200 p-5 hover:border-orange-300 hover:bg-orange-50/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-md">
                            <span className="text-white font-bold text-[10px]">
                              MC
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              Mastercard ending in 8888
                            </p>
                            <p className="text-sm text-slate-500">
                              Expires 06/2025 • Backup card
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-2 border-dashed border-slate-300 hover:border-green-500 hover:bg-green-50 transition-all"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-500" />
                      Billing Information
                    </h3>
                    <div className="space-y-2">
                      <Label
                        htmlFor="billingEmail"
                        className="text-sm font-medium text-slate-700"
                      >
                        Billing Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="billingEmail"
                          type="email"
                          defaultValue={user.email}
                          placeholder="billing@example.com"
                          className="pl-10 border-slate-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Receipts and invoices will be sent to this email
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md">
                      <Save className="h-4 w-4 mr-2" />
                      Save Payment Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "address" && (
              <Card className="shadow-lg border-2">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-600"></div>
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Address Information
                      </CardTitle>
                      <CardDescription>
                        Manage your shipping and billing address
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-6">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      Primary Address
                    </h3>

                    <div className="space-y-2">
                      <Label
                        htmlFor="street"
                        className="text-sm font-medium text-slate-700"
                      >
                        Street Address <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="street"
                        value={addressData.street}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            street: e.target.value,
                          })
                        }
                        placeholder="123 Main Street, Apt 4B"
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="city"
                          className="text-sm font-medium text-slate-700"
                        >
                          City <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="city"
                          value={addressData.city}
                          onChange={(e) =>
                            setAddressData({
                              ...addressData,
                              city: e.target.value,
                            })
                          }
                          placeholder="San Francisco"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="state"
                          className="text-sm font-medium text-slate-700"
                        >
                          State / Province{" "}
                          <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="state"
                          value={addressData.state}
                          onChange={(e) =>
                            setAddressData({
                              ...addressData,
                              state: e.target.value,
                            })
                          }
                          placeholder="California"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="zipCode"
                          className="text-sm font-medium text-slate-700"
                        >
                          ZIP / Postal Code{" "}
                          <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="zipCode"
                          value={addressData.zipCode}
                          onChange={(e) =>
                            setAddressData({
                              ...addressData,
                              zipCode: e.target.value,
                            })
                          }
                          placeholder="94102"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="country"
                          className="text-sm font-medium text-slate-700"
                        >
                          Country <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="country"
                          value={addressData.country}
                          onChange={(e) =>
                            setAddressData({
                              ...addressData,
                              country: e.target.value,
                            })
                          }
                          placeholder="United States"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                      <div className="flex gap-3">
                        <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Important Information
                          </p>
                          <p className="text-sm text-blue-700 mt-1">
                            This address will be used for shipping physical
                            items and may be displayed on invoices.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-md gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Address
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "notifications" && (
              <Card className="shadow-lg border-2">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-600"></div>
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>
                        Choose how and when you want to be notified
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="space-y-0.5">
                          <Label className="font-semibold text-slate-900 cursor-pointer">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-slate-600">
                            Receive updates and alerts via email
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailNotifications: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="space-y-0.5">
                          <Label className="font-semibold text-slate-900 cursor-pointer">
                            Push Notifications
                          </Label>
                          <p className="text-sm text-slate-600">
                            Receive push notifications on your devices
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            pushNotifications: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="space-y-0.5">
                          <Label className="font-semibold text-slate-900 cursor-pointer">
                            SMS Notifications
                          </Label>
                          <p className="text-sm text-slate-600">
                            Receive text messages for important updates
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.smsNotifications}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            smsNotifications: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border hover:bg-slate-100 transition-colors">
                      <div className="space-y-0.5">
                        <Label className="font-semibold text-slate-900 cursor-pointer">
                          Marketing Emails
                        </Label>
                        <p className="text-sm text-slate-600">
                          Receive promotional content and special offers
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.marketingEmails}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            marketingEmails: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border hover:bg-slate-100 transition-colors">
                      <div className="space-y-0.5">
                        <Label className="font-semibold text-slate-900 cursor-pointer">
                          Trip Reminders
                        </Label>
                        <p className="text-sm text-slate-600">
                          Get reminders before your upcoming trips
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.tripReminders}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            tripReminders: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border hover:bg-slate-100 transition-colors">
                      <div className="space-y-0.5">
                        <Label className="font-semibold text-slate-900 cursor-pointer">
                          Group Updates
                        </Label>
                        <p className="text-sm text-slate-600">
                          Notifications about your travel groups and activities
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.groupUpdates}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            groupUpdates: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-md gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">
                        Change Password
                      </h3>
                      <p className="text-sm text-slate-500 mb-3">
                        Update your password regularly to keep your account
                        secure
                      </p>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">
                            Current Password
                          </Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Confirm New Password
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium text-slate-900">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-slate-500 mb-3">
                        Add an extra layer of security to your account
                      </p>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-slate-900">
                              2FA Enabled
                            </p>
                            <p className="text-sm text-slate-500">
                              Using authenticator app
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium text-slate-900">
                        Active Sessions
                      </h3>
                      <p className="text-sm text-slate-500 mb-3">
                        Manage your active sessions across devices
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              MacBook Pro • San Francisco, US
                            </p>
                            <p className="text-xs text-slate-500">
                              Current session • Active now
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              iPhone 14 • San Francisco, US
                            </p>
                            <p className="text-xs text-slate-500">
                              Last active 2 hours ago
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Revoke
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Update Password"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "preferences" && (
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Input
                        id="language"
                        defaultValue="English (US)"
                        placeholder="Select language"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        defaultValue="PST (UTC-8)"
                        placeholder="Select timezone"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        defaultValue="USD ($)"
                        placeholder="Select currency"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show profile to public</Label>
                        <p className="text-sm text-slate-500">
                          Allow others to see your profile
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show email address</Label>
                        <p className="text-sm text-slate-500">
                          Display your email on your profile
                        </p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 rounded" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Preferences"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
