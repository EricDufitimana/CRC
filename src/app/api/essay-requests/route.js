import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const adminId = searchParams.get('admin_id');
  
  try {
    console.log('🔍 Attempting to fetch essay requests from database...');
    console.log('🔍 Admin ID received:', adminId);
    
    // Build the where clause conditionally
    const whereClause = {};
    if (adminId && adminId !== 'null' && adminId !== 'undefined') {
      // Convert adminId to BigInt for proper comparison with database BigInt field
      whereClause.admin_id = BigInt(adminId);
    }
    
    const essayRequests = await prisma.essay_requests.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        deadline: true,
        essay_link: true,
        word_count: true,
        student_id: true,
        admin_id: true,
        submitted_at: true,
        completed_at: true,
        status: true,
        referred: true,
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
            last_name: true,
            grade: true
          }
        }
      },
      orderBy: {
        id: 'desc' // Use id instead of submitted_at to avoid column issues
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

      console.log('Raw request from database:', {
        id: request.id,
        status: request.status,
        completed_at: request.completed_at,
        completed_at_type: typeof request.completed_at
      });
      
      const serializedRequest = {
        id: request.id.toString(),
        title: request.title,
        description: request.description,
        deadline: request.deadline,
        essay_link: request.essay_link,
        word_count: request.word_count?.toString(),
        student_id: request.student_id.toString(),
        admin_id: request.admin_id.toString(),
        submitted_at: request.submitted_at,
        created_at: request.submitted_at ? new Date(request.submitted_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], // Handle case where submitted_at might not exist
        completed_at: request.completed_at,
        admin_name: adminName || 'Unknown',
        student_name: studentName || 'Unknown',
        status: request.status,
        grade: request.students?.grade ? request.students.grade.replace(/_/g, ' ') : null,
        referred: request.referred || false
      };
      
      console.log('Serialized request:', serializedRequest);
      return serializedRequest;
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