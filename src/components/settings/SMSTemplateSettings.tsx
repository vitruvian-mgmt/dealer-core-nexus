import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function SMSTemplateSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("service_complete");
  const [templates, setTemplates] = useState({
    service_complete: "Hi {customer_name}, your {vehicle_make} {vehicle_model} service is complete! Please call us at {dealership_phone} to arrange pickup. Thank you!",
    appointment_reminder: "Reminder: Your service appointment for {vehicle_make} {vehicle_model} is tomorrow at {appointment_time}. See you then!",
    invoice_ready: "Your invoice #{invoice_number} for {vehicle_make} {vehicle_model} is ready. Total: ${total_amount}. Please visit us for payment.",
    payment_received: "Thank you {customer_name}! We've received your payment of ${payment_amount} for invoice #{invoice_number}.",
  });

  const templateOptions = [
    { value: "service_complete", label: "Service Complete" },
    { value: "appointment_reminder", label: "Appointment Reminder" },
    { value: "invoice_ready", label: "Invoice Ready" },
    { value: "payment_received", label: "Payment Received" },
  ];

  const availableVariables = [
    "{customer_name}",
    "{vehicle_make}",
    "{vehicle_model}",
    "{dealership_phone}",
    "{appointment_time}",
    "{invoice_number}",
    "{total_amount}",
    "{payment_amount}",
  ];

  const handleTemplateChange = (value: string) => {
    setTemplates(prev => ({
      ...prev,
      [selectedTemplate]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "SMS templates saved",
        description: "Your SMS template settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SMS templates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Template Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="template-select">Select Template</Label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template" />
            </SelectTrigger>
            <SelectContent>
              {templateOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="template-content">Template Content</Label>
          <Textarea
            id="template-content"
            value={templates[selectedTemplate as keyof typeof templates]}
            onChange={(e) => handleTemplateChange(e.target.value)}
            rows={6}
            placeholder="Enter your SMS template..."
          />
          <p className="text-xs text-muted-foreground">
            Character count: {templates[selectedTemplate as keyof typeof templates].length}/160
          </p>
        </div>

        <div className="space-y-2">
          <Label>Available Variables</Label>
          <div className="flex flex-wrap gap-2">
            {availableVariables.map((variable) => (
              <Badge key={variable} variant="secondary" className="cursor-pointer">
                {variable}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Click on a variable to copy it to your clipboard
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Preview</h4>
          <p className="text-sm text-muted-foreground">
            {templates[selectedTemplate as keyof typeof templates]
              .replace('{customer_name}', 'John Doe')
              .replace('{vehicle_make}', 'Toyota')
              .replace('{vehicle_model}', 'Camry')
              .replace('{dealership_phone}', '(555) 123-4567')
              .replace('{appointment_time}', '2:00 PM')
              .replace('{invoice_number}', 'INV-2024-0001')
              .replace('{total_amount}', '299.99')
              .replace('{payment_amount}', '299.99')}
          </p>
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Templates"}
        </Button>
      </CardContent>
    </Card>
  );
}