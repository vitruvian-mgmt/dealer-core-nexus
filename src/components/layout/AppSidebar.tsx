import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Wrench,
  FileText,
  Settings,
  UserCheck
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth, UserRole } from "@/hooks/useAuth";

const menuItems = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: LayoutDashboard,
    roles: ['admin', 'sales_manager', 'sales_rep', 'technician', 'inventory_manager', 'accountant']
  },
  { 
    title: "Leads & CRM", 
    url: "/leads", 
    icon: Users,
    roles: ['admin', 'sales_manager', 'sales_rep']
  },
  { 
    title: "Inventory", 
    url: "/inventory", 
    icon: Package,
    roles: ['admin', 'sales_manager', 'inventory_manager']
  },
  { 
    title: "Service", 
    url: "/service", 
    icon: Wrench,
    roles: ['admin', 'technician', 'sales_manager']
  },
  { 
    title: "Reports", 
    url: "/reports", 
    icon: FileText,
    roles: ['admin', 'sales_manager', 'accountant']
  },
  { 
    title: "Users", 
    url: "/users", 
    icon: UserCheck,
    roles: ['admin']
  },
  { 
    title: "Settings", 
    url: "/settings", 
    icon: Settings,
    roles: ['admin', 'sales_manager', 'sales_rep', 'technician', 'inventory_manager', 'accountant']
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const filteredItems = menuItems.filter(item => 
    profile?.role && item.roles.includes(profile.role)
  );

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "flex items-center gap-3 transition-all duration-200 ease-smooth";
    if (isActive(path)) {
      return `${baseClasses} bg-primary text-primary-foreground font-medium shadow-sm`;
    }
    return `${baseClasses} hover:bg-accent hover:text-accent-foreground`;
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} border-r bg-sidebar transition-all duration-300 ease-smooth`}
    >
      <SidebarContent className="px-2 py-4">
        <div className="mb-6 px-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">DC</span>
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-sidebar-foreground">DealerCore</h2>
                {profile?.dealership_name && (
                  <p className="text-xs text-muted-foreground">{profile.dealership_name}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}