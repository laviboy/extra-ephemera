import { useList, useNavigation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import {
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Plane,
  Star,
  Target,
  Mail,
  Building2,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Badge } from "../../ui/badge";
import {
  mockCustomers,
  mockItineraries,
  mockCommunications,
  mockPipeline,
  mockVendors,
  mockAnalytics,
} from "../data/mockData";

export function CRMDashboard() {
  const {
    query: { data: conversationsData },
  } = useList({
    resource: "conversations",
    filters: [{ field: "type", operator: "eq", value: "lead" }],
  });

  const {
    query: { data: bookingsData },
  } = useList({
    resource: "bookings",
  });

  const {
    query: { data: proposalsData },
  } = useList({
    resource: "proposals",
  });

  // Use mock data for demonstration
  const unreadComms = mockCommunications.filter(
    (c) => c.status === "unread"
  ).length;
  const upcomingTrips = mockItineraries.filter(
    (i) => i.status === "confirmed"
  ).length;

  const stats = [
    {
      title: "Active Customers",
      value: mockCustomers.length,
      icon: <Users className="h-6 w-6" />,
      change: "+12%",
      color: "blue",
    },
    {
      title: "Active Leads",
      value: mockPipeline.leads.length,
      icon: <Target className="h-6 w-6" />,
      change: "+18%",
      color: "purple",
    },
    {
      title: "This Month Revenue",
      value: `$${(
        mockAnalytics.salesPerformance.thisMonth.revenue / 1000
      ).toFixed(0)}K`,
      icon: <DollarSign className="h-6 w-6" />,
      change: `+${mockAnalytics.salesPerformance.thisMonth.growth}%`,
      color: "green",
    },
    {
      title: "Bookings This Month",
      value: mockAnalytics.salesPerformance.thisMonth.bookings,
      icon: <Calendar className="h-6 w-6" />,
      change: "+8%",
      color: "orange",
    },
    {
      title: "Unread Messages",
      value: unreadComms,
      icon: <Mail className="h-6 w-6" />,
      change: "New today",
      color: "rose",
    },
    {
      title: "Active Vendors",
      value: mockVendors.length,
      icon: <Building2 className="h-6 w-6" />,
      change: "All active",
      color: "indigo",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-600" },
      green: {
        bg: "bg-green-50",
        text: "text-green-700",
        icon: "text-green-600",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        icon: "text-purple-600",
      },
      rose: { bg: "bg-rose-50", text: "text-rose-700", icon: "text-rose-600" },
      indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        icon: "text-indigo-600",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Travel CRM Dashboard
        </h2>
        <p className="text-slate-600">
          Complete overview of your travel business operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const colors = getColorClasses(stat.color);
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-green-600">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`rounded-full p-2 ${colors.bg}`}>
                    <div className={colors.icon}>{stat.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">New Customer</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add customer profile
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Create Itinerary</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Build new trip
                </p>
              </div>
              <Plane className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sales Pipeline</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Manage leads
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground mt-1">
                  View insights
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">VIP Customers</CardTitle>
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCustomers
                .filter((c) => c.customerType === "vip")
                .slice(0, 3)
                .map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ${customer.lifetimeValue.toLocaleString()} LTV
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">VIP</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Urgent Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Urgent Tasks</CardTitle>
            <Badge variant="destructive">
              {mockItineraries[0]?.reminders.filter(
                (r) => r.status === "pending"
              ).length || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockItineraries[0]?.reminders
                .filter((r) => r.status === "pending")
                .map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-start gap-3 p-2 border rounded-lg"
                  >
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {reminder.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(reminder.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              <div className="flex items-start gap-3 p-2 border rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    Follow up with new leads
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    3 leads awaiting response
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Unread Messages</span>
                </div>
                <Badge variant="secondary">{unreadComms}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">New Leads</span>
                </div>
                <Badge variant="secondary">
                  {mockPipeline.leads.filter((l) => l.stage === "new").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Departures This Week</span>
                </div>
                <Badge variant="secondary">2</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Tasks Completed</span>
                </div>
                <Badge variant="default">5</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performing Leads */}
        <Card>
          <CardHeader>
            <CardTitle>High-Priority Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPipeline.leads
                .sort((a, b) => b.score - a.score)
                .slice(0, 4)
                .map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:border-primary cursor-pointer"
                  >
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.interest}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Budget: {lead.budget}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">Score: {lead.score}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {lead.assignedTo}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-between gap-2">
              {mockAnalytics.bookingTrends.map((trend) => {
                const maxRevenue = Math.max(
                  ...mockAnalytics.bookingTrends.map((t) => t.revenue)
                );
                const height = (trend.revenue / maxRevenue) * 100;

                return (
                  <div
                    key={trend.month}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full bg-primary rounded-t hover:bg-primary/80 cursor-pointer transition-colors"
                      style={{ height: `${height * 1.8}px` }}
                      title={`${
                        trend.month
                      }: $${trend.revenue.toLocaleString()}`}
                    />
                    <span className="text-xs font-medium">{trend.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Avg Monthly</p>
                <p className="text-xl font-bold">
                  $
                  {(
                    mockAnalytics.bookingTrends.reduce(
                      (sum, t) => sum + t.revenue,
                      0
                    ) /
                    mockAnalytics.bookingTrends.length /
                    1000
                  ).toFixed(0)}
                  K
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Month</p>
                <p className="text-xl font-bold text-green-600">
                  $
                  {(
                    Math.max(
                      ...mockAnalytics.bookingTrends.map((t) => t.revenue)
                    ) / 1000
                  ).toFixed(0)}
                  K
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Growth</p>
                <p className="text-xl font-bold text-green-600">
                  +{mockAnalytics.salesPerformance.thisMonth.growth}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
