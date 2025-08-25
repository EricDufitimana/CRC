import { NextResponse } from "next/server";
import {prisma} from "../../../lib/prisma"

// Helper function to replace underscores with spaces
function formatEnumValue(value) {
  if (!value) return null;
  return value.replace(/_/g, ' ');
}

export async function GET(request){
  try{
    const students = await prisma.students.findMany({
      orderBy: {
        id: 'asc'
      }
    });
    const serializedStudents = students.map(student => {
      const full_name = [student.first_name, student.last_name].filter(Boolean).join(' ');
      
      return {
        id: student.id.toString(),
        student_id: student.student_id,
        full_name: full_name,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        profile_picture: student.profile_picture,
        date_of_registration: student.date_of_registration,
        user_id: student.user_id ? student.user_id.toString() : null,
        grade: formatEnumValue(student.grade),
        major_full: student.major_full ? formatEnumValue(student.major_full) : null,
        major_short: student.major_short ? student.major_short : null,
        gpa: student.gpa,
        crc_class_id: student.crc_class_id ? student.crc_class_id.toString() : null,
      };
    });

    // Randomize the order of students
    
    console.log("🔍 Successfully fetched and randomized students:", serializedStudents.length);
    return NextResponse.json(serializedStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({
      error: "Failed to fetch students", 
      details: error.message,
      type: error.name
    }, {status: 500});
  }
}