import { supabase } from '@/integrations/supabase/client';
import { CreateProfileData } from '@/types/auth';

export const createProfile = async (user: any, profileData: CreateProfileData) => {
  if (!user) return { error: new Error('No user found') };

  try {
    // First, create or get dealership
    let dealership_id: string;
    let isNewDealership = false;
    
    const { data: existingDealership } = await supabase
      .from('dealerships')
      .select('id')
      .eq('name', profileData.dealership_name)
      .maybeSingle();

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
        console.error('Failed to create dealership:', dealershipError);
        return { error: new Error('Failed to create dealership') };
      }

      dealership_id = newDealership.id;
      isNewDealership = true;

      // Create default roles for the new dealership
      const { error: rolesError } = await supabase.rpc('create_default_roles', {
        dealership_uuid: dealership_id
      });

      if (rolesError) {
        console.error('Failed to create default roles:', rolesError);
        return { error: new Error('Failed to create default roles') };
      }

      // Wait a moment for roles to be created
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Verify roles exist before proceeding
    const { data: allRoles, error: rolesQueryError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('dealership_id', dealership_id);

    console.log('Available roles for dealership:', allRoles);
    console.log('Roles query error:', rolesQueryError);
    console.log('Looking for role:', profileData.role);

    if (!allRoles || allRoles.length === 0) {
      console.error('No roles found for dealership after creation');
      return { error: new Error('Failed to create or retrieve roles for dealership') };
    }

    // Get the role_id for the specified role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('dealership_id', dealership_id)
      .eq('name', profileData.role)
      .maybeSingle();

    console.log('Role query result:', role);
    console.log('Role query error:', roleError);

    if (!role) {
      console.error('Role not found. Available roles:', allRoles?.map(r => r.name));
      return { error: new Error(`Role '${profileData.role}' not found. Available roles: ${allRoles?.map(r => r.name).join(', ')}`) };
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email!,
        full_name: profileData.full_name,
        dealership_id: dealership_id,
        role_id: role.id,
        phone: profileData.phone || null,
        dealership_name: profileData.dealership_name,
      });

    if (profileError) {
      console.error('Failed to create profile:', profileError);
      return { error: new Error('Failed to create profile') };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error in createProfile:', error);
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
};