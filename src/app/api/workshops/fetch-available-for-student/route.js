import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.ts";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const crcClassId = searchParams.get('crcClassId');
    
    if (!studentId) {
      return NextResponse.json({
        success: false,
        error: 'Student ID is required'
      }, { status: 400 });
    }

    console.log('🔍 API: Fetching available workshops for student:', studentId, 'CRC class param:', crcClassId);

    // Get student's CRC class ID from the database
    const student = await prisma.students.findUnique({
      where: { id: BigInt(studentId) },
      select: { 
        crc_class: {
          select: { id: true, name: true }
        }
      }
    });

    // Use provided crcClassId or fetch from student record
    let finalCrcClassId = crcClassId;
    if (!finalCrcClassId && student?.crc_class) {
      finalCrcClassId = student.crc_class.id.toString();
      console.log('🔍 API: Fetched CRC class ID from student record:', finalCrcClassId, 'Class name:', student.crc_class.name);
    } else if (finalCrcClassId) {
      console.log('🔍 API: Using provided CRC class ID:', finalCrcClassId);
    } else {
      console.log('⚠️ API: Student has no CRC class assigned - returning empty workshops list');
      // If student has no CRC class, return empty array - they shouldn't see any workshops
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'Student has no CRC class assigned'
      });
    }

    // First, get all assignments that the student has already submitted
    const submittedAssignments = await prisma.submissions.findMany({
      where: {
        student_id: BigInt(studentId)
      },
      select: {
        assignment_id: true
      }
    });

    const submittedAssignmentIds = submittedAssignments.map(sub => sub.assignment_id);

    console.log('📝 Student has submitted assignments:', submittedAssignmentIds);

    // Build the workshop query with proper filter combination
    // IMPORTANT: Always filter by CRC class ID - only show workshops assigned to the student's CRC class
    let workshopQuery = {
      where: {
        AND: [
          {
            assignments: {
              some: {
                // Only include assignments that haven't been submitted by this student
                id: {
                  notIn: submittedAssignmentIds.length > 0 ? submittedAssignmentIds : []
                }
              }
            }
          },
          {
            // REQUIRED: Only show workshops assigned to the student's CRC class
            workshop_to_crc: {
              some: {
                crc_class_id: BigInt(finalCrcClassId)
              }
            }
          }
        ]
      },
      include: {
        assignments: {
          where: {
            // Only include assignments that haven't been submitted by this student
            id: {
              notIn: submittedAssignmentIds.length > 0 ? submittedAssignmentIds : []
            }
          }
        },
        workshop_to_crc: {
          include: {
            crc_class: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    };

    console.log('✅ API: Filtering workshops by CRC class ID:', finalCrcClassId);

    const workshops = await prisma.workshops.findMany(workshopQuery);

    console.log(`✅ API: Found ${workshops.length} available workshops for student ${studentId}`);

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
    console.error('❌ API: Error fetching available workshops for student:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch available workshops',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
