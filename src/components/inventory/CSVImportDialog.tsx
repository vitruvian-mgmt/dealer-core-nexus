import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "vehicles" | "parts";
}

export function CSVImportDialog({ open, onOpenChange, type }: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Here you would implement the CSV parsing and database insertion logic
      // For now, we'll just simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Import successful",
        description: `${type} have been imported successfully.`,
      });
      
      onOpenChange(false);
      setFile(null);
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import CSV file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const vehicleHeaders = [
      "vin", "make", "model", "year", "trim", "exterior_color", "interior_color",
      "mileage", "purchase_price", "sale_price", "status", "location", "notes"
    ];
    
    const partHeaders = [
      "part_number", "name", "brand", "category", "quantity", "reorder_threshold",
      "unit_cost", "sale_price", "bin_location", "supplier_name", "description"
    ];

    const headers = type === "vehicles" ? vehicleHeaders : partHeaders;
    const csvContent = headers.join(",") + "\n";
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import {type === "vehicles" ? "Vehicles" : "Parts"} from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template download */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Download Template</h3>
                    <p className="text-sm text-muted-foreground">
                      Download a sample CSV template with the correct format
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File upload */}
          <div className="space-y-4">
            <Label htmlFor="csv-upload">Upload CSV File</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Choose a CSV file or drag and drop it here
                  </p>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
            </div>

            {file && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">
                  <strong>Selected file:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            )}
          </div>

          {/* Required fields info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Required Fields</h3>
              <div className="text-sm text-muted-foreground">
                {type === "vehicles" ? (
                  <ul className="list-disc list-inside space-y-1">
                    <li>VIN (required, unique)</li>
                    <li>Make and Model (recommended)</li>
                    <li>Year (recommended)</li>
                    <li>Status (available, sold, pending, service)</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Part Number (required, unique)</li>
                    <li>Name (required)</li>
                    <li>Quantity (required, number)</li>
                    <li>Reorder Threshold (recommended, number)</li>
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? "Importing..." : "Import CSV"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}