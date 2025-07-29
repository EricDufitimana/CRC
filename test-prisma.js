const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrisma() {
  try {
    console.log('🔍 Testing Prisma client...');
    
    // Get one student record
    const student = await prisma.students.findFirst();
    
    if (student) {
      console.log('✅ Found student record:');
      console.log('Available fields:', Object.keys(student));
      
      // Convert BigInt to string for JSON serialization
      const studentData = {
        ...student,
        id: student.id.toString(),
        user_id: student.user_id.toString()
      };
      
      console.log('Student data:', JSON.stringify(studentData, null, 2));
      
      // Try to access the specific fields
      console.log('\n🔍 Testing specific fields:');
      console.log('gpa:', student.gpa);
      
      // Try to access enum fields (they might not be available)
      try {
        console.log('grade:', student.grade);
      } catch (e) {
        console.log('grade: Not available');
      }
      
      try {
        console.log('major_full:', student.major_full);
      } catch (e) {
        console.log('major_full: Not available');
      }
      
      try {
        console.log('major_short:', student.major_short);
      } catch (e) {
        console.log('major_short: Not available');
      }
    } else {
      console.log('❌ No students found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma(); 