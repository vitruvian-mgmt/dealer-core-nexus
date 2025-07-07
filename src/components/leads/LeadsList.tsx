import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LeadItem } from "./LeadItem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

const ITEMS_PER_PAGE = 10;

export function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    fetchLeads();
  }, [currentPage, profile]);

  const fetchLeads = async () => {
    if (!profile?.dealership_id) return;

    setLoading(true);
    try {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      
      const { data, error, count } = await supabase
        .from('leads')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email,
            phone
          )
        `, { count: 'exact' })
        .eq('dealership_id', profile.dealership_id)
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + ITEMS_PER_PAGE - 1);

      if (error) throw error;

      setLeads(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleLeadUpdate = () => {
    fetchLeads();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No leads found. Create your first lead to get started!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {leads.map((lead) => (
          <LeadItem
            key={lead.id}
            lead={lead}
            isExpanded={expandedLead === lead.id}
            onToggleExpand={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
            onUpdate={handleLeadUpdate}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} leads
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}