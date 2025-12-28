import { useShow } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { ScrollArea } from "../../../ui/scroll-area";
import { Separator } from "../../../ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  DollarSign,
  MessageSquare,
  Clock,
  Plane,
  Hotel,
  Users,
  Heart,
  TrendingUp,
  Award,
  FileText,
} from "lucide-react";
import { mockCustomers } from "../../data/mockData";

export function CustomerProfile({ customerId }: { customerId: string }) {
  // In real app, this would fetch from API
  const customer =
    mockCustomers.find((c: any) => c.id === customerId) || mockCustomers[0];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={customer.avatar} alt={customer.name} />
                <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{customer.name}</h1>
                  {customer.customerType === "vip" && (
                    <Badge variant="default" className="bg-yellow-500">
                      <Award className="h-3 w-3 mr-1" />
                      VIP
                    </Badge>
                  )}
                  <Badge
                    variant={
                      customer.status === "active" ? "default" : "secondary"
                    }
                  >
                    {customer.status}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {customer.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {customer.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Customer since{" "}
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  {customer.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button>
                <Plane className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${customer.totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lifetime Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${customer.lifetimeValue.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              +${customer.lifetimeValue - customer.totalSpent} projected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              4.9 <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              From completed trips
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trips">Trip History</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Trips</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {customer.tripHistory.map((trip: any) => (
                      <div key={trip.id} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">
                              {trip.destination}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {trip.dates}
                            </div>
                          </div>
                          <Badge
                            variant={
                              trip.status === "completed"
                                ? "default"
                                : trip.status === "upcoming"
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {trip.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            ${trip.spent.toLocaleString()}
                          </span>
                          {trip.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span>{trip.rating}.0</span>
                            </div>
                          )}
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Communications</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {customer.communications.map((comm: any) => (
                      <div key={comm.id} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {comm.type === "email" && (
                                <Mail className="h-4 w-4" />
                              )}
                              {comm.type === "whatsapp" && (
                                <MessageSquare className="h-4 w-4" />
                              )}
                              <span className="font-medium text-sm">
                                {comm.subject}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {comm.date}
                            </div>
                          </div>
                          <Badge
                            variant={
                              comm.status === "read" ? "outline" : "default"
                            }
                          >
                            {comm.status}
                          </Badge>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Trip History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {customer.tripHistory.map((trip) => (
                  <div
                    key={trip.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {trip.destination}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {trip.dates}
                        </p>
                      </div>
                      <Badge
                        variant={
                          trip.status === "completed"
                            ? "default"
                            : trip.status === "upcoming"
                            ? "outline"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {trip.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Amount Spent:
                        </span>
                        <span className="ml-2 font-medium">
                          ${trip.spent.toLocaleString()}
                        </span>
                      </div>
                      {trip.rating && (
                        <div>
                          <span className="text-muted-foreground">Rating:</span>
                          <span className="ml-2 font-medium inline-flex items-center gap-1">
                            {trip.rating}.0{" "}
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          </span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      View Full Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Travel Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Travel Style</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {customer.preferences.travelStyle}
                  </p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium">Accommodation</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {customer.preferences.accommodation}
                  </p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium">Activities</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {customer.preferences.activities.map((activity: string) => (
                      <Badge key={activity} variant="secondary">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Special Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Dietary Restrictions
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {customer.preferences.dietaryRestrictions}
                  </p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium">
                    Special Requests
                  </label>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {customer.preferences.specialRequests.map(
                      (request: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          {request}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customer.communications.map((comm) => (
                  <div
                    key={comm.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {comm.type === "email" && (
                          <Mail className="h-5 w-5 text-blue-500" />
                        )}
                        {comm.type === "whatsapp" && (
                          <MessageSquare className="h-5 w-5 text-green-500" />
                        )}
                        <h4 className="font-medium">{comm.subject}</h4>
                      </div>
                      <Badge
                        variant={comm.status === "read" ? "outline" : "default"}
                      >
                        {comm.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{comm.date}</p>
                    <Button variant="link" className="p-0 h-auto">
                      View Full Thread
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">Passport Copy</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: Jan 15, 2024
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-medium">Travel Insurance</p>
                      <p className="text-xs text-muted-foreground">
                        Valid until: Dec 31, 2025
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="font-medium">Visa Documents</p>
                      <p className="text-xs text-muted-foreground">
                        Updated: Nov 20, 2024
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload New Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
