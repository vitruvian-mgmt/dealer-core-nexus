import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface LeadPrioritySelectProps {
  leadId: string;
  currentPriority: string;
  onUpdate: () => void;
}

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export function LeadPrioritySelect({ leadId, currentPriority, onUpdate }: LeadPrioritySelectProps) {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handlePriorityChange = async (newPriority: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ priority: newPriority })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Priority updated",
        description: `Lead priority changed to ${newPriority}`,
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating lead priority:', error);
      toast({
        title: "Error",
        description: "Failed to update lead priority",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Select value={currentPriority} onValueChange={handlePriorityChange} disabled={updating}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {priorities.map((priority) => (
          <SelectItem key={priority.value} value={priority.value}>
            {priority.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}