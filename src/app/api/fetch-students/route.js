import { NextResponse } from "next/server";
import {prisma} from "../../../lib/prisma"

// Helper function to replace underscores with spaces
function formatEnumValue(value) {
  if (!value) return null;
  return value.replace(/_/g, ' ');
}

export async function GET(request){
  try{
    const students = await prisma.students.findMany();
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
        user_id: student.user_id.toString(),
        grade: formatEnumValue(student.grade),
        major_full: formatEnumValue(student.major_full),
        major_short: student.major_short,
        gpa: student.gpa,
      };
    });
    console.log("🔍 Successfully fetched students:", serializedStudents.length);
    return NextResponse.json(serializedStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({error: "Failed to fetch students"}, {status: 500});
  }
}