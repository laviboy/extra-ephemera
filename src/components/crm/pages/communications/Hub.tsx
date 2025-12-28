import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { ScrollArea } from "../../../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import {
  Mail,
  MessageSquare,
  Phone,
  Send,
  Search,
  Filter,
  Archive,
  Star,
  Trash2,
  MoreVertical,
  ArrowLeft,
  TrendingUp,
  Eye,
  MousePointer,
  Reply,
  Facebook,
  Instagram,
  Twitter,
  CheckCheck,
} from "lucide-react";
import { mockCommunications, mockCustomers } from "../../data/mockData";

export function CommunicationHub() {
  const [selectedComm, setSelectedComm] = useState<string | null>(null);
  const [channel, setChannel] = useState<string>("all");

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channelType: string) => {
    switch (channelType) {
      case "email":
        return "bg-blue-500";
      case "whatsapp":
        return "bg-green-500";
      case "sms":
        return "bg-purple-500";
      case "phone":
        return "bg-orange-500";
      case "facebook":
        return "bg-blue-600";
      case "instagram":
        return "bg-pink-500";
      case "twitter":
        return "bg-sky-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredComms =
    channel === "all"
      ? mockCommunications
      : mockCommunications.filter((c) => c.channel === channel);

  const selected = selectedComm
    ? mockCommunications.find((c) => c.id === selectedComm)
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Messages
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Reply className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg response time: 2.3 hrs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Email campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Link engagement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Communication Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Unified Inbox</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button size="sm">
                <Send className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-4">
            {/* Sidebar - Message List */}
            <div className="col-span-4 space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search messages..." className="pl-10" />
                </div>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger>
                    <SelectValue placeholder="All channels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="inbox" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="inbox">Inbox</TabsTrigger>
                  <TabsTrigger value="sent">Sent</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>

                <TabsContent value="inbox" className="mt-4">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {filteredComms.map((comm) => (
                        <div
                          key={comm.id}
                          onClick={() => setSelectedComm(comm.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedComm === comm.id
                              ? "bg-muted border-primary"
                              : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-full ${getChannelColor(
                                comm.channel
                              )}`}
                            >
                              {getChannelIcon(comm.channel)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm truncate">
                                  {comm.customerName}
                                </span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(comm.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm font-medium truncate">
                                {comm.subject}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {comm.preview}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  variant={
                                    comm.status === "unread"
                                      ? "default"
                                      : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {comm.status}
                                </Badge>
                                {comm.labels.map((label) => (
                                  <Badge
                                    key={label}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="sent">
                  <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                    No sent messages
                  </div>
                </TabsContent>

                <TabsContent value="archived">
                  <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                    No archived messages
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Main Content - Message Detail */}
            <div className="col-span-8 border-l pl-4">
              {selected ? (
                <div className="space-y-4">
                  {/* Message Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={mockCustomers[0].avatar} />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {selected.customerName}
                          </h3>
                          <div
                            className={`p-1 rounded-full ${getChannelColor(
                              selected.channel
                            )}`}
                          >
                            {getChannelIcon(selected.channel)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selected.date}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {selected.subject}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Message Thread */}
                  <ScrollArea className="h-[450px] border rounded-lg p-4">
                    <div className="space-y-6">
                      {/* Original Message */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={mockCustomers[0].avatar} />
                            <AvatarFallback>SC</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {selected.customerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {selected.date}
                            </p>
                          </div>
                        </div>
                        <div className="bg-muted p-4 rounded-lg ml-10">
                          <p className="text-sm">{selected.preview}</p>
                          <p className="text-sm mt-2">
                            I saw that you have an option to upgrade to a suite
                            with ocean view. What would be the additional cost
                            for that? Also, can we get early check-in since our
                            flight arrives at 10 AM?
                          </p>
                          <p className="text-sm mt-2">Thank you!</p>
                        </div>
                      </div>

                      {/* Response */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 ml-auto justify-end">
                          <div className="text-right">
                            <p className="text-sm font-medium">Agent Maria</p>
                            <p className="text-xs text-muted-foreground">
                              2 hours ago
                            </p>
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>AM</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-lg mr-10">
                          <p className="text-sm">
                            Hi Sarah! Great to hear from you.
                          </p>
                          <p className="text-sm mt-2">
                            The ocean view suite upgrade would be an additional
                            $800 for your entire stay. It includes a private
                            balcony and complimentary breakfast.
                          </p>
                          <p className="text-sm mt-2">
                            For early check-in, I've already contacted the hotel
                            and they've confirmed they can accommodate that at
                            no extra charge. I'll send you the updated
                            confirmation shortly.
                          </p>
                          <p className="text-sm mt-2">
                            Let me know if you'd like to proceed with the suite
                            upgrade!
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <CheckCheck className="h-3 w-3" />
                            Read
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>

                  {/* Reply Box */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type your reply..."
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Add Template
                        </Button>
                        <Button variant="outline" size="sm">
                          Attach File
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Select defaultValue="email">
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                              </div>
                            </SelectItem>
                            <SelectItem value="whatsapp">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                WhatsApp
                              </div>
                            </SelectItem>
                            <SelectItem value="sms">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                SMS
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a message to view</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                name: "Email",
                sent: 450,
                opened: 302,
                clicked: 89,
                color: "bg-blue-500",
              },
              {
                name: "WhatsApp",
                sent: 230,
                opened: 218,
                clicked: 156,
                color: "bg-green-500",
              },
              {
                name: "SMS",
                sent: 185,
                opened: 172,
                clicked: 45,
                color: "bg-purple-500",
              },
              {
                name: "Phone",
                sent: 89,
                opened: 89,
                clicked: 89,
                color: "bg-orange-500",
              },
              {
                name: "Social",
                sent: 156,
                opened: 134,
                clicked: 67,
                color: "bg-pink-500",
              },
            ].map((channel) => (
              <div
                key={channel.name}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${channel.color}`} />
                  <span className="font-medium">{channel.name}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sent:</span>
                    <span className="font-medium">{channel.sent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Opened:</span>
                    <span className="font-medium">{channel.opened}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Engaged:</span>
                    <span className="font-medium">{channel.clicked}</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {Math.round((channel.opened / channel.sent) * 100)}% open
                    rate
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
