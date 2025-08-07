"use server"
import { parseServerActionResponse } from "./utils"
import {writeClient} from "@/sanity/lib/writeClient"
import { client } from "@/sanity/lib/client";
import { 
  getNewOpportunities, 
  getTemplates, 
  getEnglishLanguageLearning, 
  getRecurringOpportunities 
} from "@/sanity/lib/queries";

export const addResource = async(state: any, form:FormData) => {
  console.log("🔧 addResource server action called");
  console.log("📋 Form entries:");
  Array.from(form.entries()).forEach(([key, value]) => {
    console.log(`  ${key}:`, value);
  });
  
  const {title, description, url, image_address, opportunity_deadline, category} = Object.fromEntries(form.entries());

  try{
    console.log("📝 Creating document with:", {title, description, url, image_address, opportunity_deadline, category});
    const doc = {title, description, url, image_address, opportunity_deadline, category}

    const result = await writeClient.create({_type:"resource", ...doc});
    console.log("✅ Resource created successfully:", result);

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
  console.log("🔧 addEvent action called");
  console.log("📋 Form entries:");
  Array.from(form.entries()).forEach(([key, value]) => {
    console.log(`  ${key}:`, value);
  });
  
  try {
    // Check if writeClient is properly configured
    if (!writeClient) {
      throw new Error("Sanity writeClient is not configured");
    }

    // Extract form fields (excluding images)
    const formEntries = Array.from(form.entries()).filter(([key]) => key !== 'images');
    const formData = Object.fromEntries(formEntries);
    const {title, category, date, description, location, event_organizer_name, event_organizer_role, event_organizer_image, type} = formData;
    
    console.log("📝 Extracted values:", { title, category, date, description, location, type });
    
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

    const doc = {
      title, 
      category, 
      date, 
      description, 
      location, 
      type,
      ...(event_organizer && { event_organizer })
    };

    console.log("📄 Document to create:", doc);
    console.log("📤 Calling Sanity writeClient.create...");

    const result = await writeClient.create({_type:"events", ...doc});

    console.log("✅ Sanity create result:", result);

    return parseServerActionResponse({
      ...result,
      error: '',
      status: 'SUCCESS',
    });
  } catch (error) {
    console.error("💥 Error in addEvent:", error);
    return parseServerActionResponse({
      error: error instanceof Error ? error.message : 'Failed to add event. Please try again.',
      status: 'ERROR',
    });
  }
}

export const updateEvent = async(eventId: string, updateData: any) => { 
  try{
    await writeClient
    .patch(eventId)
    .set(updateData)
    .commit();

    return parseServerActionResponse({
      error: '',
      status: 'SUCCESS',
    });
  } catch (error){
    console.log(error)
    return parseServerActionResponse({
      error: 'Failed to update event. Please try again.',
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
        data = await client.fetch(getNewOpportunities);
        break;
      case "recurring-opportunities":
        console.log("Fetching recurring opportunities...");
        data = await client.fetch(getRecurringOpportunities);
        break;
      case "templates":
        console.log("Fetching templates...");
        data = await client.fetch(getTemplates);
        break;
      case "english-learning":
        console.log("Fetching English learning...");
        data = await client.fetch(getEnglishLanguageLearning);
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