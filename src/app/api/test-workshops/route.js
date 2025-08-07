import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('🧪 TEST: Testing workshops API...');
    
    // Test 1: Fetch all workshops
    console.log('🧪 TEST: Fetching all workshops...');
    const allWorkshops = await prisma.workshops.findMany({
      include: {
        assignments: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log('🧪 TEST: All workshops result:', allWorkshops.length);
    
    // Test 2: Fetch workshops by class
    console.log('🧪 TEST: Fetching workshops by class (senior_4)...');
    const senior4Workshops = await prisma.workshops.findMany({
      where: {
        crc_class: 'senior_4'
      },
      include: {
        assignments: true
      }
    });
    
    console.log('🧪 TEST: Senior 4 workshops result:', senior4Workshops.length);
    
    // Test 3: Fetch single workshop
    console.log('🧪 TEST: Fetching single workshop...');
    const singleWorkshop = await prisma.workshops.findFirst({
      include: {
        assignments: true
      }
    });
    
    console.log('🧪 TEST: Single workshop result:', singleWorkshop ? 'Found' : 'Not found');
    
    return NextResponse.json({
      success: true,
      tests: {
        allWorkshops: {
          count: allWorkshops.length,
          data: allWorkshops.map(w => ({
            id: w.id.toString(),
            title: w.title,
            crc_class: w.crc_class,
            has_assignment: w.has_assignment,
            assignment_count: w.assignments.length
          }))
        },
        senior4Workshops: {
          count: senior4Workshops.length,
          data: senior4Workshops.map(w => ({
            id: w.id.toString(),
            title: w.title,
            crc_class: w.crc_class,
            has_assignment: w.has_assignment,
            assignment_count: w.assignments.length
          }))
        },
        singleWorkshop: {
          found: !!singleWorkshop,
          data: singleWorkshop ? {
            id: singleWorkshop.id.toString(),
            title: singleWorkshop.title,
            crc_class: singleWorkshop.crc_class,
            has_assignment: singleWorkshop.has_assignment,
            assignment_count: singleWorkshop.assignments.length
          } : null
        }
      }
    });
    
  } catch (error) {
    console.error('❌ TEST: Error testing workshops API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test workshops API',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 