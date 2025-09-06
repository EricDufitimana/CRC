"use server"
import { parseServerActionResponse } from "./utils"
import {writeClient} from "@/sanity/lib/writeClient"
import { client } from "@/sanity/lib/client";
import { createClient } from '@supabase/supabase-js'
import { 
  getNewOpportunities, 
  getTemplates, 
  getEnglishLanguageLearning, 
  getRecurringOpportunities,
  getPreviousEvents,
  getEventsByType
} from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/live";

export const addResource = async(state: any, form:FormData) => {
  console.log("🔧 addResource server action called");
  console.log("📋 Form entries:");
  Array.from(form.entries()).forEach(([key, value]) => {
    console.log(`  ${key}:`, value);
  });
  
  const {title, description, url, secondary_url, image_address, opportunity_deadline, category, notifyAllStudents} = Object.fromEntries(form.entries());

  try{
    console.log("📝 Creating document with:", {title, description, url, secondary_url, image_address, opportunity_deadline, category, notifyAllStudents});
    const doc = {title, description, url, secondary_url, image_address, opportunity_deadline, category}

    const result = await writeClient.create({_type:"resource", ...doc});
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
            let url;
            switch (category) {
              case 'new_opportunities':
                url = 'http://localhost:3000/resources/newopportunities';
                break;
              case 'recurring_opportunities':
                url = 'http://localhost:3000/resources/internships';
                break;
              case 'templates':
                url = 'http://localhost:3000/resources/templates';
                break;
              case 'english_language_learning':
                url = 'http://localhost:3000/resources/ell';
                break;
              default:
                url = 'http://localhost:3000/resources/newopportunities';
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
    await writeClient.delete(resourceId);
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
    await writeClient
    .patch(resourceId)
    .set(updateData)
    .commit();

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
    // Check if writeClient is properly configured
    if (!writeClient) {
      throw new Error("Sanity writeClient is not configured");
    }

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
      
      if (imageArray.length > 0) {
        console.log("📤 Starting image upload to Sanity...");
        
        // Upload images to Sanity and get asset references
        const uploadedImages = [];
        for (let i = 0; i < imageArray.length; i++) {
          const image = imageArray[i];
          console.log(`📤 Uploading image ${i + 1}/${imageArray.length}: ${image.name}`);
          console.log(`📤 Image object details:`, {
            name: image.name,
            size: image.size,
            type: image.type,
            constructor: image.constructor.name,
            isFile: image instanceof File,
            isBlob: image instanceof Blob,
            keys: Object.keys(image)
          });
          
          try {
            // Convert File to Buffer for Sanity upload
            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            console.log(`📤 Uploading buffer for image ${i + 1}:`, {
              bufferSize: buffer.length,
              originalSize: image.size
            });
            
            const asset = await writeClient.assets.upload('image', buffer, {
              filename: image.name || `image-${i + 1}.jpg`,
              contentType: image.type
            });
            console.log(`✅ Image ${i + 1} uploaded successfully:`, asset._id);
            uploadedImages.push(asset);
          } catch (uploadError) {
            console.error(`❌ Failed to upload image ${i + 1}:`, uploadError);
            console.error(`❌ Upload error details:`, {
              message: uploadError instanceof Error ? uploadError.message : 'Unknown error',
              name: uploadError instanceof Error ? uploadError.name : 'Unknown'
            });
            throw new Error(`Failed to upload image ${image.name}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          }
        }
        
        // Create gallery entries with hero image indicator
        const heroIndex = Number(heroImageIndex || 0);
        console.log("🎯 Hero image logic:", {
          heroImageIndex,
          parsedHeroIndex: heroIndex,
          totalImages: uploadedImages.length
        });
        
        gallery = uploadedImages.map((asset, index) => {
          const isHero = index === heroIndex;
          console.log(`🖼️ Image ${index + 1}: ${isHero ? 'HERO' : 'regular'} - ${asset._id}`);
          
          return {
            _key: `image-${asset._id}`, // Unique key for Sanity studio
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id
            },
            isHero: isHero,
            alt: `Event image ${index + 1}` // Alt text for accessibility
          };
        });
        
        console.log("🖼️ Gallery created with uploaded assets:", gallery);
        console.log("🖼️ ===== IMAGE PROCESSING END =====");
      }
    } else {
      console.log("⚠️ No images provided");
    }

    const doc = {
      title, 
      category, 
      date, 
      description, 
      location, 
      type,
      ...(event_organizer && { event_organizer }),
      ...(gallery && { gallery })
    };

    console.log("📄 Final document to create:", doc);
    console.log("📤 Calling Sanity writeClient.create...");

    const result = await writeClient.create({_type:"events", ...doc});

    console.log("✅ Sanity create result:", result);
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
    // Check if writeClient is properly configured
    if (!writeClient) {
      throw new Error("Sanity writeClient is not configured");
    }

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
      
      // Upload new images to Sanity and get asset references
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        console.log(`📤 Uploading new image ${i + 1}/${newImages.length}: ${file.name}`);
        console.log(`📤 Image object details:`, {
          name: file.name,
          size: file.size,
          type: file.type,
          constructor: file.constructor.name,
          isFile: file instanceof File,
          isBlob: file instanceof Blob,
          keys: Object.keys(file)
        });
        
        try {
          // Convert File to Buffer for Sanity upload
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          console.log(`📤 Uploading buffer for new image ${i + 1}:`, {
            bufferSize: buffer.length,
            originalSize: file.size
          });
          
          const asset = await writeClient.assets.upload('image', buffer, {
            filename: file.name || `new-image-${i + 1}.jpg`,
            contentType: file.type
          });
          console.log(`✅ New image ${i + 1} uploaded successfully:`, asset._id);
          
          // Add to gallery with isHero: false
          gallery.push({
            _key: `new-image-${asset._id}`,
            _type: "image",
            asset: {
              _type: "reference",
              _ref: asset._id
            },
            isHero: false,
            alt: `New event image ${i + 1}`
          });
        } catch (error) {
          console.error(`❌ Failed to upload new image ${i + 1}:`, error);
          console.error(`❌ Upload error details:`, {
            message: error instanceof Error ? error.message : 'Unknown error',
            name: error instanceof Error ? error.name : 'Unknown'
          });
          throw new Error(`Failed to upload image ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      console.log("🖼️ ===== NEW IMAGE PROCESSING END =====");
    }

    // Prepare the update data
    const updateData = {
      type,
      category,
      title,
      description,
      date,
      location,
      event_organizer,
      gallery: gallery.length > 0 ? gallery : undefined
    };

    console.log("🔄 Updating event with data:", updateData);
    
    // Update the event
    await writeClient
      .patch(eventId)
      .set(updateData)
      .commit();

    console.log("✅ Event updated successfully");

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
    await writeClient.delete(eventId);
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
    const { client } = await import("@/sanity/lib/client");
    const { 
      getNewOpportunities, 
      getTemplates, 
      getEnglishLanguageLearning, 
      getRecurringOpportunities 
    } = await import("@/sanity/lib/queries");
    
    let data: any[] = [];
    
    switch (category) {
      case "new-opportunities":
        console.log("Fetching new opportunities...");
        const newOppsData = await sanityFetch({query: getNewOpportunities});
        data = newOppsData.data;
        break;
      case "recurring-opportunities":
        console.log("Fetching recurring opportunities...");
        const recurringData = await sanityFetch({query: getRecurringOpportunities});
        data = recurringData.data;
        break;
      case "templates":
        console.log("Fetching templates...");
        const templatesData = await sanityFetch({query: getTemplates});
        data = templatesData.data;
        break;
      case "english-learning":
        console.log("Fetching English learning...");
        const englishLearningData = await sanityFetch({query: getEnglishLanguageLearning});
        data = englishLearningData.data;
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
      const eventsData = await sanityFetch({
        query: getEventsByType,
        params: { eventType: type }
      });
      data = eventsData.data || [];
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
    const result = await writeClient.create({_type:"workshops", ...doc});
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
    await writeClient
    .patch(workshopId)
    .set(updateData)
    .commit();

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
    await writeClient.delete(workshopId);
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
    const { client } = await import("@/sanity/lib/client");
    const { getWorkshopsByGroup } = await import("@/sanity/lib/queries");
    
    console.log("Fetching workshops for group:", workshopGroup);
    const data = await client.fetch(getWorkshopsByGroup, { workshopGroup });
    
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