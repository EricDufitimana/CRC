import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const adminId = searchParams.get('admin_id');
  const type = searchParams.get('type') || 'all';
  
  try {
    console.log('🔍 Fetching opportunity referrals...');
    console.log('🔍 Admin ID:', adminId);
    console.log('🔍 Type:', type);
    
    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    // Build the where clause based on type
    let whereClause = {};
    
    if (type === 'sent') {
      whereClause.from_admin_id = BigInt(adminId);
    } else if (type === 'received') {
      whereClause.to_admin_id = BigInt(adminId);
    } else if (type === 'all') {
      whereClause.OR = [
        { from_admin_id: BigInt(adminId) },
        { to_admin_id: BigInt(adminId) }
      ];
    }

    const referrals = await prisma.opportunity_referrals.findMany({
      where: whereClause,
      include: {
        opportunities: {
          include: {
            students: {
              select: {
                first_name: true,
                last_name: true,
                email: true
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

    // Transform the data to match the expected format
    const transformedReferrals = referrals.map(referral => {
      const fromAdminName = referral.from_admin 
        ? `${referral.from_admin.honorific || ''} ${referral.from_admin.first_name} ${referral.from_admin.last_name}`.trim()
        : 'Unknown Admin';
      
      const toAdminName = referral.to_admin 
        ? `${referral.to_admin.honorific || ''} ${referral.to_admin.first_name} ${referral.to_admin.last_name}`.trim()
        : 'Unknown Admin';

      // Determine if this is a sent or received referral for the current admin
      const isSent = referral.from_admin_id.toString() === adminId;
      const isReceived = referral.to_admin_id.toString() === adminId;

      return {
        id: referral.id.toString(),
        opportunityId: referral.opportunity_id.toString(),
        opportunityTitle: referral.opportunities?.title || 'Unknown Opportunity',
        opportunityLink: referral.opportunities?.link || null,
        studentName: referral.opportunities?.students 
          ? `${referral.opportunities.students.first_name} ${referral.opportunities.students.last_name}`.trim()
          : 'Unknown Student',
        studentEmail: referral.opportunities?.students?.email || null,
        referredTo: toAdminName,
        referredBy: fromAdminName,
        referredAt: referral.referred_at,
        status: referral.status || 'pending',
        type: isSent ? 'sent' : 'received',
        deadline: referral.opportunities?.deadline || null,
        submittedAt: referral.opportunities?.submitted_at || null,
        has_completed: referral.has_completed || false,
        completed_at: referral.completed_at,
        opportunityReason: referral.opportunities?.reason || null,
        opportunityStatus: referral.opportunities?.status || null
      };
    });

    console.log('🔍 Successfully fetched opportunity referrals:', transformedReferrals.length);
    return NextResponse.json(transformedReferrals);
    
  } catch (error) {
    console.error('❌ Error fetching opportunity referrals:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch opportunity referrals',
        details: error.message,
        type: error.name
      },
      { status: 500 }
    );
  }
} 