import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    console.log('🔍 Starting opportunity requests API...');
    
    // Get admin_id from query parameters
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('admin_id');
    
    console.log('🔍 Admin ID from query params:', adminId);
    
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
    
    // Check if any opportunities have AI categories
    const aiCategoryCheck = await prisma.opportunities.findMany({
      select: {
        id: true,
        ai_category: true
      },
      where: {
        ai_category: {
          not: null
        }
      }
    });
    console.log('🔍 Opportunities with AI categories:', aiCategoryCheck);
    
    // Build where clause based on admin_id
    const whereClause = adminId ? { admin_id: parseInt(adminId) } : {};
    
    const opportunityRequests = await prisma.opportunities.findMany({
      where: whereClause,
      include: {
        students: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            grade: true
          }
        },
        admin: {
          select: {
            first_name: true,
            last_name: true,
            honorific: true
          }
        },
        opportunity_referrals: {
          include: {
            from_admin: {
              select: {
                first_name: true,
                last_name: true,
                honorific: true
              }
            },
            to_admin: {
              select: {
                first_name: true,
                last_name: true,
                honorific: true
              }
            }
          },
          orderBy: {
            referred_at: 'desc'
          }
        }
      },
      orderBy: {
        id: 'desc' // Use id instead of submitted_at to avoid column issues
      }
    });

    const serializedRequests = opportunityRequests.map(request => {
      // Get the most recent referral if any
      const latestReferral = request.opportunity_referrals && request.opportunity_referrals.length > 0 
        ? request.opportunity_referrals[0] 
        : null;

      const fromAdminName = latestReferral?.from_admin 
        ? `${latestReferral.from_admin.honorific || ''} ${latestReferral.from_admin.first_name} ${latestReferral.from_admin.last_name}`.trim()
        : null;
      
      const toAdminName = latestReferral?.to_admin 
        ? `${latestReferral.to_admin.honorific || ''} ${latestReferral.to_admin.first_name} ${latestReferral.to_admin.last_name}`.trim()
        : null;

      return {
        id: request.id.toString(),
        title: request.title,
        description: request.description,
        deadline: request.deadline,
        link: request.link,
        created_at: request.submitted_at ? request.submitted_at.toISOString() : new Date().toISOString(), // Handle case where submitted_at might not exist
        status: request.status,
        referred: request.referred,
        admin_id: request.admin_id.toString(),
        student_id: request.student_id.toString(),
        admin_name: request.admin ? `${request.admin.honorific || ''} ${request.admin.first_name} ${request.admin.last_name}`.trim() : 'Unknown Admin',
        student_name: request.students ? `${request.students.first_name} ${request.students.last_name}` : 'Unknown Student',
        student_email: request.students?.email || 'No email',
        student_grade: request.students?.grade ? request.students.grade.replace(/_/g, ' ') : null,
        admin_email: 'Admin email not available', // Add if needed in the future
        ai_category: request.ai_category || null,
        reason: request.reason || null,
        // Referral information
        referral_info: latestReferral ? {
          referred_by: fromAdminName,
          referred_to: toAdminName,
          referred_at: latestReferral.referred_at ? latestReferral.referred_at.toISOString() : null,
          status: latestReferral.status || 'pending'
        } : null
      }
    });

    console.log('🔍 Successfully fetched opportunity requests:', serializedRequests.length);
    console.log('🔍 Sample opportunity with AI category:', serializedRequests[0]);
    console.log('🔍 Sample opportunity grade:', serializedRequests[0]?.student_grade);
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