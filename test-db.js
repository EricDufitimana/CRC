const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Get one student record to see what fields are available
    const student = await prisma.students.findFirst();
    
    if (student) {
      console.log('✅ Found student record:');
      console.log('Available fields:', Object.keys(student));
      console.log('Student data:', JSON.stringify(student, null, 2));
    } else {
      console.log('❌ No students found in database');
    }
    
  } catch (error) {
    console.error('❌ Error testing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 