import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AssignmentEmailParams {
  assignment_title: string;
  description: string;
  deadline: Date;
  student_emails: string[];
  crc_class_name: string;
}

/**
 * Send new assignment notification emails to all students in a specific CRC class group
 */
export const sendNewAssignmentNotification = async (params: AssignmentEmailParams) => {
  try {
    console.log('📧 sendNewAssignmentNotification called with params:', params);
    console.log('📧 Sending new assignment notification emails:', {
      assignment_title: params.assignment_title,
      crc_class_name: params.crc_class_name,
      student_count: params.student_emails.length,
      deadline: params.deadline,
      deadline_type: typeof params.deadline,
      deadline_iso: params.deadline.toISOString()
    });

    const response = await supabase.functions.invoke('send_new_assignment_email', {
      body: {
        assignment_title: params.assignment_title,
        description: params.description,
        deadline: params.deadline.toISOString(),
        student_emails: params.student_emails,
        crc_class_name: params.crc_class_name
      }
    });

    if (response.error) {
      console.error('❌ Assignment email function error:', response.error);
      throw new Error(`Failed to send assignment notification emails: ${response.error.message}`);
    }

    console.log('✅ Assignment notification emails sent successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Error sending assignment notification emails:', error);
    throw error;
  }
};
