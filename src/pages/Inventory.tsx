import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { InventoryGrid } from "@/components/inventory/InventoryGrid";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { CSVImportDialog } from "@/components/inventory/CSVImportDialog";
import { NewItemDialog } from "@/components/inventory/NewItemDialog";
import { ItemDetailPanel } from "@/components/inventory/ItemDetailPanel";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<"vehicles" | "parts">("vehicles");
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showLowStock, setShowLowStock] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    location: "",
    priceRange: [0, 100000] as [number, number],
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your vehicles and parts inventory</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowLowStock(!showLowStock)}
              className={showLowStock ? "bg-destructive/10 text-destructive border-destructive/20" : ""}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Low Stock
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCSVImport(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setShowNewItem(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add {activeTab === "vehicles" ? "Vehicle" : "Part"}
            </Button>
          </div>
        </div>

        <InventoryStats />

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "vehicles" | "parts")}>
          <TabsList>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="parts">Parts</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <InventoryFilters 
              filters={filters}
              onFiltersChange={setFilters}
              type={activeTab}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <TabsContent value="vehicles" className="mt-0">
                <InventoryGrid
                  type="vehicles"
                  filters={filters}
                  showLowStock={showLowStock}
                  onItemSelect={setSelectedItem}
                  selectedItem={selectedItem}
                />
              </TabsContent>
              
              <TabsContent value="parts" className="mt-0">
                <InventoryGrid
                  type="parts"
                  filters={filters}
                  showLowStock={showLowStock}
                  onItemSelect={setSelectedItem}
                  selectedItem={selectedItem}
                />
              </TabsContent>
            </div>

            <div className="lg:col-span-1">
              <ItemDetailPanel 
                item={selectedItem}
                type={activeTab}
                onClose={() => setSelectedItem(null)}
                onUpdate={() => {
                  // Refresh the grid
                  setSelectedItem(null);
                }}
              />
            </div>
          </div>
        </Tabs>

        <CSVImportDialog 
          open={showCSVImport}
          onOpenChange={setShowCSVImport}
          type={activeTab}
        />

        <NewItemDialog
          open={showNewItem}
          onOpenChange={setShowNewItem}
          type={activeTab}
        />
      </div>
    </Layout>
  );
}