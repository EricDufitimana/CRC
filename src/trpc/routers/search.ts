import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const pages = [
  { 
    name: 'Dashboard', 
    route: '/dashboard/admin', 
    description: 'Main admin dashboard providing comprehensive overview of the entire system. View real-time statistics, performance metrics, data visualizations, charts, and summaries. Access quick navigation to all admin features, monitor system status and health, review recent activity logs, track key performance indicators (KPIs), analyze trends, view user activity, check system alerts, and get a complete snapshot of all administrative operations and activities across the platform.' 
  },
  { 
    name: 'Students', 
    route: '/dashboard/admin/student-management', 
    description: 'Complete student management system for handling all student-related operations. View detailed student profiles with personal information, academic records, and contact details. Search and filter students by name, student ID, class, grade level, or email. Edit student information, update profiles, manage student accounts and access permissions. View student history, academic progress, enrollment status, and participation records. Send emails to students, assign students to classes or groups, view student statistics and analytics, export student data, manage student photos, track student activities, and perform comprehensive student-related administrative tasks and data management.' 
  },
  // ... (rest of the pages array would be copied from the original API)
];

export const searchRouter = createTRPCRouter({
  searchPages: baseProcedure
    .input(z.object({
      query: z.string().min(1),
    }))
    .query(async ({ input }) => {
      try {
        const { query } = input;
        
        if (!query) {
          return { results: [] };
        }

        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a search assistant for a school management system. Given a search query, return the most relevant pages from the available options. Respond only with a JSON array of objects, each containing 'name', 'route', and 'description' fields. Rank by relevance."
            },
            {
              role: "user",
              content: `Search query: "${query}". Available pages: ${JSON.stringify(pages)}`
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.5,
          max_tokens: 1024,
          response_format: { type: "json_object" }
        });

        const responseContent = completion.choices[0]?.message?.content;
        let results = [];

        try {
          const parsed = JSON.parse(responseContent || '{}');
          results = Array.isArray(parsed) ? parsed : (parsed.results || []);
        } catch (parseError) {
          // Fallback to basic text matching if AI fails
          results = pages
            .filter(page => 
              page.name.toLowerCase().includes(query.toLowerCase()) ||
              page.description.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 5);
        }

        return { results };
      } catch (error) {
        console.error('Search error:', error);
        throw new Error('Search failed');
      }
    }),
});
