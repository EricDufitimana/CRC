"use server"
import { parseServerActionResponse } from "./utils"
import {writeClient} from "@/sanity/lib/writeClient"

export const addResource = async(state: any, form:FormData) => {
  const {title, description, url, image_address, opportunity_deadline, category} = Object.fromEntries(form.entries());

  try{
    const doc = {title, description, url, image_address, opportunity_deadline, category}

    const result = await writeClient.create({_type:"resource", ...doc});

    return parseServerActionResponse({
      ...result,
      error: '',
      status: 'SUCCESS',
    });
  } catch (error){
    console.log(error)
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