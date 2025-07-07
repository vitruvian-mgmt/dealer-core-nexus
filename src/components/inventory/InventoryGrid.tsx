import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { VehicleCard } from "./VehicleCard";
import { PartCard } from "./PartCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryGridProps {
  type: "vehicles" | "parts";
  filters: {
    search: string;
    status: string;
    location: string;
    priceRange: [number, number];
  };
  showLowStock: boolean;
  onItemSelect: (item: any) => void;
  selectedItem: any;
}

export function InventoryGrid({ type, filters, showLowStock, onItemSelect, selectedItem }: InventoryGridProps) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    fetchItems();
  }, [type, filters, showLowStock, profile]);

  const fetchItems = async () => {
    if (!profile?.dealership_id) return;

    setLoading(true);
    try {
      // Simple query without complex chaining to avoid TypeScript issues
      const { data, error } = await supabase
        .from(type as any)
        .select('*')
        .eq('dealership_id', profile.dealership_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      let filteredData = data || [];

      // Apply client-side filtering
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter((item: any) => {
          if (type === "vehicles") {
            return (
              item.make?.toLowerCase().includes(searchTerm) ||
              item.model?.toLowerCase().includes(searchTerm) ||
              item.vin?.toLowerCase().includes(searchTerm)
            );
          } else {
            return (
              item.name?.toLowerCase().includes(searchTerm) ||
              item.part_number?.toLowerCase().includes(searchTerm) ||
              item.brand?.toLowerCase().includes(searchTerm)
            );
          }
        });
      }

      if (filters.status) {
        filteredData = filteredData.filter((item: any) => item.status === filters.status);
      }

      if (filters.location) {
        filteredData = filteredData.filter((item: any) => 
          item.location?.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      if (showLowStock && type === "parts") {
        filteredData = filteredData.filter((item: any) => 
          item.quantity <= (item.reorder_threshold || 10)
        );
      }

      setItems(filteredData);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            {showLowStock 
              ? `No ${type} with low stock found.`
              : `No ${type} found. Add your first ${type.slice(0, -1)} to get started!`
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const isSelected = selectedItem?.id === item.id;
        
        if (type === "vehicles") {
          return (
            <VehicleCard
              key={item.id}
              vehicle={item}
              isSelected={isSelected}
              onClick={() => onItemSelect(item)}
            />
          );
        } else {
          return (
            <PartCard
              key={item.id}
              part={item}
              isSelected={isSelected}
              onClick={() => onItemSelect(item)}
            />
          );
        }
      })}
    </div>
  );
}