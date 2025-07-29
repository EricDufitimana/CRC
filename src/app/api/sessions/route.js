import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Fetching sessions (essay requests) from database...');
    
    // Using the same structure as your existing essay-requests route
    const sessions = await prisma.essay_requests.findMany({
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
      },
      orderBy: {
        submitted_at: 'desc'
      }
    });

    // Convert BigInt to string and format the data (same as your existing code)
    const serializedSessions = sessions.map(session => {
      const adminName = [session.admin?.honorific, session.admin?.first_name, session.admin?.last_name]
        .filter(Boolean)
        .join(' ');
      
      const studentName = [session.students?.first_name, session.students?.last_name]
        .filter(Boolean)
        .join(' ');

      return {
        id: session.id.toString(),
        student_id: session.student_id.toString(),
        admin_id: session.admin_id.toString(),
        title: session.title,
        essay_link: session.essay_link,
        word_count: session.word_count?.toString(),
        description: session.description,
        deadline: session.deadline,
        submitted_at: session.submitted_at,
        // Adding status and defer fields for sessions functionality
        status: 'pending', // Default status since it's not in your current schema
        defer: false, // Default defer value
        admin_name: adminName || 'Unknown',
        student_name: studentName || 'Unknown',
        student_email: 'student@example.com' // You can add this to your schema later
      };
    });

    console.log('✅ Successfully fetched sessions:', serializedSessions.length);
    return NextResponse.json(serializedSessions);
  } catch (error) {
    console.error('❌ Error fetching sessions:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    console.error('❌ Error details:', {
      name: errorName,
      message: errorMessage
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch sessions',
        details: errorMessage,
        type: errorName
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, action, adminId, notes } = body;
    
    console.log('🔍 Processing session action:', { sessionId, action, adminId });
    
    // For now, we'll just log the action since we don't have status/defer fields yet
    // You can add these fields to your schema later when you're ready
    console.log('📝 Action requested:', {
      sessionId,
      action,
      adminId,
      notes
    });
    
    // Return a success response for now
    // Later, you can add actual database updates when you add the status/defer fields
    return NextResponse.json({
      message: 'Action logged successfully',
      sessionId,
      action,
      adminId,
      notes
    });
    
  } catch (error) {
    console.error('❌ Error processing session action:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process session action',
        details: error.message
      },
      { status: 500 }
    );
  }
} 