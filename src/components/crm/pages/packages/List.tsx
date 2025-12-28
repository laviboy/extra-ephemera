import { useTable, useGetIdentity, useNavigation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Plus, Eye, Pencil, Calendar } from "lucide-react";

export function PackageList() {
  const { data: identity } = useGetIdentity();
  const { edit, show, create } = useNavigation();

  const {
    tableQuery: { data, isLoading },
  } = useTable({
    resource: "listings",
    filters: {
      permanent: [
        {
          field: "creator_id",
          operator: "eq",
          value: identity?.id,
        },
      ],
    },
    meta: {
      select: "*",
    },
  });

  const listings = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Packages</h2>
          <p className="text-slate-600">
            Manage your travel listings and packages
          </p>
        </div>
        <Button onClick={() => create("listings")}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Package
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Packages ({listings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : listings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-500">No packages created yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => create("listings")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Package
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                      Destination
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                      Price Range
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                      Tags
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                      Instant Bookable
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {listings.map((listing: any) => (
                    <tr key={listing.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">
                            {listing.title}
                          </p>
                          {listing.description && (
                            <p className="text-sm text-slate-500 line-clamp-1">
                              {listing.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {listing.destination}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {listing.priceMin && listing.priceMax ? (
                          <span>
                            ${listing.priceMin.toLocaleString()} - $
                            {listing.priceMax.toLocaleString()}
                          </span>
                        ) : listing.priceMin ? (
                          <span>From ${listing.priceMin.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-400">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            listing.status === "published"
                              ? "default"
                              : listing.status === "draft"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {listing.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {listing.tags && listing.tags.length > 0 ? (
                            listing.tags
                              .slice(0, 2)
                              .map((tag: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))
                          ) : (
                            <span className="text-xs text-slate-400">
                              No tags
                            </span>
                          )}
                          {listing.tags && listing.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{listing.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {listing.instantBookable ? (
                          <Badge variant="default" className="bg-green-600">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => show("listings", listing.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => edit("listings", listing.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function PackageCreate() {
  return <div>Create Package</div>;
}

export function PackageEdit() {
  return <div>Edit Package</div>;
}
