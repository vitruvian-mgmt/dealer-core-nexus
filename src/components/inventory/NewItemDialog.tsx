import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VehicleForm } from "./VehicleForm";
import { PartForm } from "./PartForm";

interface NewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "vehicles" | "parts";
}

export function NewItemDialog({ open, onOpenChange, type }: NewItemDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            Add New {type === "vehicles" ? "Vehicle" : "Part"}
          </DialogTitle>
        </DialogHeader>

        {type === "vehicles" ? (
          <VehicleForm onSuccess={handleSuccess} />
        ) : (
          <PartForm onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
}