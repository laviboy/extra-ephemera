import { useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { Badge } from "../../ui/badge";

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

  const stats = [
    {
      title: "Active Leads",
      value: conversationsData?.total || 0,
      icon: <MessageSquare className="h-6 w-6" />,
      change: "+12%",
      color: "blue",
    },
    {
      title: "Bookings This Month",
      value:
        bookingsData?.data?.filter(
          (b: any) => new Date(b.createdAt).getMonth() === new Date().getMonth()
        ).length || 0,
      icon: <Calendar className="h-6 w-6" />,
      change: "+8%",
      color: "green",
    },
    {
      title: "Pending Proposals",
      value:
        proposalsData?.data?.filter((p: any) => p.status === "sent").length ||
        0,
      icon: <Users className="h-6 w-6" />,
      change: "+3",
      color: "purple",
    },
    {
      title: "Revenue (This Month)",
      value: `$${(
        (bookingsData?.data?.reduce(
          (acc: number, b: any) => acc + (b.paidAmount || 0),
          0
        ) || 0) / 100
      ).toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6" />,
      change: "+15%",
      color: "rose",
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
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-600">
          Welcome back! Here's your CRM overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`rounded-full p-3 ${colors.bg}`}>
                    <div className={colors.icon}>{stat.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversationsData?.data?.slice(0, 5).map((conversation: any) => (
                <div
                  key={conversation.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {conversation.subject || "New Inquiry"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(conversation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{conversation.type}</Badge>
                </div>
              ))}
              {(!conversationsData?.data ||
                conversationsData.data.length === 0) && (
                <p className="text-center text-sm text-slate-500 py-4">
                  No recent leads
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookingsData?.data?.slice(0, 5).map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {booking.travelers} travelers
                    </p>
                    <p className="text-sm text-slate-500">
                      {booking.travelDate
                        ? new Date(booking.travelDate).toLocaleDateString()
                        : "TBD"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      booking.status === "confirmed" ? "default" : "secondary"
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))}
              {(!bookingsData?.data || bookingsData.data.length === 0) && (
                <p className="text-center text-sm text-slate-500 py-4">
                  No upcoming bookings
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
