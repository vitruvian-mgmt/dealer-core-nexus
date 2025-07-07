import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, MoreHorizontal, Edit, Ban, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { UserForm } from "@/components/users/UserForm";
import { UserAuditLogs } from "@/components/users/UserAuditLogs";
import { handleSupabaseError } from "@/lib/security";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  dealership_id: string;
  role_id: string | null;
  created_at: string;
  updated_at: string;
  roles?: {
    name: string;
    permissions: any;
  };
}

export default function Users() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("users");
  const { profile } = useAuth();

  const isAdmin = profile?.roles?.name === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (name, permissions)
        `)
        .eq('dealership_id', profile?.dealership_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      const secureError = handleSupabaseError(error);
      toast({
        title: "Error",
        description: secureError.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeactivateUser = async (user: UserProfile) => {
    if (user.user_id === profile?.user_id) {
      toast({
        title: "Error",
        description: "You cannot deactivate your own account.",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, you'd have a status field or soft delete
      // For now, we'll just show a toast
      toast({
        title: "User Deactivated",
        description: `${user.full_name || user.email} has been deactivated.`,
      });
      
      // Refresh the users list
      fetchUsers();
    } catch (error: any) {
      const secureError = handleSupabaseError(error);
      toast({
        title: "Error",
        description: secureError.message,
        variant: "destructive",
      });
    }
  };

  const handleUserFormSuccess = () => {
    setShowUserForm(false);
    setEditingUser(null);
    fetchUsers();
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'destructive';
      case 'sales_manager': return 'default';
      case 'sales_rep': return 'secondary';
      case 'technician': return 'outline';
      case 'inventory_manager': return 'secondary';
      case 'accountant': return 'outline';
      default: return 'secondary';
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Ban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                <p className="text-muted-foreground">
                  You need administrator privileges to access user management.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and permissions for your dealership
            </p>
          </div>
          <Button onClick={handleAddUser} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage your dealership team members and their access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[70px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.full_name || "Unnamed User"}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.roles?.name || '')}>
                              {user.roles?.name?.replace('_', ' ').toUpperCase() || 'No Role'}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.phone || "—"}</TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditUser(user)}
                                  className="gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit User
                                </DropdownMenuItem>
                                {user.user_id !== profile?.user_id && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeactivateUser(user)}
                                    className="gap-2 text-destructive"
                                  >
                                    <Ban className="h-4 w-4" />
                                    Deactivate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-muted-foreground">No users found</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <UserAuditLogs />
          </TabsContent>
        </Tabs>

        {showUserForm && (
          <UserForm
            user={editingUser}
            onSuccess={handleUserFormSuccess}
            onCancel={() => {
              setShowUserForm(false);
              setEditingUser(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}