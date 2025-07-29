import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

export async function GET() {
  console.log("🧪 TEST: Starting Supabase connection test...");
  
  // Create Supabase client with anon key (respects RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log("🧪 TEST: Testing basic connection...");
    
    // Test 2: Check students table
    console.log("🧪 TEST: Checking students table...");
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*');
    
    console.log("🧪 TEST: Students result:", students);
    console.log("🧪 TEST: Students error:", studentsError);
    
    // Test 3: Check admins table
    console.log("🧪 TEST: Checking admins table...");
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('*');
    
    console.log("🧪 TEST: Admins result:", admins);
    console.log("🧪 TEST: Admins error:", adminsError);
    
    // Test 4: Check if we can see table structure
    console.log("🧪 TEST: Checking table structure...");
    const { data: tableInfo, error: tableError } = await supabase
      .from('students')
      .select('id, user_id, first_name, last_name')
      .limit(1);
    
    console.log("🧪 TEST: Table structure test:", tableInfo);
    console.log("🧪 TEST: Table structure error:", tableError);
    
    return NextResponse.json({
      success: true,
      tests: {
        students: {
          data: students,
          error: studentsError,
          count: students ? students.length : 0
        },
        admins: {
          data: admins,
          error: adminsError,
          count: admins ? admins.length : 0
        },
        tableStructure: {
          data: tableInfo,
          error: tableError
        }
      }
    });
    
  } catch (error) {
    console.log("🧪 TEST: Caught exception:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 