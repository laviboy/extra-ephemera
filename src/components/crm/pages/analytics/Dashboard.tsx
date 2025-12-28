import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Plane,
  MapPin,
  Star,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  Activity,
  Target,
  Zap,
  Brain,
} from "lucide-react";
import { mockAnalytics } from "../../data/mockData";

export function AnalyticsDashboard() {
  const {
    salesPerformance,
    bookingTrends,
    destinationPopularity,
    seasonalPricing,
    predictiveInsights,
  } = mockAnalytics;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground">
            Real-time performance metrics and predictive analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="monthly">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Sales Performance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesPerformance.thisMonth.revenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {salesPerformance.thisMonth.growth > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">
                    +{salesPerformance.thisMonth.growth}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">
                    {salesPerformance.thisMonth.growth}%
                  </span>
                </>
              )}
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesPerformance.thisMonth.bookings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Booking Value
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesPerformance.thisMonth.averageValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Revenue</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(salesPerformance.thisYear.revenue / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {salesPerformance.thisYear.bookings} bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Booking Trends</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="pricing">Seasonal Pricing</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>6-Month Booking Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Simple bar chart visualization */}
                <div className="h-[300px] flex items-end justify-between gap-4">
                  {bookingTrends.map((trend) => {
                    const maxRevenue = Math.max(
                      ...bookingTrends.map((t) => t.revenue)
                    );
                    const height = (trend.revenue / maxRevenue) * 100;

                    return (
                      <div
                        key={trend.month}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div className="w-full relative group">
                          <div
                            className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80 cursor-pointer"
                            style={{ height: `${height * 2.5}px` }}
                          >
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded-lg p-2 shadow-lg whitespace-nowrap z-10">
                              <p className="text-xs font-medium">
                                {trend.month}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Revenue: ${trend.revenue.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Bookings: {trend.bookings}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-medium">{trend.month}</div>
                        <div className="text-xs text-muted-foreground">
                          {trend.bookings}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Average Monthly Revenue
                    </p>
                    <p className="text-2xl font-bold">
                      $
                      {(
                        bookingTrends.reduce((sum, t) => sum + t.revenue, 0) /
                        bookingTrends.length /
                        1000
                      ).toFixed(0)}
                      K
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Average Monthly Bookings
                    </p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        bookingTrends.reduce((sum, t) => sum + t.bookings, 0) /
                          bookingTrends.length
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Months</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...bookingTrends]
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 3)
                    .map((trend, idx) => (
                      <div
                        key={trend.month}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium">{trend.month}</p>
                            <p className="text-xs text-muted-foreground">
                              {trend.bookings} bookings
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            ${(trend.revenue / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Best
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...bookingTrends]
                    .sort((a, b) => a.revenue - b.revenue)
                    .slice(0, 3)
                    .map((trend) => (
                      <div
                        key={trend.month}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{trend.month}</p>
                          <p className="text-xs text-muted-foreground">
                            {trend.bookings} bookings
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            ${(trend.revenue / 1000).toFixed(0)}K
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            <ArrowUp className="h-3 w-3 mr-1" />
                            Potential
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Destination Popularity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {destinationPopularity.map((dest) => (
                  <div key={dest.destination} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">{dest.destination}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {dest.bookings} bookings
                        </span>
                        <span className="font-bold">{dest.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${dest.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {destinationPopularity.slice(0, 3).map((dest, idx) => (
              <Card key={dest.destination}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="default">#{idx + 1}</Badge>
                    <Plane className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {dest.destination}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bookings:</span>
                      <span className="font-bold">{dest.bookings}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Market Share:
                      </span>
                      <span className="font-bold">{dest.percentage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Value:</span>
                      <span className="font-bold">$5,240</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Peak Season</CardTitle>
                  <TrendingUp className="h-5 w-5 text-red-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {seasonalPricing.peak.map((season, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{season.period}</span>
                      <Badge variant="destructive">{season.multiplier}x</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {season.destinations}
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      Higher demand & prices
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Shoulder Season</CardTitle>
                  <Activity className="h-5 w-5 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {seasonalPricing.shoulder.map((season, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{season.period}</span>
                      <Badge variant="secondary" className="bg-yellow-100">
                        {season.multiplier}x
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {season.destinations}
                    </p>
                    <p className="text-xs text-yellow-600 mt-2">
                      Moderate pricing
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Off-Peak Season</CardTitle>
                  <TrendingDown className="h-5 w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {seasonalPricing.offPeak.map((season, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{season.period}</span>
                      <Badge variant="secondary" className="bg-green-100">
                        {season.multiplier}x
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {season.destinations}
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Best deals available
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Strategy Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    title: "Increase Summer Europe Pricing",
                    description:
                      "Data shows 45% higher demand for European destinations in Jun-Aug",
                    impact: "high",
                    recommendation: "+20% pricing adjustment",
                  },
                  {
                    title: "Early Bird Discounts for Asia",
                    description:
                      "Bookings for Spring Asia trips are 15% below target",
                    impact: "medium",
                    recommendation:
                      "Offer 10% discount for bookings made 90+ days in advance",
                  },
                  {
                    title: "Flash Sale for Caribbean",
                    description: "Jan-Feb Caribbean inventory at 70% capacity",
                    impact: "medium",
                    recommendation:
                      "Run limited-time promotion to fill remaining slots",
                  },
                ].map((rec, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {rec.description}
                        </p>
                      </div>
                      <Badge
                        variant={
                          rec.impact === "high"
                            ? "default"
                            : rec.impact === "medium"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <div className="mt-3 p-3 bg-primary/10 rounded">
                      <p className="text-sm font-medium text-primary">
                        {rec.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                <CardTitle>AI-Powered Predictive Insights</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Machine learning predictions based on historical data and market
                trends
              </p>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {predictiveInsights.map((insight, idx) => (
              <Card
                key={idx}
                className={`border-l-4 ${
                  insight.confidence === "high"
                    ? "border-l-green-500"
                    : insight.confidence === "medium"
                    ? "border-l-yellow-500"
                    : "border-l-orange-500"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-3 rounded-full ${
                          insight.type === "demand"
                            ? "bg-blue-100"
                            : insight.type === "pricing"
                            ? "bg-green-100"
                            : "bg-purple-100"
                        }`}
                      >
                        {insight.type === "demand" && (
                          <TrendingUp className="h-6 w-6 text-blue-600" />
                        )}
                        {insight.type === "pricing" && (
                          <DollarSign className="h-6 w-6 text-green-600" />
                        )}
                        {insight.type === "customer" && (
                          <Users className="h-6 w-6 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <Badge
                          variant={
                            insight.confidence === "high"
                              ? "default"
                              : "secondary"
                          }
                          className="mb-2"
                        >
                          {insight.confidence} confidence
                        </Badge>
                        <h3 className="text-lg font-semibold mb-2">
                          {insight.message}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Based on analysis of{" "}
                          {idx === 0
                            ? "6 months"
                            : idx === 1
                            ? "3 years"
                            : "2 years"}{" "}
                          of historical data
                        </p>
                      </div>
                    </div>
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Potential Impact
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {idx === 0 ? "+$42K" : idx === 1 ? "+$28K" : "+$18K"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Timeframe
                      </p>
                      <p className="text-lg font-bold">
                        {idx === 0 ? "Q1 2025" : idx === 1 ? "Jun 2025" : "Q4"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Action Required
                      </p>
                      <Button size="sm" className="mt-1">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { quarter: "Q1 2025", forecast: 385000, confidence: 92 },
                    { quarter: "Q2 2025", forecast: 420000, confidence: 88 },
                    { quarter: "Q3 2025", forecast: 395000, confidence: 85 },
                    { quarter: "Q4 2025", forecast: 450000, confidence: 78 },
                  ].map((forecast) => (
                    <div
                      key={forecast.quarter}
                      className="p-4 border rounded-lg"
                    >
                      <p className="text-sm text-muted-foreground mb-1">
                        {forecast.quarter}
                      </p>
                      <p className="text-2xl font-bold mb-2">
                        ${(forecast.forecast / 1000).toFixed(0)}K
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Confidence:
                        </span>
                        <span className="font-medium">
                          {forecast.confidence}%
                        </span>
                      </div>
                      <div className="h-1 bg-muted rounded-full mt-2">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${forecast.confidence}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
