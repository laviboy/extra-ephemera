import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { ScrollArea } from "../../../ui/scroll-area";
import {
  Building2,
  Star,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  TrendingUp,
  Package,
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Plane,
  Hotel,
  MapPin,
} from "lucide-react";
import { mockVendors } from "../../data/mockData";

export function VendorManagement() {
  const totalActiveBookings = mockVendors.reduce(
    (sum, v) => sum + v.activeBookings,
    0
  );
  const totalRevenue = mockVendors.reduce((sum, v) => sum + v.totalRevenue, 0);
  const avgRating =
    mockVendors.reduce((sum, v) => sum + v.rating, 0) / mockVendors.length;

  const getVendorIcon = (type: string) => {
    switch (type) {
      case "Airline":
        return <Plane className="h-5 w-5" />;
      case "Hotel Chain":
        return <Hotel className="h-5 w-5" />;
      case "Tour Operator":
        return <MapPin className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockVendors.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockVendors.filter((v) => v.status === "preferred").length}{" "}
              preferred
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveBookings}</div>
            <p className="text-xs text-muted-foreground">Across all vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +18% this quarter
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
              {avgRating.toFixed(1)}
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground">Vendor quality</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="vendors" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="vendors">All Vendors</TabsTrigger>
            <TabsTrigger value="bookings">Active Bookings</TabsTrigger>
            <TabsTrigger value="costs">Cost Tracking</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                className="pl-10 w-[250px]"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </div>
        </div>

        <TabsContent value="vendors" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {mockVendors.map((vendor) => (
              <Card key={vendor.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        {getVendorIcon(vendor.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">
                            {vendor.name}
                          </h3>
                          <Badge
                            variant={
                              vendor.status === "preferred"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {vendor.status}
                          </Badge>
                          <Badge variant="outline">{vendor.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {vendor.contact}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {vendor.phone}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-medium">{vendor.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            rating
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Commission Rate
                      </p>
                      <p className="text-lg font-bold">{vendor.commission}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Payment Terms
                      </p>
                      <p className="text-lg font-bold">{vendor.paymentTerms}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Active Bookings
                      </p>
                      <p className="text-lg font-bold">
                        {vendor.activeBookings}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Total Revenue
                      </p>
                      <p className="text-lg font-bold">
                        ${(vendor.totalRevenue / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">
                      Services Offered:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {vendor.services.map((service) => (
                        <Badge key={service} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Contract
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Bookings
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Booking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Vendor Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      vendor: "Emirates Airlines",
                      service: "NYC to Barcelona",
                      customer: "Sarah Johnson",
                      date: "Feb 5, 2025",
                      cost: 2400,
                      commission: 240,
                      status: "confirmed",
                    },
                    {
                      vendor: "Marriott Hotels",
                      service: "Deluxe Suite - 7 nights",
                      customer: "Michael Chen",
                      date: "Mar 10-17, 2025",
                      cost: 2800,
                      commission: 336,
                      status: "confirmed",
                    },
                    {
                      vendor: "Barcelona Adventures",
                      service: "Private City Tour",
                      customer: "Sarah Johnson",
                      date: "Feb 7, 2025",
                      cost: 450,
                      commission: 67.5,
                      status: "pending",
                    },
                    {
                      vendor: "Emirates Airlines",
                      service: "Paris to Tokyo",
                      customer: "Lisa Anderson",
                      date: "Apr 12, 2025",
                      cost: 3200,
                      commission: 320,
                      status: "confirmed",
                    },
                  ].map((booking, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {booking.vendor}
                      </TableCell>
                      <TableCell>{booking.service}</TableCell>
                      <TableCell>{booking.customer}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>${booking.cost.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ${booking.commission.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {booking.status === "confirmed" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown by Vendor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockVendors.map((vendor) => (
                    <div key={vendor.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {vendor.name}
                        </span>
                        <span className="text-sm font-bold">
                          ${vendor.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${
                              (vendor.totalRevenue / totalRevenue) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{vendor.activeBookings} bookings</span>
                        <span>
                          {Math.round(
                            (vendor.totalRevenue / totalRevenue) * 100
                          )}
                          % of total
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockVendors.map((vendor) => {
                    const commissionRate =
                      parseFloat(vendor.commission.replace("%", "")) / 100;
                    const earned = vendor.totalRevenue * commissionRate;

                    return (
                      <div
                        key={vendor.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{vendor.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {vendor.commission} commission rate
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            ${earned.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            earned
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="border-t pt-4 flex items-center justify-between">
                    <span className="font-semibold">
                      Total Commission Earned
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      $
                      {mockVendors
                        .reduce((sum, v) => {
                          const rate =
                            parseFloat(v.commission.replace("%", "")) / 100;
                          return sum + v.totalRevenue * rate;
                        }, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Invoice Amount</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      vendor: "Emirates Airlines",
                      amount: 12000,
                      terms: "Net 30",
                      dueDate: "Jan 15, 2025",
                      status: "pending",
                    },
                    {
                      vendor: "Marriott Hotels",
                      amount: 8500,
                      terms: "Net 45",
                      dueDate: "Jan 30, 2025",
                      status: "pending",
                    },
                    {
                      vendor: "Barcelona Adventures",
                      amount: 2400,
                      terms: "Prepaid",
                      dueDate: "Jan 5, 2025",
                      status: "paid",
                    },
                  ].map((payment, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {payment.vendor}
                      </TableCell>
                      <TableCell>${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{payment.terms}</TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "paid" ? "default" : "secondary"
                          }
                        >
                          {payment.status === "paid" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.status === "pending" && (
                          <Button size="sm">Mark Paid</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockVendors.map((vendor) => (
              <Card key={vendor.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{vendor.name}</CardTitle>
                    <Badge
                      variant={
                        vendor.status === "preferred" ? "default" : "secondary"
                      }
                    >
                      {vendor.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Overall Rating
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-bold">{vendor.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Quality</span>
                        <span className="font-medium">4.8/5.0</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: "96%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Reliability
                        </span>
                        <span className="font-medium">4.9/5.0</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: "98%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Response Time
                        </span>
                        <span className="font-medium">4.7/5.0</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: "94%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Value for Money
                        </span>
                        <span className="font-medium">4.6/5.0</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: "92%" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total Bookings:
                      </span>
                      <span className="font-medium">
                        {vendor.activeBookings * 5}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Success Rate:
                      </span>
                      <span className="font-medium text-green-600">98%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Avg Response:
                      </span>
                      <span className="font-medium">2.3 hours</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" size="sm">
                    View Full Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
