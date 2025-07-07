import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ServiceCalendar } from "@/components/service/ServiceCalendar";
import { ServiceTicketsList } from "@/components/service/ServiceTicketsList";
import { NewServiceJobForm } from "@/components/service/NewServiceJobForm";
import { ServiceTicketDetail } from "@/components/service/ServiceTicketDetail";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, List } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Service() {
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [activeView, setActiveView] = useState<"calendar" | "list">("list");

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Service Management</h1>
            <p className="text-muted-foreground">Manage service appointments and track job progress</p>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={showNewJobForm} onOpenChange={setShowNewJobForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Service Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Create New Service Job</DialogTitle>
                </DialogHeader>
                <NewServiceJobForm onSuccess={() => setShowNewJobForm(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "calendar" | "list")}>
          <TabsList>
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>List View</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Calendar View</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TabsContent value="list" className="mt-0">
                  <ServiceTicketsList 
                    onTicketSelect={setSelectedTicket}
                    selectedTicket={selectedTicket}
                  />
                </TabsContent>
                
                <TabsContent value="calendar" className="mt-0">
                  <ServiceCalendar 
                    onTicketSelect={setSelectedTicket}
                  />
                </TabsContent>
              </div>

              <div className="lg:col-span-1">
                <ServiceTicketDetail 
                  ticket={selectedTicket}
                  onClose={() => setSelectedTicket(null)}
                  onUpdate={() => {
                    // Refresh the tickets list
                    setSelectedTicket(null);
                  }}
                />
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}