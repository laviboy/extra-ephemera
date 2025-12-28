import { useShow, useOne } from "@refinedev/core";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Textarea } from "../../../ui/textarea";
import { ArrowLeft, Send } from "lucide-react";

export function ConversationShow() {
  const { id } = useParams();
  const { query } = useShow({
    resource: "conversations",
    id,
    meta: {
      select: "*, customer:customerId(name, email)",
    },
  });

  const conversation = query.data?.data;

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {conversation?.subject || "Conversation"}
            </h2>
            <p className="text-slate-600">
              With{" "}
              {conversation?.customer?.name || conversation?.customer?.email}
            </p>
          </div>
        </div>
        <Badge>{conversation?.type}</Badge>
      </div>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                {conversation?.customer?.name || "Customer"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Message content will appear here
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {new Date(conversation?.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Reply Box */}
          <div className="mt-6">
            <Textarea placeholder="Type your reply..." rows={4} />
            <div className="mt-3 flex justify-end">
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Send Reply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
