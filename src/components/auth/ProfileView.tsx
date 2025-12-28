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
import { Button } from "../ui/button";
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Home,
  Star,
  MessageSquare,
  Edit,
  Camera,
  CheckCircle2,
  Clock,
  UserPlus,
  UserMinus,
  Mail,
} from "lucide-react";
import { useUserListings } from "../../hooks/useUserListings";
import {
  useFollowStatus,
  useFollowers,
  useFollowing,
  useFollowUser,
  useUnfollowUser,
} from "../../hooks/useFollows";
import ListingCard from "../ui/ListingCard";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useState } from "react";

interface ProfileViewProps {
  userId: string;
}

function ProfileViewContent({ userId }: ProfileViewProps) {
  const currentUser = useAuth((s) => s.user);
  const isOwnProfile = currentUser?.id === userId;

  // Fetch user data
  const { data: profileUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
    enabled: !!userId,
  });

  const { data: userListings = [], isLoading: isLoadingListings } =
    useUserListings(userId);
  const { data: followStatus } = useFollowStatus(userId);
  const { data: followers = [] } = useFollowers(userId);
  const { data: following = [] } = useFollowing(userId);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const handleFollowToggle = async () => {
    if (!userId) return;
    try {
      if (followStatus?.isFollowing) {
        await unfollowUser.mutateAsync(userId);
      } else {
        await followUser.mutateAsync(userId);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-500">User not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = profileUser;
  const initials = (user.name || user.email || "").slice(0, 2).toUpperCase();

  // Mock data for demonstration
  const mockData = {
    location: "San Francisco, CA",
    joinDate: "January 2024",
    lastLogin: "December 27, 2025",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section with Cover */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
      </div>

      {/* Profile Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20">
        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden shadow-xl border-2">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row md:items-end gap-6 p-6 pb-4">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg ring-2 ring-slate-200">
                  <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-600 text-4xl font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold text-slate-900">
                      {user.name || "User"}
                    </h1>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-slate-600 mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
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
                    <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {followers.length}
                      </p>
                      <p className="text-xs text-slate-500">Followers</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {following.length}
                      </p>
                      <p className="text-xs text-slate-500">Following</p>
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
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {isOwnProfile ? (
                  <>
                    <a href="/settings" className="w-full sm:w-auto">
                      <Button variant="outline" className="border-slate-300 w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </a>
                  </>
                ) : (
                  <>
                    {currentUser ? (
                      <>
                        <Button
                          onClick={handleFollowToggle}
                          disabled={
                            followUser.isPending || unfollowUser.isPending
                          }
                          className={`w-full ${
                            followStatus?.isFollowing
                              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                              : "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                          }`}
                        >
                          {followStatus?.isFollowing ? (
                            <>
                              <UserMinus className="h-4 w-4 mr-2" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                        <Button variant="outline" className="border-slate-300 w-full">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </>
                    ) : (
                      <>
                        <a href="/profile" className="w-full">
                          <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white w-full">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Login to Follow
                          </Button>
                        </a>
                        <Button variant="outline" className="border-slate-300 w-full" disabled>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </>
                    )}
                  </>
                )}
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
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Listings Section */}
            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {isOwnProfile ? "My Listings" : "Listings"}
                      </CardTitle>
                      <CardDescription>
                        {userListings.length} properties available
                      </CardDescription>
                    </div>
                  </div>
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
                          subtitle: listing.destination,
                          priceText: listing.price_min
                            ? `RM${listing.price_min} per night`
                            : listing.price_max
                            ? `Up to RM${listing.price_max}`
                            : "Price TBD",
                          imageUrl:
                            listing.first_image_url ||
                            `https://picsum.photos/seed/${encodeURIComponent(
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
                    <p className="text-sm text-slate-600">
                      {isOwnProfile
                        ? "Start earning by listing your property"
                        : "This user hasn't listed any properties yet"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Followers */}
            <Card className="shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  Followers
                </CardTitle>
                <CardDescription>
                  {followers.length}{" "}
                  {followers.length === 1 ? "person" : "people"} following
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {followers.length > 0 ? (
                    followers.slice(0, 5).map((follower) => (
                      <div
                        key={follower.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Avatar className="h-10 w-10 border-2 border-slate-200">
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-sm">
                            {(follower.name || follower.email)
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {follower.name || "User"}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {follower.email}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No followers yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Following */}
            <Card className="shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-500" />
                  Following
                </CardTitle>
                <CardDescription>
                  Following {following.length}{" "}
                  {following.length === 1 ? "person" : "people"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {following.length > 0 ? (
                    following.slice(0, 5).map((followedUser) => (
                      <div
                        key={followedUser.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Avatar className="h-10 w-10 border-2 border-slate-200">
                          <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-sm">
                            {(followedUser.name || followedUser.email)
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {followedUser.name || "User"}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {followedUser.email}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        Not following anyone yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileView({ userId }: ProfileViewProps) {
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
      <ProfileViewContent userId={userId} />
    </QueryClientProvider>
  );
}
