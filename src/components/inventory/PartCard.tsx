import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Package, MapPin, AlertTriangle } from "lucide-react";

interface Part {
  id: string;
  part_number: string;
  name: string;
  brand: string | null;
  category: string | null;
  quantity: number;
  reorder_threshold: number | null;
  unit_cost: number | null;
  sale_price: number | null;
  location: string | null;
  bin_location: string | null;
  supplier_name: string | null;
  created_at: string;
}

interface PartCardProps {
  part: Part;
  isSelected: boolean;
  onClick: () => void;
}

const getStockStatus = (quantity: number, threshold: number | null) => {
  const reorderPoint = threshold || 10;
  if (quantity === 0) {
    return { status: 'out_of_stock', label: 'Out of Stock', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
  } else if (quantity <= reorderPoint) {
    return { status: 'low_stock', label: 'Low Stock', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
  } else {
    return { status: 'in_stock', label: 'In Stock', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
  }
};

export function PartCard({ part, isSelected, onClick }: PartCardProps) {
  const stockInfo = getStockStatus(part.quantity, part.reorder_threshold);
  const isLowStock = stockInfo.status === 'low_stock' || stockInfo.status === 'out_of_stock';

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
        isSelected && "ring-2 ring-primary shadow-lg",
        isLowStock && "border-destructive/20"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Part icon and status */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              {isLowStock && (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
            </div>
            <Badge className={cn("text-xs", stockInfo.color)}>
              {stockInfo.label}
            </Badge>
          </div>

          {/* Part info */}
          <div className="space-y-2">
            <div>
              <h3 className="font-medium text-foreground text-sm line-clamp-2">{part.name}</h3>
              <p className="text-xs text-muted-foreground">#{part.part_number}</p>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              {part.brand && (
                <div>
                  <strong>Brand:</strong> {part.brand}
                </div>
              )}
              
              {part.category && (
                <div>
                  <strong>Category:</strong> {part.category}
                </div>
              )}

              <div>
                <strong>Quantity:</strong> {part.quantity}
                {part.reorder_threshold && (
                  <span className="ml-1 text-muted-foreground">
                    (Reorder: {part.reorder_threshold})
                  </span>
                )}
              </div>

              {part.supplier_name && (
                <div>
                  <strong>Supplier:</strong> {part.supplier_name}
                </div>
              )}
            </div>

            {/* Location */}
            {(part.location || part.bin_location) && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">
                  {part.bin_location || part.location}
                </span>
              </div>
            )}

            {/* Pricing */}
            <div className="pt-2 border-t space-y-1">
              {part.unit_cost && (
                <p className="text-xs text-muted-foreground">
                  Cost: ${part.unit_cost.toFixed(2)}
                </p>
              )}
              {part.sale_price && (
                <p className="text-sm font-semibold text-foreground">
                  Price: ${part.sale_price.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}