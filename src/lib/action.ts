"use server"
import { parseServerActionResponse } from "./utils"
import { createClient } from '@supabase/supabase-js'
import { 
  getNewOpportunities, 
  getTemplates, 
  getEnglishLanguageLearning, 
  getRecurringOpportunities,
  getPreviousEvents,
  getEventsByType,
  createResource,
  createEvent,
  updateResource as updateResourceQuery,
  deleteResource as deleteResourceQuery,
  updateEvent as updateEventQuery,
  deleteEvent as deleteEventQuery
} from "@/lib/supabase-queries";

export const addResource = async(state: any, form:FormData) => {
  console.log("🔧 addResource server action called");
  console.log("📋 Form entries:");
  Array.from(form.entries()).forEach(([key, value]) => {
    console.log(`  ${key}:`, value);
  });
  
  const {title, description, url, secondary_url, image_address, opportunity_deadline, category, notifyAllStudents} = Object.fromEntries(form.entries());

  try{
    console.log("📝 Creating resource with:", {title, description, url, secondary_url, image_address, opportunity_deadline, category, notifyAllStudents});
    
    const resourceData = {
      title: title as string,
      description: description as string,
      url: url as string,
      secondary_url: secondary_url as string || null,
      image_address: image_address as string || null,
      opportunity_deadline: opportunity_deadline as string || null,
      category: category as string
    };

    const result = await createResource(resourceData);
    console.log("✅ Resource created successfully:", result);

    // Send notification emails if requested
    if (notifyAllStudents === 'true') {
      try {
        console.log("📧 ===== EMAIL NOTIFICATION PROCESS START =====");
        console.log("📧 notifyAllStudents value:", notifyAllStudents);
        console.log("📧 Resource details:", { title, category, url });
        
        // Create Supabase client with service role key
        console.log("📧 Creating Supabase client with service role...");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        console.log("📧 Supabase client created successfully");
        
                // Fetch all student emails
        console.log("📧 Fetching student emails from students table...");
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id, email')
          
        console.log("📧 Students query result:", { 
          studentsCount: students?.length || 0, 
          hasError: !!studentsError,
          error: studentsError 
        });
        
        if (studentsError) {
          console.error("❌ Error fetching student emails:", studentsError);
          console.error("❌ Error details:", {
            message: studentsError.message,
            details: studentsError.details,
            hint: studentsError.hint
          });
        } else if (students && students.length > 0) {
          console.log("📧 Raw students data:", students.slice(0, 3)); // Show first 3 for debugging
          
          // First, get all students with their IDs and emails
          const studentsWithEmails = students
            .map(student => ({ id: student.id, email: student.email }))
            .filter(student => student.email); // Only include students with valid emails
          
          console.log(`📧 Students with emails:`, {
            totalStudents: studentsWithEmails.length,
            sampleStudents: studentsWithEmails.slice(0, 5)
          });
          
          if (studentsWithEmails.length === 0) {
            console.warn("⚠️ No valid emails found after filtering");
            return;
          }
          
          // Prioritize students with IDs 21-32
          const priorityStudents = studentsWithEmails.filter(student => 
            student.id >= 21 && student.id <= 32
          );
          
          const otherStudents = studentsWithEmails.filter(student => 
            student.id < 21 || student.id > 32
          );
          
          console.log(`📧 Priority students (IDs 21-32):`, {
            count: priorityStudents.length,
            students: priorityStudents
          });
          
          // Only send to prioritized students (IDs 21-32) for testing
          const limitedEmails = priorityStudents.map(s => s.email);
          
          console.log(`📧 Final email list (TESTING MODE - Priority Students Only):`, {
            priorityStudentsIncluded: priorityStudents.length,
            totalEmails: limitedEmails.length,
            priorityEmails: priorityStudents.map(s => s.email).slice(0, 3),
            allPriorityEmails: priorityStudents.map(s => s.email)
          });
          
          // Map category to actual page URL
          console.log("📧 Mapping category to URL...");
          const getCategoryUrl = (category: string) => {
            console.log("📧 Category mapping input:", category);
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
            let url;
            switch (category) {
              case 'new_opportunities':
                url = `${baseUrl}/resources/newopportunities`;
                break;
              case 'recurring_opportunities':
                url = `${baseUrl}/resources/internships`;
                break;
              case 'templates':
                url = `${baseUrl}/resources/templates`;
                break;
              case 'english_language_learning':
                url = `${baseUrl}/resources/ell`;
                break;
              default:
                url = `${baseUrl}/resources/newopportunities`;
                break;
            }
            console.log("📧 Mapped URL:", url);
            return url;
          };
          
          // Always use the category page URL, not the external resource URL
          const opportunityLink = getCategoryUrl(category as string);
          console.log("📧 Final opportunity link:", opportunityLink);
          console.log("📧 Original resource URL (not used for email):", url);
          
          // Prepare request payload
          const requestPayload = {
            opportunityName: title,
            opportunityLink: opportunityLink,
            emails: limitedEmails,
            category: category
          };
          console.log("📧 Request payload:", {
            opportunityName: requestPayload.opportunityName,
            opportunityLink: requestPayload.opportunityLink,
            category: requestPayload.category,
            emailCount: requestPayload.emails.length,
            sampleEmails: requestPayload.emails.slice(0, 3)
          });
          
          // Call the edge function to send emails
          console.log("📧 Calling edge function...");
          console.log("📧 Edge function URL:", `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-new-opportunity-notification`);
          console.log("📧 Service role key exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
          
          const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-new-opportunity-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify(requestPayload),
          });
          
          console.log("📧 Edge function response status:", notificationResponse.status);
          console.log("📧 Edge function response headers:", Object.fromEntries(notificationResponse.headers.entries()));
          
          const notificationResult = await notificationResponse.json();
          console.log("📧 Edge function response body:", notificationResult);
          
          if (notificationResponse.ok) {
            console.log("✅ Email notification sent successfully!");
            console.log("✅ Response details:", {
              success: notificationResult.success,
              message: notificationResult.message,
              data: notificationResult.data
            });
          } else {
            console.error("❌ Edge function failed:", {
              status: notificationResponse.status,
              statusText: notificationResponse.statusText,
              error: notificationResult.error,
              details: notificationResult.details
            });
          }
        } else {
          console.warn("⚠️ No students found in students table");
        }
        
        console.log("📧 ===== EMAIL NOTIFICATION PROCESS END =====");
      } catch (notificationError) {
        console.error("❌ ===== EMAIL NOTIFICATION ERROR =====");
        console.error("❌ Error type:", typeof notificationError);
        console.error("❌ Error message:", notificationError instanceof Error ? notificationError.message : String(notificationError));
        console.error("❌ Error stack:", notificationError instanceof Error ? notificationError.stack : 'No stack trace');
        console.error("❌ Full error object:", notificationError);
        console.error("❌ ===== END ERROR =====");
        // Don't fail the resource creation if notification fails
      }
    } else {
      console.log("📧 Email notification skipped - notifyAllStudents is not 'true'");
      console.log("📧 notifyAllStudents value:", notifyAllStudents);
      console.log("📧 notifyAllStudents type:", typeof notifyAllStudents);
    }

    return parseServerActionResponse({
      ...result,
      error: '',
      status: 'SUCCESS',
    });
  } catch (error){
    console.error("❌ Error creating resource:", error);
    return parseServerActionResponse({
      error: 'Failed to add resource. Please try again.',
      status: 'ERROR',
    });
  }
}

export const deleteResource = async(resourceId: string) => {
  try {
    await deleteResourceQuery(resourceId);
    console.log("✅ Resource deleted successfully");
    return parseServerActionResponse({
      error: '',
      status: 'SUCCESS',
    });
  } catch (error) {
    console.log(error)
    return parseServerActionResponse({
      error: 'Failed to delete resource. Please try again.',
      status: 'ERROR',
    });
  }
}

export const updateResource = async(resourceId: string, updateData: any) => { 
  try{
    const result = await updateResourceQuery(resourceId, updateData);
    console.log("✅ Resource updated successfully:", result);

    return parseServerActionResponse({
      error: '',
      status: 'SUCCESS',
    });
  } catch (error){
    console.log(error)
    return parseServerActionResponse({
      error: 'Failed to update resource. Please try again.',
      status: 'ERROR',
    });
  }
}



export const addEvent = async(state: any, form:FormData) => {
  console.log("🚀 ===== ADD EVENT ACTION START =====");
  console.log("🔧 addEvent action called");
  console.log("📋 Form entries:");
  Array.from(form.entries()).forEach(([key, value]) => {
    console.log(`  ${key}:`, typeof value, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
  });
  
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Extract form fields including images
    const formEntries = Array.from(form.entries());
    console.log("🔍 Raw form entries:", formEntries.map(([key, value]) => [key, typeof value, value instanceof File ? `File: ${value.name}` : value]));
    
    // Extract all images separately since Object.fromEntries() only keeps the last one for duplicate keys
    const images = formEntries
      .filter(([key]) => key === 'images')
      .map(([, value]) => value as File);
    
    // Extract other form data
    const formData = Object.fromEntries(formEntries.filter(([key]) => key !== 'images'));
    const {title, category, date, description, location, event_organizer_name, event_organizer_role, event_organizer_image, type, heroImageIndex} = formData;
    
    console.log("📝 Extracted values:", { title, category, date, description, location, type });
    console.log("🖼️ Images field type:", typeof images);
    console.log("🖼️ Images field:", images);
    console.log("🎯 Hero image index:", heroImageIndex);
    
    // Validate required fields
    if (!title || !category || !date || !description || !location || !type) {
      throw new Error("Missing required fields: title, category, date, description, location, or type");
    }

    // Structure the event_organizer as an object if provided
    const event_organizer = event_organizer_name ? {
      name: event_organizer_name,
      role: event_organizer_role || '',
      image: event_organizer_image || undefined
    } : undefined;

    console.log("👤 Event organizer:", event_organizer);

    // Process images for gallery
    let gallery = undefined;
    if (images) {
      console.log("🖼️ ===== IMAGE PROCESSING START =====");
      console.log("🖼️ Images field found:", images);
      
      // Handle images array (already extracted from FormData)
      let imageArray: File[] = [];
      
      if (images && Array.isArray(images)) {
        // Convert serialized file objects back to proper File objects if needed
        imageArray = images.map((file: any, index) => {
          console.log(`🔄 Processing image ${index + 1}:`, {
            name: file.name,
            size: file.size,
            type: file.type,
            constructor: file.constructor?.name,
            isFile: file instanceof File
          });
          
          // If it's already a proper File object, use it
          if (file instanceof File) {
            return file;
          }
          
          // If it's a serialized file object, we need to handle it differently
          // For now, let's skip it and log the issue
          console.warn(`⚠️ Image ${index + 1} is not a proper File object:`, file);
          return null;
        }).filter(Boolean) as File[];
      }
      
      console.log("🖼️ Processed images array length:", imageArray.length);
      
      console.log("🖼️ Image array details:");
      imageArray.forEach((file, index) => {
        console.log(`  Image ${index + 1}:`, {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          constructor: file.constructor.name,
          isFile: file instanceof File,
          isBlob: file instanceof Blob
        });
      });
      
      console.log("🖼️ Images will be uploaded to Supabase Storage in the next step");
      console.log("🖼️ ===== IMAGE PROCESSING END =====");
    } else {
      console.log("⚠️ No images provided");
    }

    // Handle gallery images upload to Supabase Storage
    let galleryFolder = null;
    if (images && images.length > 0) {
      console.log("📤 Uploading images to Supabase Storage...");
      
      // Create meaningful folder name with event title and date
      const cleanTitle = (title as string)
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .toLowerCase()
        .substring(0, 50); // Limit to 50 characters
      
      // Format date for folder name (YYYY-MM-DD)
      const formattedDate = new Date(date as string).toISOString().split('T')[0];
      
      const eventFolderName = `${cleanTitle}-${formattedDate}-${Date.now()}`;
      
      // Upload images to Supabase Storage
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const fileName = `image-${i + 1}-${image.name}`;
        const filePath = `${eventFolderName}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('events-gallery')
          .upload(filePath, image);
          
        if (uploadError) {
          console.error(`❌ Error uploading image ${i + 1}:`, uploadError);
        } else {
          console.log(`✅ Uploaded image ${i + 1}: ${fileName}`);
        }
      }
      
      galleryFolder = eventFolderName;
    }

    const eventData = {
      title: title as string,
      category: category as string,
      date: date as string,
      description: description as string,
      location: location as string,
      type: type as string,
      event_organizer_name: event_organizer?.name || null,
      event_organizer_role: event_organizer?.role || null,
      event_organizer_image: event_organizer?.image || null,
      gallery_folder: galleryFolder
    };

    console.log("📄 Final event data to create:", eventData);
    console.log("📤 Calling Supabase createEvent...");

    const result = await createEvent(eventData);

    console.log("✅ Supabase create result:", result);
    console.log("🏁 ===== ADD EVENT ACTION END (SUCCESS) =====");

    return parseServerActionResponse({
      ...result,
      error: '',
      status: 'SUCCESS',
    });
  } catch (error) {
    console.error("💥 ===== ADD EVENT ACTION END (ERROR) =====");
    console.error("💥 Error in addEvent:", error);
    console.error("💥 Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    return parseServerActionResponse({
      error: error instanceof Error ? error.message : 'Failed to add event. Please try again.',
      status: 'ERROR',
    });
  }
}

export const updateEvent = async(form: FormData) => { 
  console.log("🚀 ===== UPDATE EVENT ACTION START =====");
  console.log("🔧 updateEvent action called");
  console.log("📋 Form entries:");
  Array.from(form.entries()).forEach(([key, value]) => {
    console.log(`  ${key}:`, typeof value, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
  });
  
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Extract form fields
    const formEntries = Array.from(form.entries());
    const eventId = form.get('eventId') as string;
    const title = form.get('title') as string;
    const category = form.get('category') as string;
    const date = form.get('date') as string;
    const description = form.get('description') as string;
    const location = form.get('location') as string;
    const type = form.get('type') as string;
    const event_organizer_name = form.get('event_organizer_name') as string;
    const event_organizer_role = form.get('event_organizer_role') as string;
    const event_organizer_image = form.get('event_organizer_image') as string;
    
    // Extract existing images
    const existingImages = formEntries
      .filter(([key]) => key === 'existingImages')
      .map(([, value]) => JSON.parse(value as string));
    
    // Extract new images
    const newImages = formEntries
      .filter(([key]) => key === 'newImages')
      .map(([, value]) => value as File);
    
    console.log("📝 Extracted values:", { eventId, title, category, date, description, location, type });
    console.log("🖼️ Existing images count:", existingImages.length);
    console.log("🖼️ New images count:", newImages.length);
    
    // Validate required fields
    if (!eventId || !title || !category || !date || !description || !location || !type) {
      throw new Error("Missing required fields: eventId, title, category, date, description, location, or type");
    }

    // Structure the event_organizer as an object if provided
    const event_organizer = event_organizer_name ? {
      name: event_organizer_name,
      role: event_organizer_role || '',
      image: event_organizer_image || undefined
    } : undefined;

    // Process new images for gallery
    let gallery = [...existingImages]; // Start with existing images
    
    if (newImages.length > 0) {
      console.log("🖼️ ===== NEW IMAGE PROCESSING START =====");
      console.log("🖼️ New images will be uploaded to Supabase Storage in the next step");
      console.log("🖼️ ===== NEW IMAGE PROCESSING END =====");
    }

    // Handle new images upload to Supabase Storage if any
    let galleryFolder = null;
    if (newImages && newImages.length > 0) {
      console.log("📤 Uploading new images to Supabase Storage...");
      
      // Create meaningful folder name with event title and date
      const cleanTitle = (title as string)
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .toLowerCase()
        .substring(0, 50); // Limit to 50 characters
      
      // Format date for folder name (YYYY-MM-DD)
      const formattedDate = new Date(date as string).toISOString().split('T')[0];
      
      const eventFolderName = `${cleanTitle}-${formattedDate}-${Date.now()}`;
      
      // Upload new images to Supabase Storage
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];
        const fileName = `image-${i + 1}-${image.name}`;
        const filePath = `${eventFolderName}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('events-gallery')
          .upload(filePath, image);
          
        if (uploadError) {
          console.error(`❌ Error uploading new image ${i + 1}:`, uploadError);
        } else {
          console.log(`✅ Uploaded new image ${i + 1}: ${fileName}`);
        }
      }
      
      galleryFolder = eventFolderName;
    }

    // Prepare the update data
    const updateData = {
      type: type as string,
      category: category as string,
      title: title as string,
      description: description as string,
      date: date as string,
      location: location as string,
      event_organizer_name: event_organizer?.name || null,
      event_organizer_role: event_organizer?.role || null,
      event_organizer_image: event_organizer?.image || null,
      ...(galleryFolder && { gallery_folder: galleryFolder })
    };

    console.log("🔄 Updating event with data:", updateData);
    
    // Update the event using Supabase
    const result = await updateEventQuery(eventId, updateData);

    console.log("✅ Event updated successfully:", result);

    return parseServerActionResponse({
      error: '',
      status: 'SUCCESS',
    });
  } catch (error){
    console.error("❌ Error updating event:", error);
    return parseServerActionResponse({
      error: error instanceof Error ? error.message : 'Failed to update event. Please try again.',
      status: 'ERROR',
    });
  }
}

export const deleteEvent = async(eventId: string) => {
  try {
    await deleteEventQuery(eventId);
    console.log("✅ Event deleted successfully");
    return parseServerActionResponse({
      error: '',
      status: 'SUCCESS',
    });
  } catch (error) {
    console.log(error)
    return parseServerActionResponse({
      error: 'Failed to delete event. Please try again.',
      status: 'ERROR',
    });
  }
}

export const fetchResourcesByCategory = async (category: string) => {
  console.log("🔧 fetchResourcesByCategory called with category:", category);
  
  try {
    const { 
      getNewOpportunities, 
      getTemplates, 
      getEnglishLanguageLearning, 
      getRecurringOpportunities 
    } = await import("@/lib/supabase-queries");
    
    let data: any[] = [];
    
    switch (category) {
      case "new-opportunities":
        console.log("Fetching new opportunities...");
        data = await getNewOpportunities();
        break;
      case "recurring-opportunities":
        console.log("Fetching recurring opportunities...");
        data = await getRecurringOpportunities();
        break;
      case "templates":
        console.log("Fetching templates...");
        data = await getTemplates();
        break;
      case "english-learning":
        console.log("Fetching English learning...");
        data = await getEnglishLanguageLearning();
        break;
      default:
        console.log("No matching category found");
        data = [];
    }
    
    console.log("✅ Fetched data:", data);
    return parseServerActionResponse({
      data: Array.isArray(data) ? data : [],
      error: '',
      status: 'SUCCESS',
    });
  } catch (error) {
    console.error("❌ Error fetching resources:", error);
    return parseServerActionResponse({
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch resources',
      status: 'ERROR',
    });
  }
};

export const fetchEventsByType = async (type: string) => {
  console.log("🔧 fetchEventsByType called with type:", type);
  
  try {
    let data: any[] = [];
    
    if (type === "previous_events" || type === "upcoming_events") {
      console.log(`Fetching ${type}...`);
      data = await getEventsByType(type);
    } else {
      console.log("No matching event type found");
      data = [];
    }
    
    console.log("✅ Fetched events data:", data);
    return parseServerActionResponse({
      data: Array.isArray(data) ? data : [],
      error: '',
      status: 'SUCCESS',
    });
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    return parseServerActionResponse({
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch events',
      status: 'ERROR',
    });
  }
};

export const addWorkshop = async(state: any, form:FormData) => {
  console.log("🔧 addWorkshop server action called");
  console.log("📋 Form entries:");
  Array.from(form.entries()).forEach(([key, value]) => {
    console.log(`  ${key}:`, value);
  });
  
  try {
    const formData = Object.fromEntries(form.entries());
    const {
      title, 
      description, 
      presentation_pdf_url, 
      workshop_date, 
      workshop_group,
      assignment_title,
      assignment_description,
      assignment_submission_url,
      assignment_submission_deadline
    } = formData;

    // Build assignment object if assignment fields are provided
    const assignment = assignment_title ? {
      assignment_title,
      assignment_description,
      assignment_submission_url,
      assignment_submission_deadline
    } : undefined;

    const doc = {
      title, 
      description, 
      presentation_pdf_url, 
      workshop_date, 
      workshop_group,
      ...(assignment && { assignment })
    };

    console.log("📝 Creating workshop document with:", doc);
    // TODO: Implement workshop creation in Supabase
    const result = { id: 'placeholder' };
    console.log("✅ Workshop created successfully:", result);

    return parseServerActionResponse({
      ...result,
      error: '',
      status: 'SUCCESS',
    });
  } catch (error){
    console.error("❌ Error creating workshop:", error);
    return parseServerActionResponse({
      error: 'Failed to add workshop. Please try again.',
      status: 'ERROR',
    });
  }
}

export const updateWorkshop = async(workshopId: string, updateData: any) => { 
  try{
    // TODO: Implement workshop update in Supabase
    console.log("Workshop update not yet implemented in Supabase");

    return parseServerActionResponse({
      error: '',
      status: 'SUCCESS',
    });
  } catch (error){
    console.log(error)
    return parseServerActionResponse({
      error: 'Failed to update workshop. Please try again.',
      status: 'ERROR',
    });
  }
}

export const deleteWorkshop = async(workshopId: string) => {
  try {
    // TODO: Implement workshop deletion in Supabase
    console.log("Workshop deletion not yet implemented in Supabase");
    return parseServerActionResponse({
      error: '',
      status: 'SUCCESS',
    });
  } catch (error) {
    console.log(error)
    return parseServerActionResponse({
      error: 'Failed to delete workshop. Please try again.',
      status: 'ERROR',
    });
  }
}

export const fetchWorkshopsByGroup = async (workshopGroup: string) => {
  console.log("🔧 fetchWorkshopsByGroup called with group:", workshopGroup);
  
  try {
    // Note: Workshop functionality needs to be implemented in Supabase
    console.log("Fetching workshops for group:", workshopGroup);
    const data: any[] = []; // TODO: Implement workshop queries in Supabase
    
    console.log("✅ Fetched workshops:", data);
    return parseServerActionResponse({
      data: Array.isArray(data) ? data : [],
      error: '',
      status: 'SUCCESS',
    });
  } catch (error) {
    console.error("❌ Error fetching workshops:", error);
    return parseServerActionResponse({
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch workshops',
      status: 'ERROR',
    });
  }
};