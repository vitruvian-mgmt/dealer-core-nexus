import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, User, Mail, Phone, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { LeadStatusSelect } from "./LeadStatusSelect";
import { LeadPrioritySelect } from "./LeadPrioritySelect";

interface Lead {
  id: string;
  customer_id: string | null;
  assigned_to: string | null;
  source: string | null;
  status: string;
  priority: string;
  estimated_value: number | null;
  notes: string | null;
  next_follow_up: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  };
}

interface LeadItemProps {
  lead: Lead;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: () => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'contacted': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'qualified': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'proposal': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'negotiation': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'won': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'lost': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

export function LeadItem({ lead, isExpanded, onToggleExpand, onUpdate }: LeadItemProps) {
  const customerName = lead.customers 
    ? `${lead.customers.first_name} ${lead.customers.last_name}`
    : 'No customer assigned';

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={onToggleExpand}
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="font-medium text-foreground">{customerName}</h3>
                <Badge className={cn("text-xs", getStatusColor(lead.status))}>
                  {lead.status}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", getPriorityColor(lead.priority))}>
                  {lead.priority}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                {lead.customers?.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>{lead.customers.email}</span>
                  </div>
                )}
                {lead.customers?.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>{lead.customers.phone}</span>
                  </div>
                )}
                {lead.source && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {lead.source}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              {lead.estimated_value && (
                <p className="font-medium text-foreground">
                  ${lead.estimated_value.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {format(new Date(lead.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <LeadStatusSelect 
                    leadId={lead.id}
                    currentStatus={lead.status}
                    onUpdate={onUpdate}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <LeadPrioritySelect 
                    leadId={lead.id}
                    currentPriority={lead.priority}
                    onUpdate={onUpdate}
                  />
                </div>

                {lead.next_follow_up && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Next Follow-up</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(lead.next_follow_up), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {lead.customers && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Contact Information</label>
                    <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                      {lead.customers.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3" />
                          <span>{lead.customers.email}</span>
                        </div>
                      )}
                      {lead.customers.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3" />
                          <span>{lead.customers.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {lead.notes && (
              <div>
                <label className="text-sm font-medium text-foreground">Notes</label>
                <p className="mt-1 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  {lead.notes}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <Button variant="outline" size="sm">
                Convert to Quote
              </Button>
              <Button variant="outline" size="sm">
                Schedule Follow-up
              </Button>
              <Button variant="outline" size="sm">
                View Customer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}