import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Attempting to fetch fellows from database...');
    
    const fellows = await prisma.admin.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        role: true,
        honorific: true
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedFellows = fellows.map(fellow => {
      const name = [fellow.honorific, fellow.first_name, fellow.last_name]
        .filter(Boolean)
        .join(' ');
      
      return {
        id: fellow.id.toString(),
        name: name,
        specialization: fellow.role || 'General'
      };
    });

    console.log('🔍 Successfully fetched fellows:', serializedFellows.length);
    return NextResponse.json(serializedFellows);
  } catch (error) {
    console.error('❌ Error fetching fellows:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    console.error('❌ Error details:', {
      name: errorName,
      message: errorMessage
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch fellows',
        details: errorMessage,
        type: errorName
      },
      { status: 500 }
    );
  }
} 