import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Car, MapPin, Calendar } from "lucide-react";

interface Vehicle {
  id: string;
  vin: string;
  make: string | null;
  model: string | null;
  year: number | null;
  trim: string | null;
  exterior_color: string | null;
  mileage: number | null;
  sale_price: number | null;
  status: string | null;
  location: string | null;
  photos: string[] | null;
  created_at: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onClick: () => void;
}

const getStatusColor = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case 'available': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'sold': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'service': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

export function VehicleCard({ vehicle, isSelected, onClick }: VehicleCardProps) {
  const displayName = vehicle.make && vehicle.model 
    ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model}`.trim()
    : 'Unknown Vehicle';

  const hasPhoto = vehicle.photos && vehicle.photos.length > 0;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Photo placeholder or actual photo */}
          <div className="relative h-32 bg-muted rounded-md overflow-hidden">
            {hasPhoto ? (
              <img 
                src={vehicle.photos![0]} 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            {vehicle.status && (
              <Badge className={cn("absolute top-2 right-2 text-xs", getStatusColor(vehicle.status))}>
                {vehicle.status}
              </Badge>
            )}
          </div>

          {/* Vehicle info */}
          <div className="space-y-2">
            <div>
              <h3 className="font-medium text-foreground text-sm">{displayName}</h3>
              {vehicle.trim && (
                <p className="text-xs text-muted-foreground">{vehicle.trim}</p>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="truncate">
                <strong>VIN:</strong> {vehicle.vin}
              </div>
              
              {vehicle.mileage && (
                <div>
                  <strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} mi
                </div>
              )}

              {vehicle.exterior_color && (
                <div>
                  <strong>Color:</strong> {vehicle.exterior_color}
                </div>
              )}
            </div>

            {/* Location and date */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {vehicle.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{vehicle.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(vehicle.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Price */}
            {vehicle.sale_price && (
              <div className="pt-2 border-t">
                <p className="text-lg font-semibold text-foreground">
                  ${vehicle.sale_price.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}