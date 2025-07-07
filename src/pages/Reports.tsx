import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ReportDashboard } from "@/components/reports/ReportDashboard";
import { ReportGenerator } from "@/components/reports/ReportGenerator";
import { ScheduledReports } from "@/components/reports/ScheduledReports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, Settings } from "lucide-react";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate insights and track your dealership performance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Generate Reports</span>
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Scheduled Reports</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="dashboard" className="mt-0">
              <ReportDashboard />
            </TabsContent>
            
            <TabsContent value="generate" className="mt-0">
              <ReportGenerator />
            </TabsContent>
            
            <TabsContent value="scheduled" className="mt-0">
              <ScheduledReports />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}