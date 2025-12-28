import { useTable, useNavigation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Plus, Eye, Pencil } from "lucide-react";

export function BookingList() {
  const { show, edit, create } = useNavigation();
  const {
    tableQuery: { data, isLoading },
  } = useTable({
    resource: "bookings",
    meta: {
      select: "*, customer:customerId(name, email), package:packageId(title)",
    },
  });

  const bookings = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bookings</h2>
          <p className="text-slate-600">Manage all your travel bookings</p>
        </div>
        <Button onClick={() => create("bookings")}>
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-500">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">
                      {booking.package?.title || "Custom Booking"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {booking.customer?.name} • {booking.travelers} travelers
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{booking.status}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => show("bookings", booking.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function BookingCreate() {
  return <div>Create Booking Page</div>;
}

export function BookingEdit() {
  return <div>Edit Booking Page</div>;
}

export function BookingShow() {
  return <div>Show Booking Page</div>;
}
