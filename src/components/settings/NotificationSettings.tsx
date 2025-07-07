import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    lowStock: true,
    newServiceJobs: true,
    completedServices: true,
    scheduledReports: true,
    newLeads: true,
    invoicePayments: false,
    systemUpdates: true,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Notification preferences saved",
        description: "Your notification settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const notificationOptions = [
    {
      key: 'lowStock' as const,
      title: 'Low Stock Alerts',
      description: 'Get notified when inventory items are running low'
    },
    {
      key: 'newServiceJobs' as const,
      title: 'New Service Jobs',
      description: 'Receive alerts for newly scheduled service appointments'
    },
    {
      key: 'completedServices' as const,
      title: 'Completed Services',
      description: 'Get notified when service jobs are marked as complete'
    },
    {
      key: 'scheduledReports' as const,
      title: 'Scheduled Report Deliveries',
      description: 'Receive notifications when scheduled reports are generated'
    },
    {
      key: 'newLeads' as const,
      title: 'New Leads',
      description: 'Get alerted when new customer leads are added'
    },
    {
      key: 'invoicePayments' as const,
      title: 'Invoice Payments',
      description: 'Receive notifications for invoice payments and updates'
    },
    {
      key: 'systemUpdates' as const,
      title: 'System Updates',
      description: 'Get notified about system maintenance and updates'
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {notificationOptions.map((option, index) => (
            <div key={option.key}>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={option.key}>{option.title}</Label>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <Switch
                  id={option.key}
                  checked={notifications[option.key]}
                  onCheckedChange={() => handleToggle(option.key)}
                />
              </div>
              {index < notificationOptions.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}