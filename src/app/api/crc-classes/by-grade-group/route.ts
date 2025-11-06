import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../utils/prismaDB";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeGroup = searchParams.get('gradeGroup');
    
    if (!gradeGroup) {
      return NextResponse.json({
        success: false,
        error: 'gradeGroup parameter is required'
      }, { status: 400 });
    }

    // Map grade group strings to enum values
    const gradeGroupMap: Record<string, string> = {
      's5': 'Senior_5',
      's6': 'Senior_6',
      'Senior_5': 'Senior_5',
      'Senior_6': 'Senior_6',
    };

    const enumValue = gradeGroupMap[gradeGroup];
    if (!enumValue) {
      return NextResponse.json({
        success: false,
        error: `Invalid gradeGroup: ${gradeGroup}. Must be 's5' or 's6'`
      }, { status: 400 });
    }

    console.log('🔍 API: Fetching CRC classes for grade group:', enumValue);

    const crcClasses = await prisma.crc_class.findMany({
      where: {
        grade_group: enumValue as any
      },
      orderBy: {
        name: 'asc'
      }
    });

    const serialized = crcClasses.map(c => ({
      id: c.id.toString(),
      name: c.name,
      grade_group: c.grade_group
    }));

    return NextResponse.json({
      success: true,
      data: serialized,
      count: serialized.length
    });

  } catch (error) {
    console.error('Error fetching CRC classes by grade group:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch CRC classes'
    }, { status: 500 });
  }
}

