import { NextResponse } from "next/server";
import {prisma} from "../../../lib/prisma"
export async function GET(request){
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  try{
    const updateStatus = await prisma.essay_requests.update({
      where: {id:id},
      data: {
        status: "in_review"
      },
    });
    return NextResponse.json({message: "Essay view updated successfully", id: id}, {status: 200});
  }catch(error){
    console.error("Error updating essay status:", error);
    return NextResponse.json({message: "Error updating essay status", error: error.message}, {status: 500});
  }
}