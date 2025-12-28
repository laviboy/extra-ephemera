import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
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
  FileText,
  Download,
  Send,
  Printer,
  Eye,
  Plus,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
  CreditCard,
  Receipt,
  FileCheck,
} from "lucide-react";
import { mockInvoices } from "../../data/mockData";

export function DocumentsInvoicing() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Mobile-Optimized Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Documents & Invoicing
          </h1>
          <p className="text-sm text-muted-foreground">
            Automated document generation and payment tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 md:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Create Invoice</span>
            <span className="md:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Mobile-Optimized KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="p-4 md:pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium">
                Outstanding
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold">$3.4K</div>
            <p className="text-xs text-orange-600">2 invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium">
                Overdue
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold text-red-600">$0</div>
            <p className="text-xs text-green-600">All current</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium">
                This Month
              </CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold">$12.4K</div>
            <p className="text-xs text-muted-foreground">8 invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium">
                Paid YTD
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold text-green-600">
              $156K
            </div>
            <p className="text-xs text-muted-foreground">124 invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-Friendly Tabs */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          {/* Mobile Card View for Small Screens */}
          <div className="block md:hidden space-y-3">
            {mockInvoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{invoice.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.invoiceNumber}
                      </p>
                    </div>
                    <Badge
                      variant={
                        invoice.status === "paid"
                          ? "default"
                          : invoice.status === "partial"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-bold">
                        ${invoice.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className="font-bold text-green-600">
                        ${invoice.paid.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className="text-xs">{invoice.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="font-bold text-orange-600">
                        ${(invoice.amount - invoice.paid).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Send className="h-3 w-3 mr-1" />
                      Send
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">
                        ${invoice.paid.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-orange-600 font-medium">
                        ${(invoice.amount - invoice.paid).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "default"
                              : invoice.status === "partial"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    customer: "Michael Chen",
                    amount: 5600,
                    date: "Dec 20, 2024",
                    method: "Credit Card",
                    status: "completed",
                  },
                  {
                    customer: "Sarah Johnson",
                    amount: 3400,
                    date: "Dec 15, 2024",
                    method: "Bank Transfer",
                    status: "completed",
                  },
                  {
                    customer: "Lisa Anderson",
                    amount: 7500,
                    date: "Dec 10, 2024",
                    method: "Credit Card",
                    status: "completed",
                  },
                ].map((payment, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {payment.customer}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.date} • {payment.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ${payment.amount.toLocaleString()}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {payment.status}
                      </Badge>
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
              <CardTitle className="text-base md:text-lg">
                Document Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {[
                  {
                    name: "Booking Confirmation",
                    description:
                      "Automated confirmation with itinerary details",
                    icon: FileCheck,
                    color: "bg-blue-100 text-blue-600",
                  },
                  {
                    name: "Travel Voucher",
                    description: "Hotel and service vouchers",
                    icon: Receipt,
                    color: "bg-green-100 text-green-600",
                  },
                  {
                    name: "Invoice Template",
                    description: "Professional invoice with payment terms",
                    icon: FileText,
                    color: "bg-purple-100 text-purple-600",
                  },
                  {
                    name: "Travel Insurance",
                    description: "Insurance policy documents",
                    icon: FileText,
                    color: "bg-orange-100 text-orange-600",
                  },
                  {
                    name: "Terms & Conditions",
                    description: "Booking terms and cancellation policy",
                    icon: FileText,
                    color: "bg-pink-100 text-pink-600",
                  },
                  {
                    name: "Itinerary PDF",
                    description: "Complete day-by-day itinerary",
                    icon: Calendar,
                    color: "bg-cyan-100 text-cyan-600",
                  },
                ].map((template, idx) => (
                  <Card
                    key={idx}
                    className="hover:border-primary cursor-pointer transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-lg ${template.color}`}>
                          <template.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm md:text-base">
                            {template.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button size="sm" className="flex-1">
                              <Plus className="h-3 w-3 mr-1" />
                              Generate
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                Recent Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {[
                    {
                      name: "Barcelona Itinerary - Sarah Johnson",
                      type: "PDF",
                      date: "Dec 26, 2024",
                      size: "245 KB",
                    },
                    {
                      name: "Invoice INV-2024-1234",
                      type: "PDF",
                      date: "Dec 25, 2024",
                      size: "128 KB",
                    },
                    {
                      name: "Booking Confirmation - Michael Chen",
                      type: "PDF",
                      date: "Dec 24, 2024",
                      size: "156 KB",
                    },
                    {
                      name: "Travel Insurance Policy",
                      type: "PDF",
                      date: "Dec 23, 2024",
                      size: "892 KB",
                    },
                    {
                      name: "Hotel Voucher - Marriott",
                      type: "PDF",
                      date: "Dec 22, 2024",
                      size: "89 KB",
                    },
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {doc.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.date} • {doc.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Generate Invoice</p>
                      <p className="text-xs text-muted-foreground">
                        Create new invoice from booking
                      </p>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Send className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Send Confirmation</p>
                      <p className="text-xs text-muted-foreground">
                        Email booking confirmation
                      </p>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Receipt className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Create Voucher</p>
                      <p className="text-xs text-muted-foreground">
                        Generate service vouchers
                      </p>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Printer className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Print Travel Pack</p>
                      <p className="text-xs text-muted-foreground">
                        Complete document set
                      </p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  {
                    name: "Booking Confirmation Email",
                    opens: "94%",
                    clicks: "67%",
                  },
                  { name: "Payment Reminder", opens: "88%", clicks: "45%" },
                  { name: "Pre-Trip Information", opens: "92%", clicks: "78%" },
                  { name: "Post-Trip Follow-up", opens: "76%", clicks: "34%" },
                  { name: "Promotional Offer", opens: "65%", clicks: "23%" },
                ].map((template, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{template.name}</p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Opens: {template.opens}</span>
                        <span>Clicks: {template.clicks}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
