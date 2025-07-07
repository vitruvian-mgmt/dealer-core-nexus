import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaxRate {
  id: string;
  state: string;
  county?: string;
  city?: string;
  rate: number;
  type: 'state' | 'county' | 'city';
}

export function TaxRateSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    { id: '1', state: 'California', rate: 7.25, type: 'state' },
    { id: '2', state: 'California', county: 'Los Angeles', rate: 1.0, type: 'county' },
    { id: '3', state: 'Texas', rate: 6.25, type: 'state' },
  ]);

  const [newTaxRate, setNewTaxRate] = useState<Partial<TaxRate>>({
    state: '',
    rate: 0,
    type: 'state'
  });

  const handleAddTaxRate = () => {
    if (!newTaxRate.state || !newTaxRate.rate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const id = Date.now().toString();
    setTaxRates(prev => [...prev, { ...newTaxRate, id } as TaxRate]);
    setNewTaxRate({ state: '', rate: 0, type: 'state' });
  };

  const handleRemoveTaxRate = (id: string) => {
    setTaxRates(prev => prev.filter(rate => rate.id !== id));
  };

  const handleUpdateTaxRate = (id: string, field: keyof TaxRate, value: string | number) => {
    setTaxRates(prev => prev.map(rate => 
      rate.id === id ? { ...rate, [field]: value } : rate
    ));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Tax rates saved",
        description: "Your tax rate settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save tax rates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Rate Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Tax Rates */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Tax Rates</h3>
          {taxRates.map((taxRate) => (
            <div key={taxRate.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">State</Label>
                  <Input
                    value={taxRate.state}
                    onChange={(e) => handleUpdateTaxRate(taxRate.id, 'state', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={taxRate.type}
                    onValueChange={(value) => handleUpdateTaxRate(taxRate.id, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="state">State</SelectItem>
                      <SelectItem value="county">County</SelectItem>
                      <SelectItem value="city">City</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={taxRate.rate}
                    onChange={(e) => handleUpdateTaxRate(taxRate.id, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveTaxRate(taxRate.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Tax Rate */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Add New Tax Rate</h3>
          <div className="p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="new-state">State</Label>
                <Select
                  value={newTaxRate.state}
                  onValueChange={(value) => setNewTaxRate(prev => ({ ...prev, state: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {usStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-type">Type</Label>
                <Select
                  value={newTaxRate.type}
                  onValueChange={(value) => setNewTaxRate(prev => ({ ...prev, type: value as 'state' | 'county' | 'city' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="state">State</SelectItem>
                    <SelectItem value="county">County</SelectItem>
                    <SelectItem value="city">City</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-rate">Rate (%)</Label>
                <Input
                  id="new-rate"
                  type="number"
                  step="0.01"
                  value={newTaxRate.rate || ''}
                  onChange={(e) => setNewTaxRate(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <Button onClick={handleAddTaxRate} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Tax Rate
            </Button>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Tax Rates"}
        </Button>
      </CardContent>
    </Card>
  );
}
