import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { LeadsList } from "@/components/leads/LeadsList";
import { NewLeadForm } from "@/components/leads/NewLeadForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Leads() {
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leads & CRM</h1>
            <p className="text-muted-foreground">Manage your sales pipeline and customer relationships</p>
          </div>
          <Dialog open={showNewLeadForm} onOpenChange={setShowNewLeadForm}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
              </DialogHeader>
              <NewLeadForm onSuccess={() => setShowNewLeadForm(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <LeadsList />
      </div>
    </Layout>
  );
}