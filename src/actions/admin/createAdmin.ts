"use server";

import { createClient } from '@supabase/supabase-js';
import { checkAdminCreationAccess } from './checkAdminCreationAccess';

export async function createAdmin(formData: {
  honorific: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}) {
  try {
    // First check if user is authorized
    const authCheck = await checkAdminCreationAccess();
    if (!authCheck.authorized) {
      return {
        success: false,
        error: authCheck.error || 'Not authorized to create admins'
      };
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: formData.email,
      email_confirm: true,
      user_metadata: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        honorific: formData.honorific
      }
    });

    if (authError) {
      return {
        success: false,
        error: authError.message
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to create user"
      };
    }

    // Create admin record
    const { error: adminError } = await supabase
      .from('admin')
      .insert({
        user_id: authData.user.id,
        honorific: formData.honorific || null,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        email: formData.email
      });

    if (adminError) {
      // Clean up auth user if admin creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        error: adminError.message
      };
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        Names: `${formData.honorific ? formData.honorific + ' ' : ''}${formData.firstName} ${formData.lastName}`,
        role: formData.role as any,
        email: formData.email,
        is_new_user: true,
        has_setup: false,
        welcome_email_sent: false
      });

    if (profileError) {
      console.warn('Profile creation failed:', profileError);
      // Don't fail the entire operation for profile creation
    }

    return {
      success: true,
      message: `${formData.firstName} ${formData.lastName} has been added as an admin.`
    };

  } catch (error) {
    console.error('Error creating admin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}
