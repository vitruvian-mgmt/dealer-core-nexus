import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ServiceTicketCard } from "./ServiceTicketCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

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
  [key: string]: any; // Allow additional fields from database
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

interface ServiceTicketsListProps {
  onTicketSelect: (ticket: ServiceTicket) => void;
  selectedTicket: ServiceTicket | null;
}

export function ServiceTicketsList({ onTicketSelect, selectedTicket }: ServiceTicketsListProps) {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { profile } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, [profile]);

  const fetchTickets = async () => {
    if (!profile?.dealership_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_jobs')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone,
            email
          ),
          vehicles (
            year,
            make,
            model,
            vin
          )
        `)
        .eq('dealership_id', profile.dealership_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching service tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = 
      ticket.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customers?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customers?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.service_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, customers, or service types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_parts">Waiting for Parts</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "No service tickets match your filters."
                : "No service tickets found. Create your first service job to get started!"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <ServiceTicketCard
              key={ticket.id}
              ticket={ticket}
              isSelected={selectedTicket?.id === ticket.id}
              onClick={() => onTicketSelect(ticket)}
              onUpdate={fetchTickets}
            />
          ))}
        </div>
      )}
    </div>
  );
}