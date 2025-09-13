import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.ts";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');
    
    if (!group) {
      return NextResponse.json({
        success: false,
        error: 'Group parameter is required'
      }, { status: 400 });
    }

    console.log('🔍 API: Fetching workshops for group:', group);

    // Helper function to get CRC class IDs for a given group
    const getCrcClassIdsForGroup = async (group) => {
      const groupMappings = {
        'ey': ['EY A', 'EY B', 'EY C', 'EY D'],
        'senior_4': ['S4MPC + S4MEG', 'S4MCE', 'S4HGL + S4PCB'],
        's4': ['S4MPC + S4MEG', 'S4MCE', 'S4HGL + S4PCB'], // alias
        'senior_5_group_a_b': ['S5 Group A+B'],
        's5': ['S5 Group A+B'], // alias
        'senior_5_customer_care': ['S5 Customer Care'],
        'senior_6_group_a_b': ['S6 Group A+B'],
        's6': ['S6 Group A+B', 'S6 Group C', 'S6 Group D'], // alias for all S6
        'senior_6_group_c': ['S6 Group C'],
        'senior_6_group_d': ['S6 Group D']
      };

      const classNames = groupMappings[group];
      if (!classNames) return [];

      const crcClasses = await prisma.crc_class.findMany({
        where: {
          name: {
            in: classNames
          }
        }
      });

      return crcClasses.map(c => c.id);
    };

    const crcClassIds = await getCrcClassIdsForGroup(group);
    
    if (crcClassIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: `No CRC classes found for group: ${group}`
      });
    }

    const workshops = await prisma.workshops.findMany({
      where: {
        workshop_to_crc: {
          some: {
            crc_class_id: {
              in: crcClassIds
            }
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
        date: 'desc'
      }
    });

    console.log(`✅ API: Found ${workshops.length} workshops for group ${group}`);

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
    console.error('❌ API: Error fetching workshops by group:', error);
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
