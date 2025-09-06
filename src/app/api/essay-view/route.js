import { NextResponse } from "next/server";
import {prisma} from "../../../lib/prisma"
import { sendEssayBeingReviewedEmailServer } from "../../../actions/essays/sendEssayEmail";

export async function GET(request){
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  try{
    // First, get the current essay data to check if it's pending
    const currentEssay = await prisma.essay_requests.findUnique({
      where: {id: BigInt(id)},
      include: {
        admin: {
          select: {
            first_name: true,
            last_name: true,
            honorific: true,
            email: true
          }
        },
        students: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });

    if (!currentEssay) {
      return NextResponse.json({message: "Essay not found"}, {status: 404});
    }

    // Check if status is changing from pending to in_review
    const wasPending = currentEssay.status === 'pending';

    // Update the status
    const updateStatus = await prisma.essay_requests.update({
      where: {id: BigInt(id)},
      data: {
        status: "in_review"
      },
    });

    // Send email notification if status changed from pending to in_review
    if (wasPending) {
      console.log('📧 Sending essay review notification...');
      
      try {
        // Prepare admin name and student email
        const adminName = [currentEssay.admin?.honorific, currentEssay.admin?.first_name, currentEssay.admin?.last_name]
          .filter(Boolean)
          .join(' ');
        
        const studentEmail = currentEssay.students?.email;
        
        if (studentEmail && adminName) {
          const emailResult = await sendEssayBeingReviewedEmailServer(
            studentEmail,
            currentEssay.title,
            adminName
          );

          if (emailResult.success) {
            console.log('✅ Essay review notification sent successfully');
          } else {
            console.error('❌ Failed to send essay review notification:', emailResult);
          }
        } else {
          console.log('⚠️ Missing required data for notification:');
          console.log('   - Student email exists:', !!studentEmail);
          console.log('   - Admin name exists:', !!adminName);
        }
      } catch (emailError) {
        console.error('❌ Error sending essay review notification:', emailError);
      }
    }

    return NextResponse.json({message: "Essay view updated successfully", id: id}, {status: 200});
  }catch(error){
    console.error("Error updating essay status:", error);
    return NextResponse.json({message: "Error updating essay status", error: error.message}, {status: 500});
  }
}