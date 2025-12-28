import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Avatar, AvatarFallback } from "../../../ui/avatar";
import { Progress } from "../../../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { ScrollArea } from "../../../ui/scroll-area";
import {
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  Target,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Star,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { mockPipeline, mockCampaigns } from "../../data/mockData";

type Stage =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal-sent"
  | "negotiation"
  | "won"
  | "lost";

export function SalesPipeline() {
  const [pipelineView, setPipelineView] = useState<"leads" | "partners">(
    "leads"
  );

  const stages: { id: Stage; label: string; color: string }[] = [
    { id: "new", label: "New Leads", color: "bg-blue-500" },
    { id: "contacted", label: "Contacted", color: "bg-purple-500" },
    { id: "qualified", label: "Qualified", color: "bg-yellow-500" },
    { id: "proposal-sent", label: "Proposal Sent", color: "bg-orange-500" },
    { id: "negotiation", label: "Negotiation", color: "bg-pink-500" },
    { id: "won", label: "Won", color: "bg-green-500" },
  ];

  const getLeadsByStage = (stage: Stage) => {
    return mockPipeline.leads.filter((lead) => lead.stage === stage);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPipeline.leads.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28%</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +5% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pipeline Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$284K</div>
            <p className="text-xs text-muted-foreground mt-1">
              Potential revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Lead Score
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76</div>
            <p className="text-xs text-muted-foreground mt-1">
              AI-powered scoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Deal Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18d</div>
            <p className="text-xs text-muted-foreground mt-1">
              From lead to close
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Tabs */}
      <Tabs
        value={pipelineView}
        onValueChange={(v: string) => setPipelineView(v as any)}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="leads">Sales Pipeline</TabsTrigger>
            <TabsTrigger value="partners">Partner Pipeline</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        <TabsContent value="leads" className="space-y-4">
          {/* Kanban Board */}
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4" style={{ minWidth: "1400px" }}>
              {stages.map((stage) => {
                const leads = getLeadsByStage(stage.id);
                const totalValue = leads.reduce((sum, lead) => {
                  const budgetMatch = lead.budget.match(/\$([0-9,]+)/);
                  return (
                    sum +
                    (budgetMatch
                      ? parseInt(budgetMatch[1].replace(",", ""))
                      : 0)
                  );
                }, 0);

                return (
                  <div key={stage.id} className="flex-1 min-w-[280px]">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${stage.color}`}
                            />
                            <CardTitle className="text-sm">
                              {stage.label}
                            </CardTitle>
                          </div>
                          <Badge variant="secondary">{leads.length}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ${(totalValue / 1000).toFixed(0)}K value
                        </p>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[600px] px-4 pb-4">
                          <div className="space-y-3">
                            {leads.map((lead) => (
                              <Card
                                key={lead.id}
                                className="border-2 hover:border-primary/50 cursor-pointer transition-colors"
                              >
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                          {lead.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium text-sm">
                                          {lead.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {lead.source}
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground">
                                        AI Score
                                      </span>
                                      <span
                                        className={`font-bold ${getScoreColor(
                                          lead.score
                                        )}`}
                                      >
                                        {lead.score}/100
                                      </span>
                                    </div>
                                    <Progress
                                      value={lead.score}
                                      className="h-1"
                                    />
                                  </div>

                                  <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Target className="h-3 w-3" />
                                      {lead.interest}
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <DollarSign className="h-3 w-3" />
                                      {lead.budget}
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      {lead.travelDate}
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-1">
                                    {lead.tags.map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>

                                  <div className="pt-2 border-t space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground">
                                        Assigned to:
                                      </span>
                                      <span className="font-medium">
                                        {lead.assignedTo}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground">
                                        Next:
                                      </span>
                                      <span className="font-medium">
                                        {lead.nextAction}
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Last contact: {lead.lastContact}
                                    </div>
                                  </div>

                                  <div className="flex gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1 text-xs"
                                    >
                                      <Mail className="h-3 w-3 mr-1" />
                                      Email
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1 text-xs"
                                    >
                                      <Phone className="h-3 w-3 mr-1" />
                                      Call
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="partners" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockPipeline.partners.map((partner) => (
              <Card key={partner.id}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{partner.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {partner.type}
                      </p>
                    </div>
                    <Badge
                      variant={
                        partner.status === "active" ? "default" : "secondary"
                      }
                    >
                      {partner.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      {partner.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {partner.rating} rating
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium mb-2">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {partner.services.map((service) => (
                        <Badge
                          key={service}
                          variant="outline"
                          className="text-xs"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total Deals:
                      </span>
                      <span className="font-medium">{partner.deals}</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" size="sm">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Automation & Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Campaigns & Automation</CardTitle>
            <Button size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{campaign.name}</h4>
                        <Badge
                          variant={
                            campaign.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline">{campaign.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {campaign.startDate} - {campaign.endDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ${(campaign.revenue / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Revenue generated
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{campaign.targets}</p>
                      <p className="text-xs text-muted-foreground">Targets</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{campaign.sent}</p>
                      <p className="text-xs text-muted-foreground">Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{campaign.opened}</p>
                      <p className="text-xs text-muted-foreground">
                        Opened (
                        {Math.round((campaign.opened / campaign.sent) * 100)}%)
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{campaign.clicked}</p>
                      <p className="text-xs text-muted-foreground">
                        Clicked (
                        {Math.round((campaign.clicked / campaign.sent) * 100)}%)
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {campaign.converted}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Converted (
                        {Math.round((campaign.converted / campaign.sent) * 100)}
                        %)
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Progress
                      value={(campaign.converted / campaign.targets) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automated Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "New Lead Welcome",
                trigger: "Lead created",
                actions: 3,
                active: true,
                runs: 145,
              },
              {
                name: "Follow-up Sequence",
                trigger: "No response in 3 days",
                actions: 5,
                active: true,
                runs: 89,
              },
              {
                name: "Booking Confirmation",
                trigger: "Payment received",
                actions: 4,
                active: true,
                runs: 234,
              },
            ].map((workflow, idx) => (
              <Card key={idx}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{workflow.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Trigger: {workflow.trigger}
                      </p>
                    </div>
                    <Badge variant={workflow.active ? "default" : "secondary"}>
                      {workflow.active ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {workflow.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {workflow.actions} actions
                    </span>
                    <span className="font-medium">{workflow.runs} runs</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Zap className="h-3 w-3 mr-2" />
                    Edit Workflow
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
