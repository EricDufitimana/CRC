import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.ts";

export async function GET(request) {
  try {
    console.log('🔍 API: Fetching all workshops');

    const workshops = await prisma.workshops.findMany({
      include: {
        assignments: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`✅ API: Found ${workshops.length} workshops`);

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
      }))
    }));

    return NextResponse.json({
      success: true,
      data: serializedWorkshops,
      count: serializedWorkshops.length
    });

  } catch (error) {
    console.error('❌ API: Error fetching workshops:', error);
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

export async function POST(request) {
  try {
    console.log('🔧 API: Creating new workshop');
    
    const body = await request.json();
    console.log('📋 Request body:', body);

    const {
      title,
      description,
      presentation_pdf_url,
      workshop_date,
      workshop_group,
    } = body;

    // Validate required fields
    if (!title || !description || !workshop_date || !workshop_group) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: title, description, workshop_date, workshop_group' 
        },
        { status: 400 }
      );
    }

    // Validate workshop_group is a valid enum value
    const validGroups = [
      'ey',
      'senior_4',
      'senior_5_group_a_b',
      'senior_5_customer_care',
      'senior_6_group_a_b',
      'senior_6_group_c',
      'senior_6_group_d'
    ];

    if (!validGroups.includes(workshop_group)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid workshop group. Must be one of: ${validGroups.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Create workshop data
    const workshopData = {
      title: title.trim(),
      description: description.trim(),
      date: new Date(workshop_date),
      presentation_url: presentation_pdf_url?.trim() || null,
      crc_class: workshop_group,
      has_assignment: false,
    };

    console.log('📝 Creating workshop with data:', workshopData);

    // Create the workshop
    const workshop = await prisma.workshops.create({
      data: workshopData,
      include: {
        assignments: true
      }
    });

    // Fetch the created workshop with assignments
    const createdWorkshop = await prisma.workshops.findUnique({
      where: { id: workshop.id },
      include: {
        assignments: true
      }
    });

    // Serialize the response
    const serializedWorkshop = {
      ...createdWorkshop,
      id: createdWorkshop.id.toString(),
      created_at: createdWorkshop.created_at?.toISOString(),
      date: createdWorkshop.date?.toISOString(),
      assignments: createdWorkshop.assignments?.map(assignment => ({
        ...assignment,
        id: assignment.id.toString(),
        workshop_id: assignment.workshop_id?.toString(),
        created_at: assignment.created_at?.toISOString(),
        submission_idate: assignment.submission_idate?.toISOString()
      }))
    };

    console.log('✅ API: Workshop created successfully:', serializedWorkshop);

    return NextResponse.json({
      success: true,
      data: serializedWorkshop,
      message: 'Workshop created successfully'
    });

  } catch (error) {
    console.error('❌ API: Error creating workshop:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create workshop',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    console.log('🔄 API: Updating workshop');
    
    const body = await request.json();
    console.log('📋 Update request body:', body);

    const {
      id,
      title,
      description,
      presentation_url,
      date,
      crc_class,
      has_assignment,
      assignment
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Workshop ID is required' },
        { status: 400 }
      );
    }

    // Update workshop data
    const workshopData = {
      title: title?.trim(),
      description: description?.trim(),
      date: date ? new Date(date) : undefined,
      presentation_url: presentation_url?.trim() || null,
      crc_class: crc_class,
      has_assignment: has_assignment,
    };

    console.log('📝 Updating workshop with data:', workshopData);

    // Update the workshop
    const updatedWorkshop = await prisma.workshops.update({
      where: { id: BigInt(id) },
      data: workshopData,
      include: {
        assignments: true
      }
    });

    // Handle assignment update
    if (assignment) {
      // Delete existing assignments for this workshop
      await prisma.assignments.deleteMany({
        where: { workshop_id: BigInt(id) }
      });

      // Create new assignment if provided
      if (assignment.title && assignment.description) {
        const assignmentData = {
          title: assignment.title.trim(),
          description: assignment.description.trim(),
          submission_idate: assignment.submission_idate ? new Date(assignment.submission_idate) : new Date(),
          submission_style: assignment.submission_style || 'google_link',
          workshop_id: BigInt(id),
        };

        await prisma.assignments.create({
          data: assignmentData
        });
      }
    }

    // Fetch the updated workshop with assignments
    const finalWorkshop = await prisma.workshops.findUnique({
      where: { id: BigInt(id) },
      include: {
        assignments: true
      }
    });

    // Serialize the response
    const serializedWorkshop = {
      ...finalWorkshop,
      id: finalWorkshop.id.toString(),
      created_at: finalWorkshop.created_at?.toISOString(),
      date: finalWorkshop.date?.toISOString(),
      assignments: finalWorkshop.assignments?.map(assignment => ({
        ...assignment,
        id: assignment.id.toString(),
        workshop_id: assignment.workshop_id?.toString(),
        created_at: assignment.created_at?.toISOString(),
        submission_idate: assignment.submission_idate?.toISOString()
      }))
    };

    console.log('✅ API: Workshop updated successfully');

    return NextResponse.json({
      success: true,
      data: serializedWorkshop,
      message: 'Workshop updated successfully'
    });

  } catch (error) {
    console.error('❌ API: Error updating workshop:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update workshop',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    console.log('🗑️ API: Deleting workshop');
    
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Workshop ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting workshop with ID:', id);

    // Delete the workshop (assignments will be deleted due to cascade)
    await prisma.workshops.delete({
      where: { id: BigInt(id) }
    });

    console.log('✅ API: Workshop deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Workshop deleted successfully'
    });

  } catch (error) {
    console.error('❌ API: Error deleting workshop:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete workshop',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
