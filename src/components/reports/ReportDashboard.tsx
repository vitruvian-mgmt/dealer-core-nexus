import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, DollarSign, Car, Wrench, Users } from "lucide-react";

const salesData = [
  { month: 'Jan', sales: 45, revenue: 180000 },
  { month: 'Feb', sales: 52, revenue: 205000 },
  { month: 'Mar', sales: 48, revenue: 192000 },
  { month: 'Apr', sales: 61, revenue: 244000 },
  { month: 'May', sales: 55, revenue: 220000 },
  { month: 'Jun', sales: 67, revenue: 268000 },
];

const inventoryData = [
  { category: 'Sedans', count: 24, value: 480000 },
  { category: 'SUVs', count: 18, value: 720000 },
  { category: 'Trucks', count: 12, value: 480000 },
  { category: 'Coupes', count: 8, value: 240000 },
];

const serviceData = [
  { month: 'Jan', jobs: 120, revenue: 48000 },
  { month: 'Feb', jobs: 135, revenue: 54000 },
  { month: 'Mar', jobs: 142, revenue: 56800 },
  { month: 'Apr', jobs: 158, revenue: 63200 },
  { month: 'May', jobs: 165, revenue: 66000 },
  { month: 'Jun', jobs: 172, revenue: 68800 },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function ReportDashboard() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 1309000,
    totalSales: 328,
    activeInventory: 62,
    serviceJobs: 892,
    revenueGrowth: 12.5,
    salesGrowth: 8.3,
    inventoryTurnover: -2.1,
    serviceGrowth: 15.2
  });

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{metrics.revenueGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicle Sales</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSales}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{metrics.salesGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Inventory</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeInventory}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              {metrics.inventoryTurnover}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Jobs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.serviceJobs}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{metrics.serviceGrowth}% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trends</CardTitle>
            <div className="flex space-x-2">
              <Badge variant="secondary">6 Month View</Badge>
              <Badge variant="outline">AI Forecast</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sales: { label: "Sales", color: "hsl(var(--chart-1))" },
                revenue: { label: "Revenue", color: "hsl(var(--chart-2))" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar yAxisId="left" dataKey="sales" fill="var(--color-sales)" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Inventory Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Distribution</CardTitle>
            <Badge variant="secondary">Current Stock</Badge>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sedans: { label: "Sedans", color: "hsl(var(--chart-1))" },
                suvs: { label: "SUVs", color: "hsl(var(--chart-2))" },
                trucks: { label: "Trucks", color: "hsl(var(--chart-3))" },
                coupes: { label: "Coupes", color: "hsl(var(--chart-4))" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ category, count }) => `${category}: ${count}`}
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Service Revenue Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Service Department Performance</CardTitle>
            <div className="flex space-x-2">
              <Badge variant="secondary">Monthly Trends</Badge>
              <Badge variant="outline">Growth Projection</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                jobs: { label: "Service Jobs", color: "hsl(var(--chart-1))" },
                revenue: { label: "Service Revenue", color: "hsl(var(--chart-2))" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar yAxisId="left" dataKey="jobs" fill="var(--color-jobs)" />
                  <Bar yAxisId="right" dataKey="revenue" fill="var(--color-revenue)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights & Forecasting</CardTitle>
          <Badge variant="outline">Powered by Analytics Engine</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Sales Forecast</h4>
              <p className="text-sm">Based on current trends, expect 15% increase in Q3 sales with SUV segment leading growth.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Inventory Alert</h4>
              <p className="text-sm">Sedan inventory will deplete in 45 days at current sales rate. Consider restocking.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Service Opportunity</h4>
              <p className="text-sm">Service department shows strong growth potential. Peak demand expected in August.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}