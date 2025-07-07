import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X, Save, Camera, CheckCircle, Clock, User, Car, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ServiceTicketDetailProps {
  ticket: any;
  onClose: () => void;
  onUpdate: () => void;
}

export function ServiceTicketDetail({ ticket, onClose, onUpdate }: ServiceTicketDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const { toast } = useToast();

  if (!ticket) {
    return (
      <Card className="h-fit">
        <CardContent className="p-6 text-center text-muted-foreground">
          Select a service ticket to view details
        </CardContent>
      </Card>
    );
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const updates: any = { status: newStatus };
      
      // If marking as completed, set completed_at timestamp
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_jobs')
        .update(updates)
        .eq('id', ticket.id);

      if (error) throw error;

      // If completed, trigger notifications
      if (newStatus === 'completed') {
        await handleServiceCompletion();
      }

      toast({
        title: "Status updated",
        description: `Service ticket marked as ${newStatus}`,
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleServiceCompletion = async () => {
    try {
      // Create notification for accounting to generate invoice
      await supabase.rpc('create_notification', {
        dealership_uuid: ticket.dealership_id,
        user_uuid: null, // Will notify all accounting users
        title_text: 'Service Job Completed',
        message_text: `Service job #${ticket.job_number} has been completed. Please generate an invoice.`,
        notification_type: 'info',
        reference_type_text: 'service_jobs',
        reference_uuid: ticket.id
      });

      toast({
        title: "Service completed",
        description: "Notifications sent to accounting team and customer",
      });
    } catch (error) {
      console.error('Error sending completion notifications:', error);
    }
  };

  const handleAddNotes = async () => {
    if (!notes.trim()) return;

    setIsUpdating(true);
    try {
      const currentNotes = ticket.internal_notes || "";
      const newNotes = currentNotes + (currentNotes ? "\n\n" : "") + 
        `[${format(new Date(), 'MMM d, yyyy h:mm a')}] ${notes}`;

      const { error } = await supabase
        .from('service_jobs')
        .update({ internal_notes: newNotes })
        .eq('id', ticket.id);

      if (error) throw error;

      setNotes("");
      toast({
        title: "Notes added",
        description: "Internal notes have been updated",
      });

      onUpdate();
    } catch (error) {
      console.error('Error adding notes:', error);
      toast({
        title: "Error",
        description: "Failed to add notes",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'in_progress': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'waiting_parts': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const customerName = ticket.customers 
    ? `${ticket.customers.first_name} ${ticket.customers.last_name}`
    : 'Unknown Customer';

  const vehicleInfo = ticket.vehicles
    ? `${ticket.vehicles.year || ''} ${ticket.vehicles.make || ''} ${ticket.vehicles.model || ''}`.trim()
    : 'No vehicle assigned';

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">
          Service Ticket #{ticket.job_number}
        </CardTitle>
        <Button size="sm" variant="outline" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge className={cn("text-xs", getStatusColor(ticket.status))}>
            {ticket.status || 'No Status'}
          </Badge>
          {ticket.priority && (
            <Badge variant="outline" className="text-xs">
              Priority: {ticket.priority}
            </Badge>
          )}
        </div>

        {/* Customer Information */}
        <div>
          <h4 className="font-medium mb-3 flex items-center">
            <User className="h-4 w-4 mr-2" />
            Customer Information
          </h4>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {customerName}</p>
            {ticket.customers?.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3" />
                <span>{ticket.customers.phone}</span>
              </div>
            )}
            {ticket.customers?.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3" />
                <span>{ticket.customers.email}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Vehicle Information */}
        {ticket.vehicles && (
          <>
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Car className="h-4 w-4 mr-2" />
                Vehicle Information
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>Vehicle:</strong> {vehicleInfo}</p>
                <p><strong>VIN:</strong> {ticket.vehicles.vin}</p>
                {ticket.vehicles.mileage && (
                  <p><strong>Mileage:</strong> {ticket.vehicles.mileage.toLocaleString()} miles</p>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Service Details */}
        <div>
          <h4 className="font-medium mb-3">Service Details</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Service Type:</strong> {ticket.service_type}</p>
            {ticket.complaint && (
              <div>
                <strong>Customer Complaint:</strong>
                <p className="mt-1 bg-muted/50 p-3 rounded-md">{ticket.complaint}</p>
              </div>
            )}
            {ticket.description && (
              <div>
                <strong>Description:</strong>
                <p className="mt-1 bg-muted/50 p-3 rounded-md">{ticket.description}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Schedule Information */}
        <div>
          <h4 className="font-medium mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Schedule
          </h4>
          <div className="space-y-2 text-sm">
            {ticket.scheduled_at ? (
              <p><strong>Scheduled:</strong> {format(new Date(ticket.scheduled_at), 'MMM d, yyyy h:mm a')}</p>
            ) : (
              <p className="text-muted-foreground">Not scheduled</p>
            )}
            <p><strong>Created:</strong> {format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}</p>
            {ticket.completed_at && (
              <p><strong>Completed:</strong> {format(new Date(ticket.completed_at), 'MMM d, yyyy h:mm a')}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Status Update */}
        <div>
          <h4 className="font-medium mb-3">Update Status</h4>
          <Select value={ticket.status || ""} onValueChange={handleStatusUpdate} disabled={isUpdating}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="waiting_parts">Waiting for Parts</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Photo Attachments */}
        <div>
          <h4 className="font-medium mb-3">Diagnostic Photos</h4>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {ticket.photos && ticket.photos.length > 0 ? (
              ticket.photos.map((photo: string, index: number) => (
                <div key={index} className="aspect-video bg-muted rounded-md overflow-hidden">
                  <img src={photo} alt={`Diagnostic ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="col-span-2 aspect-video bg-muted rounded-md flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No photos uploaded</p>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Upload Diagnostic Photos
          </Button>
        </div>

        {/* Internal Notes */}
        <div>
          <h4 className="font-medium mb-3">Internal Notes</h4>
          {ticket.internal_notes && (
            <div className="bg-muted/50 p-3 rounded-md mb-3 text-sm whitespace-pre-wrap">
              {ticket.internal_notes}
            </div>
          )}
          <div className="space-y-2">
            <Textarea
              placeholder="Add internal notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            <Button 
              size="sm" 
              onClick={handleAddNotes}
              disabled={!notes.trim() || isUpdating}
            >
              <Save className="h-4 w-4 mr-2" />
              Add Notes
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        {ticket.status !== 'completed' && (
          <>
            <Separator />
            <div className="flex space-x-2">
              <Button 
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}