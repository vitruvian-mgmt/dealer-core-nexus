import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, Clock, User, Car, Phone, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface ServiceTicket {
  id: string;
  job_number: string;
  customer_id: string;
  vehicle_id: string | null;
  service_type: string;
  status: string | null;
  priority: string | null;
  scheduled_at: string | null;
  description: string | null;
  complaint: string | null;
  created_at: string;
  customers?: {
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
  };
  vehicles?: {
    year: number | null;
    make: string | null;
    model: string | null;
    vin: string;
  };
}

interface ServiceTicketCardProps {
  ticket: ServiceTicket;
  isSelected: boolean;
  onClick: () => void;
  onUpdate: () => void;
}

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

const getPriorityColor = (priority: string | null) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

export function ServiceTicketCard({ ticket, isSelected, onClick, onUpdate }: ServiceTicketCardProps) {
  const customerName = ticket.customers 
    ? `${ticket.customers.first_name} ${ticket.customers.last_name}`
    : 'Unknown Customer';

  const vehicleInfo = ticket.vehicles
    ? `${ticket.vehicles.year || ''} ${ticket.vehicles.make || ''} ${ticket.vehicles.model || ''}`.trim()
    : 'No vehicle assigned';

  const isOverdue = ticket.scheduled_at && new Date(ticket.scheduled_at) < new Date() && ticket.status !== 'completed';

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]",
        isSelected && "ring-2 ring-primary shadow-lg",
        isOverdue && "border-destructive/30 bg-destructive/5"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-foreground">#{ticket.job_number}</h3>
                {isOverdue && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{ticket.service_type}</p>
            </div>
            <div className="flex items-center space-x-2">
              {ticket.priority && (
                <Badge className={cn("text-xs", getPriorityColor(ticket.priority))}>
                  {ticket.priority}
                </Badge>
              )}
              <Badge className={cn("text-xs", getStatusColor(ticket.status))}>
                {ticket.status || 'No Status'}
              </Badge>
            </div>
          </div>

          {/* Customer & Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{customerName}</p>
                {ticket.customers?.phone && (
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{ticket.customers.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {ticket.vehicles && (
              <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{vehicleInfo}</p>
                  <p className="text-xs text-muted-foreground">VIN: {ticket.vehicles.vin.slice(-8)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description/Complaint */}
          {(ticket.description || ticket.complaint) && (
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {ticket.complaint || ticket.description}
              </p>
            </div>
          )}

          {/* Schedule Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {ticket.scheduled_at ? (
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Scheduled: {format(new Date(ticket.scheduled_at), 'MMM d, h:mm a')}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Not scheduled</span>
              </div>
            )}
            
            <span>Created: {format(new Date(ticket.created_at), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}