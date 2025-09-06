"use server";


import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// Validation schema for workshop creation
const workshopSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  presentation_pdf_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  workshop_date: z.string().min(1, "Workshop date is required"),
  workshop_group: z.enum([
    'ey',
    'senior_4',
    'senior_5_group_a_b',
    'senior_5_customer_care',
    'senior_6_group_a_b',
    'senior_6_group_c',
    'senior_6_group_d'
  ], {
    errorMap: () => ({ message: "Please select a valid workshop group" })
  }),
});

export async function createWorkshopAction(prevState, formData) {
  try {
    console.log("🔧 createWorkshopAction called");
    
    // Extract form data
    const formValue = {
      title: formData.get("title"),
      description: formData.get("description"),
      presentation_pdf_url: formData.get("presentation_pdf_url"),
      workshop_date: formData.get("workshop_date"),
      workshop_group: formData.get("workshop_group"),
    };

    // Get file if uploaded
    const file = formData.get("presentation_file");

    console.log("📋 Form data:", formValue);
    console.log("📁 File data:", file ? {
      name: file.name,
      size: file.size,
      type: file.type
    } : 'No file');

    // Validate the form data
    const validatedData = await workshopSchema.parseAsync(formValue);
    console.log("✅ Validation passed:", validatedData);

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Define the CRC class names for each group
    const groupMappings = {
      'ey': ['EY A', 'EY B', 'EY C', 'EY D'],
      'senior_4': ['S4MPC + S4MEG', 'S4MCE', 'S4HGL + S4PCB'],
      'senior_5_group_a_b': ['S5 Group A+B'],
      'senior_5_customer_care': ['S5 Customer Care'],
      'senior_6_group_a_b': ['S6 Group A+B'],
      'senior_6_group_c': ['S6 Group C'],
      'senior_6_group_d': ['S6 Group D']
    };

    const targetClassNames = groupMappings[validatedData.workshop_group];
    if (!targetClassNames || targetClassNames.length === 0) {
      throw new Error(`Invalid workshop group: ${validatedData.workshop_group}`);
    }

    // Get CRC class IDs for the workshop group
    const { data: crcClasses, error: crcError } = await supabase
      .from('crc_class')
      .select('id')
      .in('name', targetClassNames);

    if (crcError) {
      throw new Error(`Failed to fetch CRC classes: ${crcError.message}`);
    }

    if (!crcClasses || crcClasses.length === 0) {
      throw new Error(`No CRC classes found for group: ${validatedData.workshop_group}`);
    }

    let presentationUrl = validatedData.presentation_pdf_url?.trim() || null;

    // Handle file upload if a file is provided
    if (file && file.name) {
      console.log('🔍 Processing file upload...');
      try {
        // Validate file type
        if (!file.type.includes('pdf')) {
          throw new Error('Only PDF files are allowed for presentations');
        }

        // Create a safe filename from workshop title
        const safeTitle = validatedData.title.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
        const ext = file.name.split('.').pop() ?? 'pdf';
        const key = crypto.randomUUID();
        const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const path = `workshops/${safeTitle}/${currentDate}/${key}.${ext}`;

        console.log('🔍 File upload details:', {
          originalName: file.name,
          extension: ext,
          generatedKey: key,
          currentDate,
          uploadPath: path,
          fileSize: file.size,
          fileType: file.type
        });

        console.log('🔍 Uploading file to Supabase storage...');
        const { error: uploadError } = await supabase.storage
          .from("presentation_pdfs")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "application/pdf",
          });

        if (uploadError) {
          console.error('❌ File upload failed:', uploadError);
          throw new Error(uploadError.message || "Upload failed");
        }

        console.log('✅ File uploaded successfully to path:', path);

        // Get public URL
        console.log('🔍 Getting public URL for uploaded file...');
        const { data: publicUrlData } = supabase.storage
          .from("presentation_pdfs")
          .getPublicUrl(path);
        presentationUrl = publicUrlData?.publicUrl || null;
        console.log('✅ Public URL generated:', presentationUrl);

      } catch (uploadError) {
        console.error('❌ File upload error:', uploadError);
        throw new Error(`File upload error: ${uploadError.message}`);
      }
    }

    // Prepare workshop data for database
    const workshopData = {
      title: validatedData.title.trim(),
      description: validatedData.description.trim(),
      date: new Date(validatedData.workshop_date),
      presentation_url: presentationUrl,
      has_assignment: false,
    };

    console.log("📝 Creating workshop with data:", workshopData);

    // Insert workshop directly into database
    const { data: result, error } = await supabase
      .from('workshops')
      .insert([workshopData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create workshop');
    }

    // Create workshop-to-CRC-class relationships
    const workshopToCrcData = crcClasses.map(crcClass => ({
      workshop_id: result.id,
      crc_class_id: crcClass.id
    }));

    const { error: relationshipError } = await supabase
      .from('workshop_to_crc_class')
      .insert(workshopToCrcData);

    if (relationshipError) {
      // If relationship creation fails, delete the workshop
      await supabase.from('workshops').delete().eq('id', result.id);
      throw new Error(`Failed to create workshop relationships: ${relationshipError.message}`);
    }

    console.log("🔍 Supabase result:", result);
    console.log("🔍 Supabase error:", error);

    if (error) {
      throw new Error(error.message || 'Failed to create workshop');
    }

    console.log("✅ Workshop created successfully:", result);

    return {
      ...prevState,
      error: "",
      status: "SUCCESS",
      message: "Workshop created successfully!"
    };

  } catch (error) {
    console.error("❌ createWorkshopAction error:", error);
    
    if (error instanceof z.ZodError) {
      // Handle validation errors
      const fieldErrors = {};
      error.errors.forEach((err) => {
        const field = err.path[0];
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(err.message);
      });

      return {
        ...prevState,
        error: "Please fix the validation errors below",
        fieldErrors,
        status: "ERROR"
      };
    }

    return {
      ...prevState,
      error: "An unexpected error occurred. Please try again.",
      status: "ERROR"
    };
  }
}

export async function updateWorkshopAction(prevState, formData) {
  try {
    console.log("🔄 updateWorkshopAction called");
    
    const workshopId = formData.get("workshop_id");
    if (!workshopId) {
      return {
        ...prevState,
        error: "Workshop ID is required",
        status: "ERROR"
      };
    }

    // Extract form data
    const formValue = {
      id: workshopId,
      title: formData.get("title"),
      description: formData.get("description"),
      presentation_url: formData.get("presentation_pdf_url"),
      date: formData.get("workshop_date"),
      workshop_group: formData.get("workshop_group"),
    };

    // Get file if uploaded
    const file = formData.get("presentation_file");

    console.log("📋 Update form data:", formValue);
    console.log("📁 File data:", file ? {
      name: file.name,
      size: file.size,
      type: file.type
    } : 'No file');

    // Validate required fields
    if (!formValue.title || !formValue.description || !formValue.date || !formValue.workshop_group) {
      return {
        ...prevState,
        error: "Missing required fields",
        status: "ERROR"
      };
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Define the CRC class names for each group
    const groupMappings = {
      'ey': ['EY A', 'EY B', 'EY C', 'EY D'],
      'senior_4': ['S4MPC + S4MEG', 'S4MCE', 'S4HGL + S4PCB'],
      'senior_5_group_a_b': ['S5 Group A+B'],
      'senior_5_customer_care': ['S5 Customer Care'],
      'senior_6_group_a_b': ['S6 Group A+B'],
      'senior_6_group_c': ['S6 Group C'],
      'senior_6_group_d': ['S6 Group D']
    };

    const targetClassNames = groupMappings[formValue.workshop_group];
    if (!targetClassNames || targetClassNames.length === 0) {
      return {
        ...prevState,
        error: `Invalid workshop group: ${formValue.workshop_group}`,
        status: "ERROR"
      };
    }

    // Get CRC class IDs for the workshop group
    const { data: crcClasses, error: crcError } = await supabase
      .from('crc_class')
      .select('id')
      .in('name', targetClassNames);

    if (crcError) {
      return {
        ...prevState,
        error: `Failed to fetch CRC classes: ${crcError.message}`,
        status: "ERROR"
      };
    }

    if (!crcClasses || crcClasses.length === 0) {
      return {
        ...prevState,
        error: `No CRC classes found for group: ${formValue.workshop_group}`,
        status: "ERROR"
      };
    }

    let presentationUrl = formValue.presentation_url?.trim() || null;

    // Handle file upload if a file is provided
    if (file && file.name) {
      console.log('🔍 Processing file upload for update...');
      try {
        // Validate file type
        if (!file.type.includes('pdf')) {
          throw new Error('Only PDF files are allowed for presentations');
        }

        // Create a safe filename from workshop title
        const safeTitle = formValue.title.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
        const ext = file.name.split('.').pop() ?? 'pdf';
        const key = crypto.randomUUID();
        const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const path = `workshops/${safeTitle}/${currentDate}/${key}.${ext}`;

        console.log('🔍 File upload details:', {
          originalName: file.name,
          extension: ext,
          generatedKey: key,
          currentDate,
          uploadPath: path,
          fileSize: file.size,
          fileType: file.type
        });

        console.log('🔍 Uploading file to Supabase storage...');
        const { error: uploadError } = await supabase.storage
          .from("presentation_pdfs")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "application/pdf",
          });

        if (uploadError) {
          console.error('❌ File upload failed:', uploadError);
          throw new Error(uploadError.message || "Upload failed");
        }

        console.log('✅ File uploaded successfully to path:', path);

        // Get public URL
        console.log('🔍 Getting public URL for uploaded file...');
        const { data: publicUrlData } = supabase.storage
          .from("presentation_pdfs")
          .getPublicUrl(path);
        presentationUrl = publicUrlData?.publicUrl || null;
        console.log('✅ Public URL generated:', presentationUrl);

      } catch (uploadError) {
        console.error('❌ File upload error:', uploadError);
        throw new Error(`File upload error: ${uploadError.message}`);
      }
    }

    // Prepare workshop data for database update
    const updateData = {
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      date: new Date(formValue.date),
      presentation_url: presentationUrl,
      has_assignment: false,
    };

    console.log("📝 Updating workshop with data:", updateData);

    // Update workshop directly in database
    const { data: result, error } = await supabase
      .from('workshops')
      .update(updateData)
      .eq('id', formValue.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update workshop');
    }

    // Update workshop-to-CRC-class relationships
    // First, delete existing relationships
    const { error: deleteError } = await supabase
      .from('workshop_to_crc_class')
      .delete()
      .eq('workshop_id', formValue.id);

    if (deleteError) {
      throw new Error(`Failed to delete existing workshop relationships: ${deleteError.message}`);
    }

    // Then, create new relationships
    const workshopToCrcData = crcClasses.map(crcClass => ({
      workshop_id: formValue.id,
      crc_class_id: crcClass.id
    }));

    const { error: relationshipError } = await supabase
      .from('workshop_to_crc_class')
      .insert(workshopToCrcData);

    if (relationshipError) {
      throw new Error(`Failed to create workshop relationships: ${relationshipError.message}`);
    }

    console.log("🔍 Supabase result:", result);
    console.log("🔍 Supabase error:", error);

    if (error) {
      throw new Error(error.message || 'Failed to update workshop');
    }

    console.log("✅ Workshop updated successfully:", result);

    return {
      ...prevState,
      error: "",
      status: "SUCCESS",
      message: "Workshop updated successfully!"
    };

  } catch (error) {
    console.error("❌ updateWorkshopAction error:", error);
    return {
      ...prevState,
      error: error.message || "An unexpected error occurred. Please try again.",
      status: "ERROR"
    };
  }
}

export async function deleteWorkshopAction(workshopId) {
  try {
    console.log("🗑️ deleteWorkshopAction called for ID:", workshopId);
    
    if (!workshopId) {
      return {
        success: false,
        error: "Workshop ID is required"
      };
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("🗑️ Deleting workshop with ID:", workshopId);

    // Delete workshop directly from database
    const { error } = await supabase
      .from('workshops')
      .delete()
      .eq('id', workshopId);

    console.log("🔍 Supabase error:", error);

    if (error) {
      throw new Error(error.message || 'Failed to delete workshop');
    }

    console.log("✅ Workshop deleted successfully");

    return {
      success: true,
      message: "Workshop deleted successfully!"
    };

  } catch (error) {
    console.error("❌ deleteWorkshopAction error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred. Please try again."
    };
  }
}

export async function createAssignmentAction(prevState, formData) {
  try {
    console.log("🔧 createAssignmentAction called");
    
    // Extract form data
    const formValue = {
      workshop_id: formData.get("workshop_id"),
      title: formData.get("title"),
      description: formData.get("description"),
      submission_deadline: formData.get("submission_deadline"),
      submission_style: formData.get("submission_style"),
    };

    console.log("📋 Assignment form data:", formValue);

    // Validate required fields
    if (!formValue.workshop_id || !formValue.title || !formValue.description || !formValue.submission_deadline) {
      return {
        ...prevState,
        error: "All fields are required",
        status: "ERROR"
      };
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Prepare assignment data for database
    const assignmentData = {
      workshop_id: parseInt(formValue.workshop_id),
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      submission_idate: new Date(formValue.submission_deadline),
      submission_style: formValue.submission_style,
    };

    console.log("📝 Creating assignment with data:", assignmentData);

    // Insert assignment directly into database
    const { data: result, error } = await supabase
      .from('assignments')
      .insert([assignmentData])
      .select()
      .single();

    console.log("🔍 Supabase result:", result);
    console.log("🔍 Supabase error:", error);

    if (error) {
      throw new Error(error.message || 'Failed to create assignment');
    }

    // Update the workshop to mark it as having an assignment
    const { error: updateError } = await supabase
      .from('workshops')
      .update({ has_assignment: true })
      .eq('id', parseInt(formValue.workshop_id));

    if (updateError) {
      console.error("Warning: Failed to update workshop has_assignment flag:", updateError);
    }

    // Send email notifications to students in the CRC class
    try {
      console.log("📧 Preparing to send assignment notification emails...");
      
      // Get the CRC class group from the form data
      const crcClassGroup = formData.get("crc_class");
      
      if (crcClassGroup) {
        console.log("📧 Found CRC class group for email notifications:", crcClassGroup);
        
        // Define the CRC class names for each group
        const groupMappings = {
          'ey': ['EY A', 'EY B', 'EY C', 'EY D'],
          'senior_4': ['S4MPC + S4MEG', 'S4MCE', 'S4HGL + S4PCB'],
          'senior_5_group_a_b': ['S5 Group A+B'],
          'senior_5_customer_care': ['S5 Customer Care'],
          'senior_6_group_a_b': ['S6 Group A+B'],
          'senior_6_group_c': ['S6 Group C'],
          'senior_6_group_d': ['S6 Group D']
        };
        
        const targetClassNames = groupMappings[crcClassGroup] || [];
        
        if (targetClassNames.length > 0) {
          console.log("📧 Target CRC class names:", targetClassNames);
          
          // First, get the numeric IDs for these CRC class names
          const { data: crcClasses, error: crcClassesError } = await supabase
            .from('crc_class')
            .select('id')
            .in('name', targetClassNames);

          if (crcClassesError) {
            console.error("❌ Failed to fetch CRC class IDs:", crcClassesError);
          } else if (crcClasses && crcClasses.length > 0) {
            const crcClassIds = crcClasses.map(crcClass => crcClass.id);
            console.log("📧 Found CRC class IDs:", crcClassIds);
            
            // Now fetch students using the numeric IDs, limited to student IDs 20-540
            const { data: students, error: studentsError } = await supabase
              .from('students')
              .select('email')
              .in('crc_class_id', crcClassIds)
              .gte('id', 20)
              .lte('id', 540);

            if (studentsError) {
              console.error("❌ Failed to fetch students for email notifications:", studentsError);
            } else if (students && students.length > 0) {
              const studentEmails = students.map(student => student.email).filter(Boolean);
              
              if (studentEmails.length > 0) {
                console.log(`📧 Sending assignment notifications to ${studentEmails.length} students`);
                
                // Import the email function dynamically to avoid circular dependencies
                const { sendNewAssignmentNotification } = await import('@/utils/assignmentEmails');
                
                console.log('📧 About to call sendNewAssignmentNotification with:', {
                  assignment_title: formValue.title,
                  description: formValue.description,
                  deadline: formValue.submission_deadline,
                  deadline_type: typeof formValue.submission_deadline,
                  student_emails_count: studentEmails.length,
                  student_emails: studentEmails,
                  crc_class_group: crcClassGroup,
                  crc_class_name: crcClassGroup.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                });
                
                await sendNewAssignmentNotification({
                  assignment_title: formValue.title,
                  description: formValue.description,
                  deadline: new Date(formValue.submission_deadline),
                  student_emails: studentEmails,
                  crc_class_name: crcClassGroup.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                });
                
                console.log("✅ Assignment notification emails sent successfully");
              } else {
                console.log("⚠️ No valid student emails found for notifications");
              }
            } else {
              console.log("⚠️ No students found in CRC classes for email notifications");
            }
          } else {
            console.log("⚠️ No CRC class IDs found for names:", targetClassNames);
          }
        } else {
          console.log("⚠️ No CRC class names found for group:", crcClassGroup);
        }
      } else {
        console.log("⚠️ No CRC class group found in form data, skipping email notifications");
      }
    } catch (emailError) {
      console.error("❌ Error sending assignment notification emails:", emailError);
      // Don't fail the assignment creation if email fails
    }

    console.log("✅ Assignment created successfully:", result);

    return {
      ...prevState,
      error: "",
      status: "SUCCESS",
      message: "Assignment created successfully!"
    };

  } catch (error) {
    console.error("❌ createAssignmentAction error:", error);
    return {
      ...prevState,
      error: error.message || "An unexpected error occurred. Please try again.",
      status: "ERROR"
    };
  }
}

export async function deleteAssignmentAction(assignmentId) {
  try {
    console.log("🔧 deleteAssignmentAction called for assignment ID:", assignmentId);

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // First, get the assignment to find the workshop_id
    const { data: assignment, error: fetchError } = await supabase
      .from('assignments')
      .select('workshop_id')
      .eq('id', assignmentId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch assignment: ${fetchError.message}`);
    }

    // Delete the assignment
    const { error: deleteError } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (deleteError) {
      throw new Error(`Failed to delete assignment: ${deleteError.message}`);
    }

    // Update the workshop to mark it as not having an assignment
    const { error: updateError } = await supabase
      .from('workshops')
      .update({ has_assignment: false })
      .eq('id', assignment.workshop_id);

    if (updateError) {
      console.error("Warning: Failed to update workshop has_assignment flag:", updateError);
    }

    console.log("✅ Assignment deleted successfully");

    return {
      success: true,
      message: "Assignment deleted successfully!"
    };

  } catch (error) {
    console.error("❌ deleteAssignmentAction error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred. Please try again."
    };
  }
}

export async function updateAssignmentAction(prevState, formData) {
  try {
    console.log("🔧 updateAssignmentAction called");
    
    // Extract form data
    const formValue = {
      assignment_id: formData.get("assignment_id"),
      title: formData.get("title"),
      description: formData.get("description"),
      submission_deadline: formData.get("submission_deadline"),
      submission_style: formData.get("submission_style"),
    };

    console.log("📋 Assignment update form data:", formValue);

    // Validate required fields
    if (!formValue.assignment_id || !formValue.title || !formValue.description || !formValue.submission_deadline) {
      return {
        ...prevState,
        error: "All fields are required",
        status: "ERROR"
      };
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Prepare assignment data for database update
    const assignmentData = {
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      submission_idate: new Date(formValue.submission_deadline),
      submission_style: formValue.submission_style,
    };

    console.log("📝 Updating assignment with data:", assignmentData);

    // Update assignment in database
    const { data: result, error } = await supabase
      .from('assignments')
      .update(assignmentData)
      .eq('id', parseInt(formValue.assignment_id))
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update assignment');
    }

    console.log("✅ Assignment updated successfully:", result);

    return {
      ...prevState,
      error: "",
      status: "SUCCESS",
      message: "Assignment updated successfully!"
    };

  } catch (error) {
    console.error("❌ updateAssignmentAction error:", error);
    return {
      ...prevState,
      error: error.message || "An unexpected error occurred. Please try again.",
      status: "ERROR"
    };
  }
}