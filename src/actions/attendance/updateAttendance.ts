'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateAttendanceStatus(
  attendanceId: number,
  newStatus: 'present' | 'absent' | 'late' | 'excused'
) {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .update({ 
        status: newStatus
      })
      .eq('id', attendanceId)
      .select()
      .single();

    if (error) {
      console.error('Error updating attendance status:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Revalidate the attendance page to refresh the data
    revalidatePath('/dashboard/admin/attendance');

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error updating attendance status:', error);
    return {
      success: false,
      error: 'Failed to update attendance status'
    };
  }
}
