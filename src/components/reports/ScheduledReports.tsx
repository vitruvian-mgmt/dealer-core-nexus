import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Clock, 
  Mail, 
  Calendar,
  Edit2,
  Trash2,
  Play,
  Pause,
  Download
} from "lucide-react";

interface ScheduledReport {
  id: string;
  name: string;
  report_type: string;
  schedule_cron: string;
  schedule_enabled: boolean;
  delivery_method: string;
  delivery_emails: string[];
  parameters: any;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
}

export function ScheduledReports() {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    report_type: "",
    frequency: "weekly",
    delivery_method: "email",
    delivery_emails: "",
    description: ""
  });

  useEffect(() => {
    loadScheduledReports();
  }, []);

  const loadScheduledReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading scheduled reports:', error);
      toast({
        title: "Error",
        description: "Failed to load scheduled reports",
        variant: "destructive"
      });
    }
  };

  const createScheduledReport = async () => {
    if (!formData.name || !formData.report_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Convert frequency to cron expression
      const cronMap = {
        daily: '0 8 * * *',     // 8 AM daily
        weekly: '0 8 * * 1',    // 8 AM every Monday
        monthly: '0 8 1 * *'    // 8 AM on 1st of every month
      };

      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('dealership_id')
        .eq('user_id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('reports')
        .insert({
          name: formData.name,
          report_type: formData.report_type,
          schedule_cron: cronMap[formData.frequency as keyof typeof cronMap],
          schedule_enabled: true,
          delivery_method: formData.delivery_method,
          delivery_emails: formData.delivery_emails.split(',').map(email => email.trim()),
          description: formData.description,
          parameters: {},
          dealership_id: profile?.dealership_id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scheduled report created successfully"
      });

      setShowCreateDialog(false);
      setFormData({
        name: "",
        report_type: "",
        frequency: "weekly",
        delivery_method: "email",
        delivery_emails: "",
        description: ""
      });
      
      loadScheduledReports();
    } catch (error) {
      console.error('Error creating scheduled report:', error);
      toast({
        title: "Error",
        description: "Failed to create scheduled report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleReportStatus = async (reportId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ schedule_enabled: enabled })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Report ${enabled ? 'enabled' : 'disabled'} successfully`
      });

      loadScheduledReports();
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive"
      });
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled report?')) return;

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scheduled report deleted successfully"
      });

      loadScheduledReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive"
      });
    }
  };

  const runReportNow = async (report: ScheduledReport) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          type: report.report_type,
          format: 'csv',
          parameters: report.parameters,
          delivery: {
            method: 'email',
            emails: report.delivery_emails
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report generated and sent successfully"
      });
    } catch (error) {
      console.error('Error running report:', error);
      toast({
        title: "Error",
        description: "Failed to run report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFrequencyFromCron = (cron: string) => {
    if (cron === '0 8 * * *') return 'Daily';
    if (cron === '0 8 * * 1') return 'Weekly';
    if (cron === '0 8 1 * *') return 'Monthly';
    return 'Custom';
  };

  const getStatusBadge = (report: ScheduledReport) => {
    if (!report.schedule_enabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Scheduled Reports</h2>
          <p className="text-sm text-muted-foreground">Automate report generation and delivery</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Report</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Report Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Weekly Sales Summary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="report_type">Report Type</Label>
                  <Select value={formData.report_type} onValueChange={(value) => setFormData(prev => ({ ...prev, report_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Report</SelectItem>
                      <SelectItem value="inventory">Inventory Report</SelectItem>
                      <SelectItem value="service">Service Report</SelectItem>
                      <SelectItem value="financial">Financial Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery_method">Delivery Method</Label>
                  <Select value={formData.delivery_method} onValueChange={(value) => setFormData(prev => ({ ...prev, delivery_method: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="download">Download Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.delivery_method === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="emails">Email Recipients</Label>
                  <Input
                    id="emails"
                    value={formData.delivery_emails}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_emails: e.target.value }))}
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this scheduled report"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createScheduledReport} disabled={loading}>
                  {loading ? "Creating..." : "Create Schedule"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scheduled Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Scheduled Reports</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first scheduled report to automate data delivery
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {getFrequencyFromCron(report.schedule_cron)}
                      </span>
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {report.delivery_emails.length} recipients
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(report)}
                    <Switch
                      checked={report.schedule_enabled}
                      onCheckedChange={(checked) => toggleReportStatus(report.id, checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm"><strong>Type:</strong> {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)}</p>
                    <p className="text-sm"><strong>Last Run:</strong> {report.last_run_at ? new Date(report.last_run_at).toLocaleDateString() : 'Never'}</p>
                    <p className="text-sm"><strong>Next Run:</strong> {report.next_run_at ? new Date(report.next_run_at).toLocaleDateString() : 'Not scheduled'}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runReportNow(report)}
                      disabled={loading}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingReport(report)}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReport(report.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}