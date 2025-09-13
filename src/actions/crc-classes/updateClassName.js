'use server';

import { createClient } from '@supabase/supabase-js';

export async function updateClassName(classId, newName) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (!newName || !newName.trim()) {
      throw new Error('Class name is required');
    }

    // Update the class name
    const { data, error } = await supabase
      .from('crc_class')
      .update({ name: newName.trim() })
      .eq('id', classId)
      .select()
      .single();

    if (error) {
      console.error('Error updating class:', error);
      throw new Error('Failed to update class');
    }

    return {
      success: true,
      class: data,
      message: 'Class updated successfully'
    };

  } catch (error) {
    console.error('Class update error:', error);
    throw new Error(error.message || 'Internal server error');
  }
}
