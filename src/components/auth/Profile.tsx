import { useAuth } from "../../stores/useAuth";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Mail,
  User,
  Calendar,
  Shield,
  MapPin,
  Phone,
  Globe,
  Building2,
  CreditCard,
  Bell,
  Lock,
  Plane,
  Users,
  ArrowRight,
} from "lucide-react";
import type { TravelGroup } from "../../data/travelGroups";

export default function Profile() {
  const user = useAuth((s) => s.user);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-slate-500">
              Please log in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = (user.name || user.email || "").slice(0, 2).toUpperCase();

  // Mock data for demonstration
  const mockData = {
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "www.example.com",
    company: "Tech Solutions Inc.",
    joinDate: "January 2024",
    accountType: "Premium",
    lastLogin: "December 27, 2025",
    language: "English (US)",
    timezone: "PST (UTC-8)",
  };

  // Mock joined travel groups
  const joinedGroups: (TravelGroup & {
    joinedDate: string;
    status: "upcoming" | "completed";
  })[] = [
    {
      id: "tg-001",
      slug: "bali-surf-and-yoga-retreat",
      title: "Bali Surf & Yoga Retreat",
      destination: "Uluwatu, Bali",
      startDate: "2026-02-05",
      endDate: "2026-02-12",
      seatsLeft: 4,
      priceUsd: 1299,
      coverUrl: "https://picsum.photos/seed/bali/800/600",
      shortDescription:
        "Sunrise yoga, beginner-friendly surf lessons, and clifftop sunsets.",
      tags: ["wellness", "beach", "surf"],
      joinedDate: "2025-12-10",
      status: "upcoming",
    },
    {
      id: "tg-002",
      slug: "kyoto-cherry-blossom-walks",
      title: "Kyoto Cherry Blossom Walks",
      destination: "Kyoto, Japan",
      startDate: "2026-03-28",
      endDate: "2026-04-03",
      seatsLeft: 8,
      priceUsd: 1590,
      coverUrl: "https://picsum.photos/seed/kyoto/800/600",
      shortDescription:
        "Temples, tea ceremonies, and hanami picnics under sakura trees.",
      tags: ["culture", "city", "spring"],
      joinedDate: "2025-11-20",
      status: "upcoming",
    },
    {
      id: "tg-007",
      slug: "patagonia-hiking-expedition",
      title: "Patagonia Hiking Expedition",
      destination: "Torres del Paine, Chile",
      startDate: "2025-10-15",
      endDate: "2025-10-22",
      seatsLeft: 0,
      priceUsd: 2100,
      coverUrl: "https://picsum.photos/seed/patagonia/800/600",
      shortDescription:
        "Epic mountain trails, glaciers, and wilderness camping.",
      tags: ["adventure", "hiking", "nature"],
      joinedDate: "2025-08-05",
      status: "completed",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-rose-100 text-2xl font-semibold text-rose-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Badge variant="secondary" className="text-xs">
                {mockData.accountType}
              </Badge>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {user.name || "User"}
                </h1>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">
                    Joined {mockData.joinDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">
                    Last login: {mockData.lastLogin}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travel Groups Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-rose-500" />
                My Travel Groups
              </CardTitle>
              <CardDescription>
                Groups you've joined -{" "}
                {joinedGroups.filter((g) => g.status === "upcoming").length}{" "}
                upcoming,{" "}
                {joinedGroups.filter((g) => g.status === "completed").length}{" "}
                completed
              </CardDescription>
            </div>
            <a
              href="/travel"
              className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {joinedGroups.map((group) => (
              <a
                key={group.id}
                href={`/travel/${group.slug}`}
                className="flex gap-4 rounded-lg border p-4 transition-all hover:border-rose-200 hover:bg-rose-50/50"
              >
                {/* Cover Image */}
                <div className="h-24 w-32 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  <img
                    src={group.coverUrl}
                    alt={group.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {group.title}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-600">
                          <MapPin className="h-3.5 w-3.5" />
                          {group.destination}
                        </p>
                      </div>
                      <Badge
                        variant={
                          group.status === "upcoming" ? "default" : "secondary"
                        }
                        className={
                          group.status === "upcoming"
                            ? "bg-green-100 text-green-700"
                            : ""
                        }
                      >
                        {group.status === "upcoming" ? "Upcoming" : "Completed"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {group.shortDescription}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(group.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(group.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Joined{" "}
                      {new Date(group.joinedDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <div className="ml-auto font-semibold text-slate-900">
                      ${group.priceUsd.toLocaleString()}
                    </div>
                  </div>
                </div>
              </a>
            ))}

            {joinedGroups.length === 0 && (
              <div className="rounded-lg border border-dashed py-12 text-center">
                <Plane className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">
                  You haven't joined any travel groups yet
                </p>
                <a
                  href="/travel"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
                >
                  Explore Groups
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    Full Name
                  </p>
                  <p className="text-sm text-slate-900">
                    {user.name || "Not set"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    Email Address
                  </p>
                  <p className="text-sm text-slate-900">{user.email}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Company</p>
                  <p className="text-sm text-slate-900">{mockData.company}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <CreditCard className="mt-0.5 h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">User ID</p>
                  <p className="font-mono text-xs text-slate-600">{user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Current account standing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Verification
                      </p>
                      <p className="text-sm text-slate-600">Verified</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Security
                      </p>
                      <p className="text-sm text-slate-600">2FA Enabled</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
              <CardDescription>How to reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Email</p>
                  <p className="text-sm text-slate-900">{user.email}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    Phone Number
                  </p>
                  <p className="text-sm text-slate-900">{mockData.phone}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Location</p>
                  <p className="text-sm text-slate-900">{mockData.location}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Website</p>
                  <p className="text-sm text-slate-900">{mockData.website}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Language</p>
                  <p className="text-sm text-slate-900">{mockData.language}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Timezone</p>
                  <p className="text-sm text-slate-900">{mockData.timezone}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Bell className="mt-0.5 h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    Notifications
                  </p>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded"
                      />
                      <span className="text-sm text-slate-600">
                        Email notifications
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded"
                      />
                      <span className="text-sm text-slate-600">
                        Push notifications
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-slate-600">
                        SMS notifications
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-700">
                  Show profile to public
                </span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <Separator />
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-700">
                  Show email address
                </span>
                <input type="checkbox" className="rounded" />
              </label>
              <Separator />
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-700">
                  Allow search engines to index
                </span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Add Clock icon since it's not imported
function Clock({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
