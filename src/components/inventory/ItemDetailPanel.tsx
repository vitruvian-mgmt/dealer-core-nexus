import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemDetailPanelProps {
  item: any;
  type: "vehicles" | "parts";
  onClose: () => void;
  onUpdate: () => void;
}

export function ItemDetailPanel({ item, type, onClose, onUpdate }: ItemDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item || {});
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  if (!item) {
    return (
      <Card className="h-fit">
        <CardContent className="p-6 text-center text-muted-foreground">
          Select an item to view details
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from(type)
        .update(editedItem)
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Item updated",
        description: `${type.slice(0, -1)} has been updated successfully.`,
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;

    try {
      const { error } = await supabase
        .from(type)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Item deleted",
        description: `${type.slice(0, -1)} has been deleted successfully.`,
      });

      onClose();
      onUpdate();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'in_stock':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'sold':
      case 'out_of_stock':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pending':
      case 'low_stock':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">
          {type === "vehicles" 
            ? `${item.year || ''} ${item.make || ''} ${item.model || ''}`.trim() || 'Vehicle Details'
            : item.name || 'Part Details'
          }
        </CardTitle>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          <Badge className={cn("text-xs", getStatusColor(item.status))}>
            {item.status || 'Unknown'}
          </Badge>
          {type === "parts" && item.quantity <= (item.reorder_threshold || 10) && (
            <Badge variant="destructive" className="text-xs">
              Low Stock
            </Badge>
          )}
        </div>

        {/* Photos Section */}
        {type === "vehicles" && (
          <>
            <div>
              <h4 className="font-medium mb-2">Photos</h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {item.photos && item.photos.length > 0 ? (
                  item.photos.map((photo: string, index: number) => (
                    <div key={index} className="aspect-video bg-muted rounded-md overflow-hidden">
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 aspect-video bg-muted rounded-md flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No photos</p>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Photos
              </Button>
            </div>
            <Separator />
          </>
        )}

        {/* Editable Fields */}
        <div className="space-y-4">
          {type === "vehicles" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">VIN</label>
                  <Input 
                    value={isEditing ? editedItem.vin || '' : item.vin || ''}
                    onChange={(e) => setEditedItem({...editedItem, vin: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Year</label>
                  <Input 
                    type="number"
                    value={isEditing ? editedItem.year || '' : item.year || ''}
                    onChange={(e) => setEditedItem({...editedItem, year: parseInt(e.target.value)})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Make</label>
                  <Input 
                    value={isEditing ? editedItem.make || '' : item.make || ''}
                    onChange={(e) => setEditedItem({...editedItem, make: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Model</label>
                  <Input 
                    value={isEditing ? editedItem.model || '' : item.model || ''}
                    onChange={(e) => setEditedItem({...editedItem, model: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Mileage</label>
                  <Input 
                    type="number"
                    value={isEditing ? editedItem.mileage || '' : item.mileage || ''}
                    onChange={(e) => setEditedItem({...editedItem, mileage: parseInt(e.target.value)})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Sale Price</label>
                  <Input 
                    type="number"
                    value={isEditing ? editedItem.sale_price || '' : item.sale_price || ''}
                    onChange={(e) => setEditedItem({...editedItem, sale_price: parseFloat(e.target.value)})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                {isEditing ? (
                  <Select value={editedItem.status || ''} onValueChange={(value) => setEditedItem({...editedItem, status: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="service">In Service</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={item.status || ''} disabled className="mt-1" />
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Part Number</label>
                  <Input 
                    value={isEditing ? editedItem.part_number || '' : item.part_number || ''}
                    onChange={(e) => setEditedItem({...editedItem, part_number: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input 
                    value={isEditing ? editedItem.name || '' : item.name || ''}
                    onChange={(e) => setEditedItem({...editedItem, name: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input 
                    type="number"
                    value={isEditing ? editedItem.quantity || '' : item.quantity || ''}
                    onChange={(e) => setEditedItem({...editedItem, quantity: parseInt(e.target.value)})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reorder Threshold</label>
                  <Input 
                    type="number"
                    value={isEditing ? editedItem.reorder_threshold || '' : item.reorder_threshold || ''}
                    onChange={(e) => setEditedItem({...editedItem, reorder_threshold: parseInt(e.target.value)})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Unit Cost</label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={isEditing ? editedItem.unit_cost || '' : item.unit_cost || ''}
                    onChange={(e) => setEditedItem({...editedItem, unit_cost: parseFloat(e.target.value)})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Sale Price</label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={isEditing ? editedItem.sale_price || '' : item.sale_price || ''}
                    onChange={(e) => setEditedItem({...editedItem, sale_price: parseFloat(e.target.value)})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium">Location</label>
            <Input 
              value={isEditing ? editedItem.location || '' : item.location || ''}
              onChange={(e) => setEditedItem({...editedItem, location: e.target.value})}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea 
              value={isEditing ? editedItem.notes || '' : item.notes || ''}
              onChange={(e) => setEditedItem({...editedItem, notes: e.target.value})}
              disabled={!isEditing}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <p className="text-xs text-muted-foreground">
            Created: {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}