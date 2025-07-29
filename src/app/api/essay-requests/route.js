import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Attempting to fetch essay requests from database...');
    
    const essayRequests = await prisma.essay_requests.findMany({
      include: {
        admin: {
          select: {
            first_name: true,
            last_name: true,
            honorific: true
          }
        },
        students: {
          select: {
            first_name: true,
            last_name: true
          }
        }
      }
    });

    // Convert BigInt to string and format the data
    const serializedRequests = essayRequests.map(request => {
      const adminName = [request.admin?.honorific, request.admin?.first_name, request.admin?.last_name]
        .filter(Boolean)
        .join(' ');
      
      const studentName = [request.students?.first_name, request.students?.last_name]
        .filter(Boolean)
        .join(' ');

      return {
        id: request.id.toString(),
        title: request.title,
        description: request.description,
        deadline: request.deadline,
        essay_link: request.essay_link,
        word_count: request.word_count?.toString(),
        student_id: request.student_id.toString(),
        admin_id: request.admin_id.toString(),
        submitted_at: request.submitted_at,
        created_at: request.created_at,
        admin_name: adminName || 'Unknown',
        student_name: studentName || 'Unknown'
      };
    });

    console.log('🔍 Successfully fetched essay requests:', serializedRequests.length);
    return NextResponse.json(serializedRequests);
  } catch (error) {
    console.error('❌ Error fetching essay requests:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    console.error('❌ Error details:', {
      name: errorName,
      message: errorMessage
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch essay requests',
        details: errorMessage,
        type: errorName
      },
      { status: 500 }
    );
  }
}