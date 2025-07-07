import { supabase } from '@/integrations/supabase/client';
import { CreateProfileData } from '@/types/auth';

export const createProfile = async (user: any, profileData: CreateProfileData) => {
  if (!user) return { error: new Error('No user found') };

  try {
    // First, create or get dealership
    let dealership_id: string;
    
    const { data: existingDealership } = await supabase
      .from('dealerships')
      .select('id')
      .eq('name', profileData.dealership_name)
      .single();

    if (existingDealership) {
      dealership_id = existingDealership.id;
    } else {
      const { data: newDealership, error: dealershipError } = await supabase
        .from('dealerships')
        .insert({ 
          name: profileData.dealership_name,
          owner_id: user.id
        })
        .select('id')
        .single();

      if (dealershipError || !newDealership) {
        return { error: new Error('Failed to create dealership') };
      }

      dealership_id = newDealership.id;

      // Create default roles for the new dealership
      const { error: rolesError } = await supabase.rpc('create_default_roles', {
        dealership_uuid: dealership_id
      });

      if (rolesError) {
        console.error('Failed to create default roles:', rolesError);
        return { error: new Error('Failed to create default roles') };
      }
    }

    // Debug: Log all available roles for this dealership
    const { data: allRoles, error: rolesQueryError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('dealership_id', dealership_id);

    console.log('Available roles for dealership:', allRoles);
    console.log('Roles query error:', rolesQueryError);
    console.log('Looking for role:', profileData.role);

    // Get the role_id for the specified role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('dealership_id', dealership_id)
      .eq('name', profileData.role)
      .single();

    console.log('Role query result:', role);
    console.log('Role query error:', roleError);

    if (!role) {
      console.error('Role not found. Available roles:', allRoles?.map(r => r.name));
      return { error: new Error(`Role '${profileData.role}' not found. Available roles: ${allRoles?.map(r => r.name).join(', ')}`) };
    }

    // Create profile with minimal fields (dealership_name will be populated by trigger)
    const { error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email!,
        full_name: profileData.full_name,
        dealership_id: dealership_id,
        role_id: role.id,
        phone: profileData.phone || null,
        dealership_name: profileData.dealership_name, // Keep for compatibility
      });

    return { error };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
};