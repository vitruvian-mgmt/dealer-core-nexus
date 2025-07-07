import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryStatsProps {}

interface Stats {
  totalVehicles: number;
  availableVehicles: number;
  totalParts: number;
  lowStockParts: number;
  totalInventoryValue: number;
  recentActivity: number;
}

export function InventoryStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    if (!profile?.dealership_id) return;

    setLoading(true);
    try {
      // Fetch vehicle stats
      const { data: vehicleStats } = await supabase
        .from('vehicles')
        .select('status, sale_price')
        .eq('dealership_id', profile.dealership_id);

      // Fetch parts stats
      const { data: partsStats } = await supabase
        .from('parts')
        .select('quantity, reorder_threshold, sale_price')
        .eq('dealership_id', profile.dealership_id);

      if (vehicleStats && partsStats) {
        const totalVehicles = vehicleStats.length;
        const availableVehicles = vehicleStats.filter(v => v.status === 'available').length;
        const totalParts = partsStats.length;
        const lowStockParts = partsStats.filter(p => p.quantity <= (p.reorder_threshold || 10)).length;
        
        const vehicleValue = vehicleStats.reduce((sum, v) => sum + (v.sale_price || 0), 0);
        const partsValue = partsStats.reduce((sum, p) => sum + ((p.sale_price || 0) * p.quantity), 0);
        const totalInventoryValue = vehicleValue + partsValue;

        setStats({
          totalVehicles,
          availableVehicles,
          totalParts,
          lowStockParts,
          totalInventoryValue,
          recentActivity: 0, // This would need a separate query for recent changes
        });
      }
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: "Total Vehicles",
      value: stats.totalVehicles.toLocaleString(),
      color: "text-blue-600",
    },
    {
      label: "Available",
      value: stats.availableVehicles.toLocaleString(),
      color: "text-green-600",
    },
    {
      label: "Total Parts",
      value: stats.totalParts.toLocaleString(),
      color: "text-purple-600",
    },
    {
      label: "Low Stock",
      value: stats.lowStockParts.toLocaleString(),
      color: stats.lowStockParts > 0 ? "text-red-600" : "text-green-600",
    },
    {
      label: "Inventory Value",
      value: `$${(stats.totalInventoryValue / 1000).toFixed(0)}K`,
      color: "text-emerald-600",
    },
    {
      label: "Recent Activity",
      value: stats.recentActivity.toLocaleString(),
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}