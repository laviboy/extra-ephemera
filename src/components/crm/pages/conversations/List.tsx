import { useTable, useNavigation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Input } from "../../../ui/input";
import { MessageSquare, Search, Eye } from "lucide-react";

export function ConversationList() {
  const { show } = useNavigation();
  const {
    tableQuery: { data, isLoading },
    pageSize,
    pageCount,
    filters,
    setFilters,
  } = useTable({
    resource: "conversations",
    meta: {
      select: "*, customer:customerId(name, email), agent:agentId(name)",
    },
  });

  const current = Math.floor((data?.data?.length || 0) / (pageSize || 10)) + 1;

  const conversations = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Leads & Messages
          </h2>
          <p className="text-slate-600">
            Manage customer inquiries and conversations
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                onChange={(e) => {
                  setFilters([
                    {
                      field: "subject",
                      operator: "contains",
                      value: e.target.value,
                    },
                  ]);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">
                No conversations yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                New customer inquiries will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation: any) => (
                <div
                  key={conversation.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-slate-900">
                        {conversation.subject || "New Inquiry"}
                      </h3>
                      <Badge variant="outline">{conversation.type}</Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                      <span>
                        From:{" "}
                        {conversation.customer?.name ||
                          conversation.customer?.email}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(
                          conversation.lastMessageAt || conversation.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => show("conversations", conversation.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Total: {data?.total || 0} conversations
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
