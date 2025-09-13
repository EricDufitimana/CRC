import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request) {
  try {
    console.log('🔍 DEBUG - Workshops API called');
    
    // Check if Prisma client is available
    if (!prisma) {
      console.error('🔍 DEBUG - Prisma client is not available');
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }
    
    console.log('🔍 DEBUG - Prisma client is available');
    
    // Test database connection
    try {
      const testQuery = await prisma.workshops.count();
      console.log('🔍 DEBUG - Database connection test successful, workshops count:', testQuery);
      
      // Test junction table
      const junctionCount = await prisma.workshop_to_crc_class.count();
      console.log('🔍 DEBUG - Junction table count:', junctionCount);
      
      // Test CRC classes table
      const crcClassesCount = await prisma.crc_class.count();
      console.log('🔍 DEBUG - CRC classes count:', crcClassesCount);
      
    } catch (dbTestError) {
      console.error('🔍 DEBUG - Database connection test failed:', dbTestError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbTestError.message },
        { status: 500 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const crcClassId = searchParams.get('crcClassId');
    const crcClassName = searchParams.get('crcClassName');
    const useCase = searchParams.get('useCase'); // 'attendance' or 'assignment'
    
    console.log('🔍 DEBUG - Query parameters:', { crcClassId, crcClassName, useCase });

    let whereClause = {};

    // If specific CRC class is requested, filter by it and show workshops based on use case
    if (crcClassId) {
      console.log('🔍 DEBUG - Filtering by CRC Class ID:', crcClassId);
      whereClause = {
        workshop_to_crc: {
          some: {
            crc_class_id: BigInt(crcClassId)
          }
        }
      };
      
      // For assignment management, only show workshops with assignments
      // For attendance, show all workshops regardless of assignment status, but exclude those with existing attendance
      if (useCase === 'assignment') {
        console.log('🔍 DEBUG - Assignment use case: filtering for workshops with assignments');
        whereClause.has_assignment = true;
      } else {
        console.log('🔍 DEBUG - Attendance use case: showing all workshops except those with existing attendance');
        // Exclude workshops that already have attendance sessions for this class
        whereClause.NOT = {
          attendance_sessions: {
            some: {
              crc_class_id: BigInt(crcClassId)
            }
          }
        };
      }
    } else if (crcClassName) {
      console.log('🔍 DEBUG - Filtering by CRC Class Name pattern:', crcClassName);
      // Filter by class name pattern (for EY/S4 grouping)
      whereClause = {
        workshop_to_crc: {
          some: {
            crc_class: {
              name: {
                contains: crcClassName,
                mode: 'insensitive'
              }
            }
          }
        }
      };
    } else {
      console.log('🔍 DEBUG - No filters applied, fetching all workshops');
    }
    
    console.log('🔍 DEBUG - Final whereClause:', JSON.stringify(whereClause, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value, 2));

    console.log('🔍 DEBUG - About to execute Prisma query');
    
    const workshops = await prisma.workshops.findMany({
      where: whereClause,
      include: {
        workshop_to_crc: {
          include: {
            crc_class: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        assignments: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log('🔍 DEBUG - Prisma query executed successfully');
    console.log('🔍 DEBUG - Raw workshops count:', workshops.length);
    console.log('🔍 DEBUG - First workshop sample:', workshops.length > 0 ? {
      id: workshops[0].id.toString(),
      title: workshops[0].title,
      workshop_to_crc_count: workshops[0].workshop_to_crc?.length || 0,
      assignments_count: workshops[0].assignments?.length || 0
    } : 'No workshops found');

    console.log('🔍 DEBUG - Starting serialization');
    
    // Serialize BigInts and format the response
    const serializedWorkshops = workshops.map(workshop => {
      try {
        const serialized = {
          id: workshop.id.toString(),
          title: workshop.title,
          description: workshop.description,
          has_assignment: workshop.has_assignment,
          date: workshop.date ? workshop.date.toISOString() : null,
          presentation_url: workshop.presentation_url,
          created_at: workshop.created_at ? workshop.created_at.toISOString() : null,
          crc_classes: workshop.workshop_to_crc.map(wtc => ({
            id: wtc.crc_class.id.toString(),
            name: wtc.crc_class.name
          })),
          assignments: workshop.assignments.map(assignment => ({
            id: assignment.id.toString(),
            title: assignment.title
          }))
        };
        return serialized;
      } catch (serializeError) {
        console.error('🔍 DEBUG - Error serializing workshop:', workshop.id, serializeError);
        throw serializeError;
      }
    });
    
    console.log('🔍 DEBUG - Serialization completed');
    console.log('🔍 DEBUG - Serialized workshops count:', serializedWorkshops.length);
    console.log('🔍 DEBUG - Response structure:', {
      workshops_count: serializedWorkshops.length,
      first_workshop: serializedWorkshops.length > 0 ? {
        id: serializedWorkshops[0].id,
        title: serializedWorkshops[0].title,
        crc_classes_count: serializedWorkshops[0].crc_classes?.length || 0,
        assignments_count: serializedWorkshops[0].assignments?.length || 0
      } : 'No workshops'
    });

    return NextResponse.json({
      workshops: serializedWorkshops
    });

  } catch (error) {
    console.error('🔍 DEBUG - Error in workshops API:', error);
    console.error('🔍 DEBUG - Error stack:', error.stack);
    console.error('🔍 DEBUG - Error message:', error.message);
    console.error('🔍 DEBUG - Error name:', error.name);
    
    // Check if it's a Prisma error
    if (error.code) {
      console.error('🔍 DEBUG - Prisma error code:', error.code);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch workshops',
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}
