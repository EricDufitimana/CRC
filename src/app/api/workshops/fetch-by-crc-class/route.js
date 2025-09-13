import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.ts";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const crcClassId = searchParams.get('crcClassId');
    
    if (!crcClassId) {
      return NextResponse.json({
        success: false,
        error: 'CRC class ID is required'
      }, { status: 400 });
    }

    console.log('🔍 API: Fetching workshops for CRC class:', crcClassId);

    const workshops = await prisma.workshops.findMany({
      where: {
        workshop_to_crc: {
          some: {
            crc_class_id: BigInt(crcClassId)
          }
        }
      },
      include: {
        assignments: true,
        workshop_to_crc: {
          include: {
            crc_class: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`✅ API: Found ${workshops.length} workshops for CRC class ${crcClassId}`);

    // Serialize the data to handle Date objects and BigInt fields
    const serializedWorkshops = workshops.map(workshop => ({
      ...workshop,
      id: workshop.id.toString(),
      created_at: workshop.created_at?.toISOString(),
      date: workshop.date?.toISOString(),
      assignments: workshop.assignments?.map(assignment => ({
        ...assignment,
        id: assignment.id.toString(),
        workshop_id: assignment.workshop_id?.toString(),
        created_at: assignment.created_at?.toISOString(),
        submission_idate: assignment.submission_idate?.toISOString()
      })),
      crc_classes: workshop.workshop_to_crc?.map(wtc => ({
        id: wtc.crc_class.id.toString(),
        name: wtc.crc_class.name
      })) || [],
      // Remove BigInt fields that can't be serialized
      workshop_to_crc: undefined
    }));

    return NextResponse.json({
      success: true,
      data: serializedWorkshops,
      count: serializedWorkshops.length
    });

  } catch (error) {
    console.error('❌ API: Error fetching workshops by CRC class:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch workshops',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
