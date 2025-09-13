import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request) {
  console.log('🔍 API CALLED - essay-referrals route');
  const { searchParams } = new URL(request.url);
  const adminId = searchParams.get('admin_id');
  const type = searchParams.get('type'); // 'sent' or 'received'
  
  try {
    console.log('🔍 Attempting to fetch essay referrals from database...');
    console.log('🔍 Admin ID received:', adminId, 'Type:', typeof adminId);
    console.log('🔍 Type received:', type);
    
    if (!adminId || adminId === 'null' || adminId === 'undefined') {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    // Build the where clause based on type
    // Convert adminId to BigInt for proper comparison with database BigInt fields
    const adminIdBigInt = BigInt(adminId);
    let whereClause = {};
    if (type === 'received') {
      whereClause.to_admin_id = adminIdBigInt;
    } else if (type === 'sent') {
      whereClause.from_admin_id = adminIdBigInt;
    } else if (type === 'all') {
      // Fetch both sent and received referrals
      whereClause = {
        OR: [
          { to_admin_id: adminIdBigInt },
          { from_admin_id: adminIdBigInt }
        ]
      };
    } else {
      return NextResponse.json({ error: 'Type must be "sent", "received", or "all"' }, { status: 400 });
    }
    
    const referrals = await prisma.essay_referrals.findMany({
      where: whereClause,
      include: {
        essay_requests: {
          include: {
            students: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        },
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
    });

    // Convert BigInt to string and format the data
    const serializedReferrals = referrals.map(referral => {
      const fromAdminName = [referral.from_admin?.honorific, referral.from_admin?.first_name, referral.from_admin?.last_name]
        .filter(Boolean)
        .join(' ');
      
      const toAdminName = [referral.to_admin?.honorific, referral.to_admin?.first_name, referral.to_admin?.last_name]
        .filter(Boolean)
        .join(' ');
      
      const studentName = [referral.essay_requests?.students?.first_name, referral.essay_requests?.students?.last_name]
        .filter(Boolean)
        .join(' ');

      // Determine if this referral was sent or received by the current admin
      // Convert adminId to BigInt for proper comparison with database BigInt fields
      const adminIdBigInt = BigInt(adminId);
      const isSent = referral.from_admin_id === adminIdBigInt;
      const isReceived = referral.to_admin_id === adminIdBigInt;
      
      return {
        id: referral.id.toString(),
        essayId: referral.essay_requested_id.toString(),
        essayTitle: referral.essay_requests?.title || 'Unknown Essay',
        essayLink: referral.essay_requests?.essay_link || null,
        studentName: studentName || 'Unknown Student',
        referredTo: toAdminName || 'Unknown',
        referredBy: fromAdminName || 'Unknown',
        referredAt: referral.referred_at,
        status: referral.has_completed ? 'completed' : 'pending',
        type: isSent ? 'sent' : 'received',
        has_completed: referral.has_completed,
        completed_at: referral.completed_at,
        // Add essay details
        deadline: referral.essay_requests?.deadline || null,
        submittedAt: referral.essay_requests?.submitted_at || null,
        wordCount: referral.essay_requests?.word_count?.toString() || '0'
      };
    });

    console.log('🔍 Successfully fetched essay referrals:', serializedReferrals.length);
    console.log('🔍 First referral has_completed value:', serializedReferrals[0]?.has_completed);
    console.log('🔍 First referral completed_at value:', serializedReferrals[0]?.completed_at);
    console.log('🔍 Raw referral data from DB:', referrals[0]);
    console.log('🔍 Raw referral has_completed from DB:', referrals[0]?.has_completed);
    console.log('🔍 Raw referral has_completed type:', typeof referrals[0]?.has_completed);
    console.log('🔍 Raw referral completed_at from DB:', referrals[0]?.completed_at);
    console.log('🔍 Raw referral completed_at type:', typeof referrals[0]?.completed_at);
    return NextResponse.json(serializedReferrals);
  } catch (error) {
    console.error('❌ Error fetching essay referrals:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    console.error('❌ Error details:', {
      name: errorName,
      message: errorMessage
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch essay referrals',
        details: errorMessage,
        type: errorName
      },
      { status: 500 }
    );
  }
} 