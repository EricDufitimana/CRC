const { createClient } = require('@sanity/client');

// Initialize Sanity client
const client = createClient({
  projectId: 'x8lmg4a1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // We want fresh data
});

// GROQ query to fetch all workshops
const getAllWorkshopsQuery = `
  *[_type=="workshops"] | order(_createdAt desc) {
    _id,
    title,
    description,
    presentation_pdf_url,
    workshop_date,
    workshop_group,
    _createdAt,
    assignment
  }
`;

async function fetchAllWorkshops() {
  try {
    console.log('🔍 Fetching all workshops from Sanity...');
    
    const workshops = await client.fetch(getAllWorkshopsQuery);
    
    console.log(`✅ Found ${workshops.length} workshops`);
    
    // Format the data for SQL insertion
    const formattedWorkshops = workshops.map(workshop => {
      const assignment = workshop.assignment || {};
      
      return {
        sanity_id: workshop._id,
        title: workshop.title,
        description: workshop.description,
        presentation_pdf_url: workshop.presentation_pdf_url || null,
        workshop_date: workshop.workshop_date,
        workshop_group: workshop.workshop_group,
        created_at: workshop._createdAt,
        assignment_title: assignment.assignment_title || null,
        assignment_description: assignment.assignment_description || null,
        assignment_submission_url: assignment.assignment_submission_url || null,
        assignment_submission_deadline: assignment.assignment_submission_deadline || null
      };
    });
    
    console.log('\n📊 Workshop Data Summary:');
    console.log(`Total workshops: ${formattedWorkshops.length}`);
    
    // Group by workshop_group
    const groupCounts = {};
    formattedWorkshops.forEach(workshop => {
      groupCounts[workshop.workshop_group] = (groupCounts[workshop.workshop_group] || 0) + 1;
    });
    
    console.log('\nWorkshops by group:');
    Object.entries(groupCounts).forEach(([group, count]) => {
      console.log(`  ${group}: ${count}`);
    });
    
    // Generate SQL INSERT statements
    console.log('\n📝 SQL INSERT Statements:');
    console.log('-- Copy and paste this into Supabase SQL Editor:');
    console.log('\nINSERT INTO workshops (sanity_id, title, description, presentation_pdf_url, workshop_date, workshop_group, created_at, assignment_title, assignment_description, assignment_submission_url, assignment_submission_deadline) VALUES');
    
    const sqlValues = formattedWorkshops.map(workshop => {
      return `(
        '${workshop.sanity_id}',
        '${workshop.title.replace(/'/g, "''")}',
        '${workshop.description.replace(/'/g, "''")}',
        ${workshop.presentation_pdf_url ? `'${workshop.presentation_pdf_url}'` : 'NULL'},
        '${workshop.workshop_date}',
        '${workshop.workshop_group}',
        '${workshop.created_at}',
        ${workshop.assignment_title ? `'${workshop.assignment_title.replace(/'/g, "''")}'` : 'NULL'},
        ${workshop.assignment_description ? `'${workshop.assignment_description.replace(/'/g, "''")}'` : 'NULL'},
        ${workshop.assignment_submission_url ? `'${workshop.assignment_submission_url}'` : 'NULL'},
        ${workshop.assignment_submission_deadline ? `'${workshop.assignment_submission_deadline}'` : 'NULL'}
      )`;
    });
    
    console.log(sqlValues.join(',\n'));
    console.log(';');
    
    // Also save to a JSON file for backup
    const fs = require('fs');
    fs.writeFileSync('workshops-data.json', JSON.stringify(formattedWorkshops, null, 2));
    console.log('\n💾 Data also saved to workshops-data.json');
    
  } catch (error) {
    console.error('❌ Error fetching workshops:', error);
  }
}

// Run the script
fetchAllWorkshops(); 