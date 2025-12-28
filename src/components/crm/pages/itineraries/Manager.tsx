import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Progress } from "../../../ui/progress";
import { Separator } from "../../../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import {
  Plane,
  Hotel,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Send,
} from "lucide-react";
import { mockItineraries } from "../../data/mockData";

export function ItineraryManager({ itineraryId }: { itineraryId: string }) {
  // In real app, fetch from API
  const itinerary =
    mockItineraries.find((i) => i.id === itineraryId) || mockItineraries[0];
  const paymentProgress = (itinerary.paidAmount / itinerary.totalCost) * 100;

  const getBookingIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="h-5 w-5" />;
      case "hotel":
        return <Hotel className="h-5 w-5" />;
      case "tour":
        return <MapPin className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "checklist":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Itinerary Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{itinerary.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {itinerary.destination}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(itinerary.startDate).toLocaleDateString()} -{" "}
                  {new Date(itinerary.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {itinerary.travelers} travelers
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={getStatusColor(itinerary.status)}>
                  {itinerary.status}
                </Badge>
                <Badge variant="outline">ID: {itinerary.id}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send to Customer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Cost</label>
              <div className="text-2xl font-bold">
                {itinerary.currency} ${itinerary.totalCost.toLocaleString()}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount Paid</label>
              <div className="text-2xl font-bold text-green-600">
                ${itinerary.paidAmount.toLocaleString()}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Balance Due</label>
              <div className="text-2xl font-bold text-orange-600">
                ${(itinerary.totalCost - itinerary.paidAmount).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Payment Progress</span>
              <span className="font-medium">
                {Math.round(paymentProgress)}%
              </span>
            </div>
            <Progress value={paymentProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Details */}
      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Bookings & Services</TabsTrigger>
          <TabsTrigger value="reminders">Reminders & Tasks</TabsTrigger>
          <TabsTrigger value="timeline">Daily Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {itinerary.bookings.map((booking, index) => (
                  <div key={booking.id}>
                    <div className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="p-3 rounded-full bg-primary/10">
                        {getBookingIcon(booking.type)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {booking.provider}
                              </h4>
                              <Badge
                                variant={getStatusColor(booking.status)}
                                className="text-xs"
                              >
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {booking.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              ${booking.cost.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {booking.type === "hotel"
                                ? "per stay"
                                : "per person"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {booking.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(booking.date).toLocaleDateString()}
                            </div>
                          )}
                          {booking.checkIn && (
                            <>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Check-in:{" "}
                                {new Date(booking.checkIn).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Check-out:{" "}
                                {new Date(
                                  booking.checkOut!
                                ).toLocaleDateString()}
                              </div>
                            </>
                          )}
                        </div>

                        {booking.confirmationNumber && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium">Confirmation:</span>
                            <code className="px-2 py-1 bg-muted rounded">
                              {booking.confirmationNumber}
                            </code>
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            Edit Booking
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          {booking.status === "pending" && (
                            <Button size="sm">Confirm Now</Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < itinerary.bookings.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Plane className="h-4 w-4 mr-2" />
                Add New Booking
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itinerary.reminders
                    .filter((r) => r.status === "pending")
                    .map((reminder) => (
                      <div
                        key={reminder.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <div className="p-2 rounded-full bg-orange-100">
                              {getReminderIcon(reminder.type)}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">
                                {reminder.description}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Due:{" "}
                                {new Date(
                                  reminder.dueDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            Snooze
                          </Button>
                          <Button size="sm" className="flex-1">
                            Mark Complete
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Completed Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itinerary.reminders
                    .filter((r) => r.status === "completed")
                    .map((reminder) => (
                      <div
                        key={reminder.id}
                        className="border rounded-lg p-4 opacity-60"
                      >
                        <div className="flex items-start gap-2">
                          <div className="p-2 rounded-full bg-green-100">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm line-through">
                              {reminder.description}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Completed:{" "}
                              {new Date(reminder.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pre-Trip Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { item: "Passport valid for 6+ months", checked: true },
                  { item: "Visa requirements checked", checked: true },
                  { item: "Travel insurance purchased", checked: false },
                  { item: "Vaccinations up to date", checked: false },
                  { item: "Hotel confirmations sent", checked: true },
                  { item: "Airport transfer arranged", checked: false },
                  { item: "Emergency contacts shared", checked: false },
                  { item: "Currency exchanged", checked: false },
                ].map((checkItem, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={checkItem.checked}
                      className="h-4 w-4"
                      readOnly
                    />
                    <span
                      className={`text-sm ${
                        checkItem.checked
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {checkItem.item}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Day-by-Day Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    day: "Day 1",
                    date: "Feb 5, 2025",
                    events: [
                      {
                        time: "10:00 AM",
                        title: "Departure from NYC",
                        type: "flight",
                        details: "Emirates EK201",
                      },
                      {
                        time: "3:00 PM",
                        title: "Arrive Barcelona",
                        type: "flight",
                        details: "Barcelona Airport (BCN)",
                      },
                      {
                        time: "5:00 PM",
                        title: "Hotel Check-in",
                        type: "hotel",
                        details: "Hotel Arts Barcelona",
                      },
                      {
                        time: "8:00 PM",
                        title: "Welcome Dinner",
                        type: "dining",
                        details: "Tapas at El Nacional",
                      },
                    ],
                  },
                  {
                    day: "Day 2",
                    date: "Feb 6, 2025",
                    events: [
                      {
                        time: "9:00 AM",
                        title: "Breakfast at Hotel",
                        type: "dining",
                        details: "Included",
                      },
                      {
                        time: "10:30 AM",
                        title: "City Walking Tour",
                        type: "tour",
                        details: "Gothic Quarter & Las Ramblas",
                      },
                      {
                        time: "2:00 PM",
                        title: "Lunch Break",
                        type: "dining",
                        details: "Free time",
                      },
                      {
                        time: "4:00 PM",
                        title: "Park Güell Visit",
                        type: "tour",
                        details: "Guided tour included",
                      },
                    ],
                  },
                  {
                    day: "Day 3",
                    date: "Feb 7, 2025",
                    events: [
                      {
                        time: "9:00 AM",
                        title: "Sagrada Familia",
                        type: "tour",
                        details: "Private guided tour",
                      },
                      {
                        time: "12:00 PM",
                        title: "Catalan Cooking Class",
                        type: "activity",
                        details: "Learn to make paella",
                      },
                      {
                        time: "7:00 PM",
                        title: "Flamenco Show",
                        type: "entertainment",
                        details: "Tablao Flamenco Cordobes",
                      },
                    ],
                  },
                ].map((dayPlan, dayIdx) => (
                  <div key={dayIdx} className="border-l-4 border-primary pl-4">
                    <div className="mb-3">
                      <h3 className="font-bold text-lg">{dayPlan.day}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dayPlan.date}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {dayPlan.events.map((event, eventIdx) => (
                        <div
                          key={eventIdx}
                          className="flex gap-4 pb-3 border-b last:border-0"
                        >
                          <div className="text-sm font-medium text-muted-foreground min-w-[80px]">
                            {event.time}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {event.details}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Travel Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Flight Tickets", icon: Plane, status: "Ready" },
                  { name: "Hotel Vouchers", icon: Hotel, status: "Ready" },
                  {
                    name: "Tour Confirmations",
                    icon: MapPin,
                    status: "Pending",
                  },
                  { name: "Travel Insurance", icon: FileText, status: "Ready" },
                  { name: "Visa Documents", icon: FileText, status: "Ready" },
                  {
                    name: "Emergency Contacts",
                    icon: FileText,
                    status: "Ready",
                  },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <doc.icon className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.status}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Generate Complete Travel Pack
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
