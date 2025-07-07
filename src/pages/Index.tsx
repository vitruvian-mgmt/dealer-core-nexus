import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Car,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Package,
  Wrench,
  Clock,
  MoreHorizontal
} from "lucide-react";

const Index = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-surface">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">DC</span>
          </div>
          <p className="text-muted-foreground">Loading DealerCore...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-surface">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to DealerCore</h1>
          <p className="text-xl text-muted-foreground mb-6">The modern dealer management system</p>
          <Button asChild className="btn-premium">
            <a href="/auth">Get Started</a>
          </Button>
        </div>
      </div>
    );
  }

  const getRoleDashboardContent = () => {
    switch (profile.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'sales_manager':
      case 'sales_rep':
        return <SalesDashboard role={profile.role} />;
      case 'technician':
        return <TechnicianDashboard />;
      case 'inventory_manager':
        return <InventoryDashboard />;
      case 'accountant':
        return <AccountantDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Good morning, {profile.full_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening at {profile.dealership_name} today
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{profile.role.replace('_', ' ').toUpperCase()}</Badge>
          </div>
        </div>
        
        {getRoleDashboardContent()}
      </div>
    </Layout>
  );
};

// Role-specific dashboard components
const AdminDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Revenue"
        value="$124,500"
        change={{ value: "+12.5%", trend: "up" }}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <StatCard
        title="Active Leads"
        value="23"
        change={{ value: "+3", trend: "up" }}
        icon={<Users className="h-5 w-5" />}
      />
      <StatCard
        title="Vehicles in Stock"
        value="45"
        change={{ value: "-2", trend: "down" }}
        icon={<Car className="h-5 w-5" />}
      />
      <StatCard
        title="Service Jobs"
        value="8"
        change={{ value: "+1", trend: "up" }}
        icon={<Wrench className="h-5 w-5" />}
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardWidget 
        title="Recent Activity" 
        icon={<Clock className="h-4 w-4" />}
        action={<Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">New lead assigned to John</span>
            <span className="text-xs text-muted-foreground ml-auto">2 min ago</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm">Service job completed</span>
            <span className="text-xs text-muted-foreground ml-auto">15 min ago</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span className="text-sm">Inventory low on brake pads</span>
            <span className="text-xs text-muted-foreground ml-auto">1 hour ago</span>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget 
        title="Performance Overview" 
        icon={<TrendingUp className="h-4 w-4" />}
      >
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Sales Goal</span>
              <span>75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Customer Satisfaction</span>
              <span>92%</span>
            </div>
            <Progress value={92} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Inventory Turnover</span>
              <span>68%</span>
            </div>
            <Progress value={68} className="h-2" />
          </div>
        </div>
      </DashboardWidget>
    </div>
  </div>
);

const SalesDashboard = ({ role }: { role: string }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="My Leads"
        value="12"
        change={{ value: "+2", trend: "up" }}
        icon={<Users className="h-5 w-5" />}
      />
      <StatCard
        title="Closed Deals"
        value="8"
        change={{ value: "+1", trend: "up" }}
        icon={<CheckCircle className="h-5 w-5" />}
      />
      <StatCard
        title="Revenue Generated"
        value="$45,200"
        change={{ value: "+8.2%", trend: "up" }}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <StatCard
        title="Follow-ups Due"
        value="5"
        icon={<Calendar className="h-5 w-5" />}
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardWidget title="Hot Leads" icon={<AlertCircle className="h-4 w-4" />}>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Sarah Johnson</p>
              <p className="text-sm text-muted-foreground">Looking for SUV</p>
            </div>
            <Badge variant="destructive">Hot</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Mike Chen</p>
              <p className="text-sm text-muted-foreground">Trade-in + purchase</p>
            </div>
            <Badge variant="secondary">Warm</Badge>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Today's Schedule" icon={<Calendar className="h-4 w-4" />}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 text-xs text-muted-foreground">10:00</div>
            <div className="flex-1">
              <p className="text-sm font-medium">Test drive with Sarah</p>
              <p className="text-xs text-muted-foreground">2023 Honda CR-V</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 text-xs text-muted-foreground">14:30</div>
            <div className="flex-1">
              <p className="text-sm font-medium">Follow-up call</p>
              <p className="text-xs text-muted-foreground">Mike Chen - financing</p>
            </div>
          </div>
        </div>
      </DashboardWidget>
    </div>
  </div>
);

const TechnicianDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Jobs Today"
        value="6"
        icon={<Wrench className="h-5 w-5" />}
      />
      <StatCard
        title="Completed"
        value="3"
        change={{ value: "+1", trend: "up" }}
        icon={<CheckCircle className="h-5 w-5" />}
      />
      <StatCard
        title="In Progress"
        value="2"
        icon={<Clock className="h-5 w-5" />}
      />
      <StatCard
        title="Pending"
        value="1"
        icon={<AlertCircle className="h-5 w-5" />}
      />
    </div>

    <DashboardWidget title="Current Jobs" icon={<Wrench className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Oil Change - Honda Accord</p>
            <p className="text-sm text-muted-foreground">Customer: John Smith</p>
          </div>
          <Badge variant="secondary">In Progress</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Brake Repair - Toyota Camry</p>
            <p className="text-sm text-muted-foreground">Customer: Lisa Wong</p>
          </div>
          <Badge variant="outline">Pending</Badge>
        </div>
      </div>
    </DashboardWidget>
  </div>
);

const InventoryDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Vehicles"
        value="45"
        change={{ value: "-2", trend: "down" }}
        icon={<Car className="h-5 w-5" />}
      />
      <StatCard
        title="Low Stock Items"
        value="7"
        change={{ value: "+2", trend: "up" }}
        icon={<AlertCircle className="h-5 w-5" />}
      />
      <StatCard
        title="Parts Inventory"
        value="234"
        icon={<Package className="h-5 w-5" />}
      />
      <StatCard
        title="Reorder Alerts"
        value="3"
        icon={<AlertCircle className="h-5 w-5" />}
      />
    </div>

    <DashboardWidget title="Low Stock Alerts" icon={<AlertCircle className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Brake Pads</p>
            <p className="text-sm text-muted-foreground">Current: 5 units</p>
          </div>
          <Badge variant="destructive">Critical</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Engine Oil (5W-30)</p>
            <p className="text-sm text-muted-foreground">Current: 12 units</p>
          </div>
          <Badge variant="secondary">Low</Badge>
        </div>
      </div>
    </DashboardWidget>
  </div>
);

const AccountantDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Monthly Revenue"
        value="$124,500"
        change={{ value: "+12.5%", trend: "up" }}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <StatCard
        title="Outstanding Invoices"
        value="$8,200"
        change={{ value: "-5.2%", trend: "down" }}
        icon={<AlertCircle className="h-5 w-5" />}
      />
      <StatCard
        title="Expenses"
        value="$35,800"
        icon={<TrendingUp className="h-5 w-5" />}
      />
      <StatCard
        title="Profit Margin"
        value="28%"
        change={{ value: "+2.1%", trend: "up" }}
        icon={<CheckCircle className="h-5 w-5" />}
      />
    </div>

    <DashboardWidget title="Financial Overview" icon={<DollarSign className="h-4 w-4" />}>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Revenue Goal</span>
            <span>$124,500 / $150,000</span>
          </div>
          <Progress value={83} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Expense Budget</span>
            <span>$35,800 / $45,000</span>
          </div>
          <Progress value={79} className="h-2" />
        </div>
      </div>
    </DashboardWidget>
  </div>
);

const DefaultDashboard = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-semibold mb-4">Welcome to DealerCore</h2>
    <p className="text-muted-foreground">Your dashboard is being set up...</p>
  </div>
);

export default Index;
