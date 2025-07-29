import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('🔍 Starting opportunity requests API...');
    
    // Test 1: Check if prisma is imported
    if (!prisma) {
      console.error('❌ Prisma is undefined');
      return NextResponse.json({ error: 'Prisma client is undefined' }, { status: 500 });
    }
    
    console.log('✅ Prisma client is imported successfully');
    
    // Test 2: Check if we can access the database
    try {
      console.log('🔍 Testing database connection...');
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database connection successful:', result);
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed', details: dbError.message }, { status: 500 });
    }
    
    // Test 3: Check if opportunities table exists
    try {
      console.log('🔍 Testing opportunities table...');
      const count = await prisma.opportunities.count();
      console.log('✅ Opportunities table exists, count:', count);
    } catch (tableError) {
      console.error('❌ Opportunities table error:', tableError);
      return NextResponse.json({ error: 'Opportunities table not found', details: tableError.message }, { status: 500 });
    }
    
    // If we get here, everything is working - fetch the actual data
    console.log('🔍 Fetching opportunity requests...');
    const opportunityRequests = await prisma.opportunities.findMany({
      orderBy: {
        submitted_at: 'desc'
      }
    });

    const serializedRequests = opportunityRequests.map(request => {
      return {
        id: request.id.toString(),
        title: request.title,
        description: request.description,
        deadline: request.deadline,
        link: request.link,
        created_at: request.submitted_at.toISOString(), // Map submitted_at to created_at for frontend compatibility
        status: request.status,
        defer: request.defer,
        admin_id: request.admin_id.toString(),
        student_id: request.student_id.toString(),
        admin_name: 'Admin Name', // We'll need to fetch this separately if needed
        student_name: 'Student Name', // We'll need to fetch this separately if needed
      }
    });

    console.log('🔍 Successfully fetched opportunity requests:', serializedRequests.length);
    return NextResponse.json(serializedRequests);
    
  } catch(error) {
    console.error('❌ Unexpected error:', error);
    console.error('❌ Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Unexpected error',
        details: error.message,
        type: error.name
      },
      { status: 500 }
    );
  }
}