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
import { Button } from "../ui/button";
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
  Home,
  Settings,
  Star,
  TrendingUp,
  Award,
  Heart,
  MessageSquare,
  Edit,
  Camera,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { TravelGroup } from "../../data/travelGroups";
import { useUserListings } from "../../hooks/useUserListings";
import ListingCard from "../ui/ListingCard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

function ProfileContent() {
  const user = useAuth((s) => s.user);
  const { data: userListings = [], isLoading: isLoadingListings } =
    useUserListings(user?.id);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section with Cover */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="absolute top-4 right-4">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 hover:bg-white backdrop-blur-sm"
          >
            <Camera className="h-4 w-4 mr-2" />
            Change Cover
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20">
        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden shadow-xl border-2">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row md:items-end gap-6 p-6 pb-4">
              {/* Avatar with edit button */}
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg ring-2 ring-slate-200">
                  <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-600 text-4xl font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-white border-2 border-slate-200 shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors">
                  <Edit className="h-4 w-4 text-slate-600" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold text-slate-900">
                      {user.name || "User"}
                    </h1>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      <Award className="h-3 w-3 mr-1" />
                      {mockData.accountType}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-slate-600 mt-1">{user.email}</p>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
                      <Home className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {userListings.length}
                      </p>
                      <p className="text-xs text-slate-500">Listings</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Plane className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {joinedGroups.length}
                      </p>
                      <p className="text-xs text-slate-500">Trips</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Star className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">4.9</p>
                      <p className="text-xs text-slate-500">Rating</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">24</p>
                      <p className="text-xs text-slate-500">Reviews</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:self-start">
                <Button variant="outline" className="border-slate-300">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Meta Info Bar */}
            <div className="bg-slate-50/50 border-t px-6 py-3 flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Joined {mockData.joinDate}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{mockData.location}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Last active: {mockData.lastLogin}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* My Listings Section */}
            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">My Listings</CardTitle>
                      <CardDescription>
                        {userListings.length} travel groups is open
                      </CardDescription>
                    </div>
                  </div>
                  <a href="/listing/create">
                    <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                      <Home className="h-4 w-4 mr-2" />
                      Create New
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingListings ? (
                  <div className="animate-pulse">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[...Array(2)].map((_, i) => (
                        <div
                          key={i}
                          className="h-64 bg-slate-200 rounded-xl"
                        ></div>
                      ))}
                    </div>
                  </div>
                ) : userListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={{
                          ...listing,
                          priceText: listing.price_min
                            ? `RM${listing.price_min} per night`
                            : listing.price_max
                            ? `Up to RM${listing.price_max}`
                            : "Price TBD",
                          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(
                            listing.id
                          )}/640/480`,
                          isGuestFavorite: false,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                      <Home className="h-8 w-8 text-rose-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No listings yet
                    </h3>
                    <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">
                      Start earning by listing your property and welcoming
                      guests from around the world
                    </p>
                    <a href="/listing/create">
                      <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
                        <Home className="h-4 w-4 mr-2" />
                        Create Your First Listing
                      </Button>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Travel Groups Section */}
            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
                      <Plane className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        My Travel Groups
                      </CardTitle>
                      <CardDescription>
                        {
                          joinedGroups.filter((g) => g.status === "upcoming")
                            .length
                        }{" "}
                        upcoming trips
                      </CardDescription>
                    </div>
                  </div>
                  <a href="/travel">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-300 hover:bg-blue-50"
                    >
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {joinedGroups.map((group) => (
                    <a
                      key={group.id}
                      href={`/travel/${group.slug}`}
                      className="group flex gap-4 rounded-xl border-2 border-slate-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md"
                    >
                      {/* Cover Image */}
                      <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={group.coverUrl}
                          alt={group.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant={
                              group.status === "upcoming"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              group.status === "upcoming"
                                ? "bg-green-500 text-white shadow-md"
                                : "bg-slate-500 text-white"
                            }
                          >
                            {group.status === "upcoming"
                              ? "Upcoming"
                              : "Completed"}
                          </Badge>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {group.title}
                          </h3>
                          <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="h-3.5 w-3.5" />
                            {group.destination}
                          </p>
                          <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                            {group.shortDescription}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(group.startDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}{" "}
                            -{" "}
                            {new Date(group.endDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                          <div className="ml-auto text-lg font-bold text-slate-900">
                            ${group.priceUsd.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}

                  {joinedGroups.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                      <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <Plane className="h-8 w-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        No trips yet
                      </h3>
                      <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">
                        Join a travel group and explore the world with
                        like-minded adventurers
                      </p>
                      <a href="/travel">
                        <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700">
                          <Plane className="h-4 w-4 mr-2" />
                          Explore Groups
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-rose-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="/listing/create" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-rose-50 hover:border-rose-300"
                  >
                    <Home className="h-4 w-4 mr-2 text-rose-500" />
                    Create Listing
                  </Button>
                </a>
                <a href="/travel" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Plane className="h-4 w-4 mr-2 text-blue-500" />
                    Browse Travel Groups
                  </Button>
                </a>
                <a href="/settings" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-slate-50 hover:border-slate-300"
                  >
                    <Settings className="h-4 w-4 mr-2 text-slate-500" />
                    Account Settings
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="shadow-md border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/80 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Email Verified
                      </p>
                      <p className="text-xs text-slate-600">Confirmed</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/80 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        ID Verified
                      </p>
                      <p className="text-xs text-slate-600">Secure account</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/80 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        2FA Enabled
                      </p>
                      <p className="text-xs text-slate-600">Extra security</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card className="shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  Profile Strength
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Completion</span>
                    <span className="font-semibold text-slate-900">85%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 w-[85%] transition-all"></div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Complete your profile to unlock more features and build
                    trust with the community
                  </p>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Complete Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ProfileContent />
    </QueryClientProvider>
  );
}
