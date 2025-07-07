import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Database, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BackupRecord {
  id: string;
  date: string;
  type: 'automatic' | 'manual';
  status: 'completed' | 'failed' | 'in_progress';
  size: string;
  retention_until: string;
}

export function DataBackupSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [backupHistory] = useState<BackupRecord[]>([
    {
      id: '1',
      date: '2024-01-15 02:00:00',
      type: 'automatic',
      status: 'completed',
      size: '2.4 GB',
      retention_until: '2031-01-15'
    },
    {
      id: '2',
      date: '2024-01-14 02:00:00',
      type: 'automatic',
      status: 'completed',
      size: '2.3 GB',
      retention_until: '2031-01-14'
    },
    {
      id: '3',
      date: '2024-01-13 14:30:00',
      type: 'manual',
      status: 'completed',
      size: '2.3 GB',
      retention_until: '2031-01-13'
    },
    {
      id: '4',
      date: '2024-01-13 02:00:00',
      type: 'automatic',
      status: 'failed',
      size: '-',
      retention_until: '-'
    },
    {
      id: '5',
      date: '2024-01-12 02:00:00',
      type: 'automatic',
      status: 'completed',
      size: '2.2 GB',
      retention_until: '2031-01-12'
    },
  ]);

  const handleOnDemandBackup = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would trigger a backup
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate backup process
      
      toast({
        title: "Backup initiated",
        description: "Your on-demand backup has been started and will appear in the history once completed.",
      });
    } catch (error) {
      toast({
        title: "Backup failed",
        description: "Failed to initiate backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: BackupRecord['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: BackupRecord['status']) => {
    const variants = {
      completed: 'default' as const,
      failed: 'destructive' as const,
      in_progress: 'secondary' as const,
    };
    
    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Backup Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Backup Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">Daily</div>
              <div className="text-sm text-muted-foreground">Automatic Backup</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">7 Years</div>
              <div className="text-sm text-muted-foreground">Retention Period</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">2:00 AM</div>
              <div className="text-sm text-muted-foreground">Scheduled Time</div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={handleOnDemandBackup} disabled={isLoading} className="w-full md:w-auto">
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? "Creating Backup..." : "Create On-Demand Backup"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Retention Until</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backupHistory.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">
                    {new Date(backup.date).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={backup.type === 'automatic' ? 'secondary' : 'outline'}>
                      {backup.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(backup.status)}
                  </TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>
                    {backup.retention_until !== '-' 
                      ? new Date(backup.retention_until).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {backup.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}