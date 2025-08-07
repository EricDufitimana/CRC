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

    console.log("📋 Form data:", formValue);

    // Validate the form data
    const validatedData = await workshopSchema.parseAsync(formValue);
    console.log("✅ Validation passed:", validatedData);

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Prepare workshop data for database
    const workshopData = {
      title: validatedData.title.trim(),
      description: validatedData.description.trim(),
      date: new Date(validatedData.workshop_date),
      presentation_url: validatedData.presentation_pdf_url?.trim() || null,
      crc_class: validatedData.workshop_group,
      has_assignment: false,
    };

    console.log("📝 Creating workshop with data:", workshopData);

    // Insert workshop directly into database
    const { data: result, error } = await supabase
      .from('workshops')
      .insert([workshopData])
      .select()
      .single();

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
      crc_class: formData.get("workshop_group"),
    };

    console.log("📋 Update form data:", formValue);

    // Validate required fields
    if (!formValue.title || !formValue.description || !formValue.date || !formValue.crc_class) {
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

    // Prepare workshop data for database update
    const updateData = {
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      date: new Date(formValue.date),
      presentation_url: formValue.presentation_url?.trim() || null,
      crc_class: formValue.crc_class,
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