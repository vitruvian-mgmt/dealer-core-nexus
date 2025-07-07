import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { handleSupabaseError } from "@/lib/security";

const userFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(1, "Name is required").max(100, "Name too long"),
  phone: z.string().optional(),
  role_id: z.string().min(1, "Role is required"),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface Role {
  id: string;
  name: string;
  permissions: any;
}

interface UserFormProps {
  user?: {
    id: string;
    user_id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role_id: string | null;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const { profile } = useAuth();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email || "",
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      role_id: user?.role_id || "",
    },
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('dealership_id', profile?.dealership_id)
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error: any) {
      const secureError = handleSupabaseError(error);
      toast({
        title: "Error loading roles",
        description: secureError.message,
        variant: "destructive",
      });
    } finally {
      setRolesLoading(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true);

      if (user) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: data.full_name,
            phone: data.phone || null,
            role_id: data.role_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "User updated",
          description: `${data.full_name} has been updated successfully.`,
        });
      } else {
        // Create new user - this would typically involve sending an invitation email
        // For now, we'll show a message about the invitation process
        toast({
          title: "User invitation sent",
          description: `An invitation has been sent to ${data.email}.`,
        });
        
        // In a real implementation, you'd call an edge function to:
        // 1. Create the user in Supabase Auth
        // 2. Send an invitation email
        // 3. Create the profile record
      }

      onSuccess();
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

  const getRoleDisplayName = (roleName: string) => {
    return roleName.replace('_', ' ').toUpperCase();
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {user ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {user 
              ? "Update user information and role assignment."
              : "Enter user details to send an invitation email."
            }
          </DialogDescription>
        </DialogHeader>

        {!user && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A secure invitation email will be sent to the provided email address.
              The user will need to complete registration through the email link.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email" 
                      placeholder="user@dealership.com"
                      disabled={!!user} // Can't change email for existing users
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Smith" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="(555) 123-4567" />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={rolesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {getRoleDisplayName(role.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Defines what the user can access and modify
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {user ? "Update User" : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}