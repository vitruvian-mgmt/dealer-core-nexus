import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CalendarIcon, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Eye,
  BarChart3,
  DollarSign,
  Car,
  Wrench,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ReportData {
  title: string;
  data: any[];
  generatedAt: string;
}

const reportTypes = [
  { 
    id: 'sales', 
    name: 'Sales Report', 
    description: 'Vehicle sales, revenue, and customer data',
    icon: DollarSign,
    color: 'text-green-600'
  },
  { 
    id: 'inventory', 
    name: 'Inventory Report', 
    description: 'Current stock levels and vehicle details',
    icon: Car,
    color: 'text-blue-600'
  },
  { 
    id: 'service', 
    name: 'Service Report', 
    description: 'Service jobs, technician performance, revenue',
    icon: Wrench,
    color: 'text-orange-600'
  },
  { 
    id: 'financial', 
    name: 'Financial Report', 
    description: 'Revenue, expenses, and payment tracking',
    icon: BarChart3,
    color: 'text-purple-600'
  }
];

export function ReportGenerator() {
  const [selectedType, setSelectedType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [includeDetails, setIncludeDetails] = useState(true);
  const [groupBy, setGroupBy] = useState("");
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const generateReport = async () => {
    if (!selectedType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          type: selectedType,
          format: 'json',
          parameters: {
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
            includeDetails,
            groupBy: groupBy || undefined
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedReport({
          title: reportTypes.find(t => t.id === selectedType)?.name || 'Report',
          data: data.data || [],
          generatedAt: new Date().toISOString()
        });
        setShowPreview(true);
        
        toast({
          title: "Success",
          description: "Report generated successfully"
        });
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (exportFormat: 'csv' | 'pdf' | 'excel') => {
    if (!generatedReport) return;

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          type: selectedType,
          format: exportFormat === 'excel' ? 'csv' : exportFormat, // Excel is treated as CSV for now
          parameters: {
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
            includeDetails,
            groupBy: groupBy || undefined
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        // Create and download file
        const blob = new Blob([data.data], { 
          type: exportFormat === 'pdf' ? 'application/pdf' : 'text/csv' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${generatedReport.title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: `Report exported as ${exportFormat.toUpperCase()}`
        });
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Report Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <div
                  key={type.id}
                  className={cn(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                    selectedType === type.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className={cn("h-6 w-6", type.color)} />
                    <div>
                      <h3 className="font-medium">{type.name}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report Parameters */}
      {selectedType && (
        <Card>
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Group By */}
            <div className="space-y-2">
              <Label htmlFor="groupBy">Group By (Optional)</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grouping option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  {selectedType === 'sales' && <SelectItem value="salesperson">By Salesperson</SelectItem>}
                  {selectedType === 'inventory' && <SelectItem value="category">By Category</SelectItem>}
                  {selectedType === 'service' && <SelectItem value="technician">By Technician</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* Include Details */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeDetails" 
                checked={includeDetails}
                onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
              />
              <Label htmlFor="includeDetails">Include detailed breakdown</Label>
            </div>

            <Button onClick={generateReport} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Report Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{generatedReport?.title}</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => exportReport('csv')} disabled={loading}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportReport('pdf')} disabled={loading}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportReport('excel')} disabled={loading}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {generatedReport && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge variant="secondary">
                  Generated on {format(new Date(generatedReport.generatedAt), "PPP 'at' p")}
                </Badge>
                <Badge variant="outline">
                  {generatedReport.data.length} records
                </Badge>
              </div>
              
              {generatedReport.data.length > 0 ? (
                <div className="border rounded-lg overflow-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {Object.keys(generatedReport.data[0]).map((key) => (
                          <th key={key} className="p-2 text-left font-medium">
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {generatedReport.data.slice(0, 50).map((row, index) => (
                        <tr key={index} className="border-t">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="p-2">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {generatedReport.data.length > 50 && (
                    <div className="p-2 text-center text-sm text-muted-foreground bg-muted">
                      Showing first 50 of {generatedReport.data.length} records
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data found for the selected criteria
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}