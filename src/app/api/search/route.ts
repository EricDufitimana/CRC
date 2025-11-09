import { NextRequest, NextResponse } from 'next/server';
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
  { 
    name: 'Assignments', 
    route: '/dashboard/admin/assignments-management', 
    description: 'Full-featured assignment management system for creating, organizing, and tracking all assignments and homework. Create new assignments with titles, descriptions, due dates, and requirements. Edit existing assignments, delete assignments, and manage assignment details. View all student submissions with submission timestamps, track submission status (submitted, not submitted, late), check if students submitted on time or late, view submitted files and documents, grade assignments, provide feedback, view student work including Google Docs and file uploads, manage assignment deadlines and extensions, filter assignments by class, workshop, or date range, see comprehensive submission statistics and completion rates, download submissions, export assignment data, review assignment performance metrics, and monitor assignment completion across all classes and students.' 
  },
  { 
    name: 'Attendance', 
    route: '/dashboard/admin/attendance', 
    description: 'Comprehensive attendance tracking and management system for monitoring student presence and absence. Mark students as present or absent for classes and workshops, record attendance in real-time, view detailed attendance reports and history, filter attendance records by date range, class, student, or workshop, see attendance statistics including attendance rates and patterns, export attendance data to CSV or Excel, track attendance trends over time, identify students with poor attendance, manage attendance for CRC classes and workshops, view attendance calendars, generate attendance summaries, and perform all attendance-related administrative tasks and reporting.' 
  },
  { 
    name: 'CRC Classes', 
    route: '/dashboard/admin/crc-class-groups', 
    description: 'Complete class management system for organizing and managing CRC class groups and schedules. Create new classes with names, descriptions, and settings, edit existing classes, delete classes, assign students to classes, remove students from classes, view class rosters with student lists, organize classes by grade level including Enrichment Year (EY), Senior 4 (S4), Senior 5 (S5), and Senior 6 (S6), manage class schedules and timetables, view class statistics including student counts and participation, filter classes by grade level or name, search for specific classes, view class details and information, manage class settings and permissions, track class enrollment, and perform all class-related administrative operations and organizational tasks.' 
  },
  { 
    name: 'Resources', 
    route: '/dashboard/admin/content-management', 
    description: 'Educational resource management system for organizing and maintaining all learning materials and content. Upload new resources including documents, PDFs, videos, images, links, and study materials. Edit existing resources, update resource information, delete resources, organize resources by categories and tags, search resources by name or content, view resource usage statistics and download counts, manage resource access permissions and visibility, maintain a comprehensive content library for students and teachers, categorize resources by subject or topic, add resource descriptions and metadata, manage resource versions, track resource popularity, and ensure easy access to all educational materials and learning resources.' 
  },
  { 
    name: 'Workshops', 
    route: '/dashboard/admin/workshops', 
    description: 'Workshop management system for creating, scheduling, and managing all training sessions and educational workshops. Create new workshops with titles, descriptions, dates, and content, edit existing workshops, delete workshops, assign workshops to specific classes or groups, view workshop participants and enrollment, track workshop attendance and participation, manage workshop assignments and related tasks, see workshop statistics including enrollment rates and completion, filter workshops by class, date, or status, view workshop schedules and calendars, manage workshop materials and resources, track workshop performance, organize workshop content, and handle all workshop-related administrative activities and content management.' 
  },
  { 
    name: 'Events', 
    route: '/dashboard/admin/events-management?category=previous-events', 
    description: 'Complete event management system for organizing and managing all school events and activities. Create new events with details, dates, locations, and descriptions, edit existing events, delete events, view event details and information, filter events by category (past events, upcoming events, current events), filter events by date range, see event participants and registrations, manage event registrations and sign-ups, view event calendars and schedules, track event attendance, manage event resources and materials, organize event-related activities, view event history and archives, and handle all school-related events, activities, and calendar management tasks.' 
  },
  { 
    name: 'Announcements', 
    route: '/dashboard/admin/announcements-management', 
    description: 'Announcement management system for creating and distributing important messages and updates. Create new announcements with titles, content, and formatting, edit existing announcements, delete announcements, post announcements to students and staff, update announcement content and details, view announcement history and archives, schedule announcements for future publication, manage announcement visibility and target audiences, control who can see each announcement, communicate important information and news, track announcement views and engagement, organize announcements by category or priority, and ensure effective communication across the entire school community through the announcement system.' 
  },
  { 
    name: 'Essay Requests', 
    route: '/dashboard/admin/essay-requests', 
    description: 'Essay request management system for reviewing and processing student essay submissions. Review essay submission requests from students, approve or reject essay requests, view essay submissions with full content, read student essays and written work, check essay status and processing state, filter essays by student name, status, or submission date, provide feedback and comments on essays, manage essay deadlines and due dates, track essay request history, view essay statistics and metrics, handle essay-related administrative tasks, review essay quality and content, and manage all essay submission requests and reviews efficiently.' 
  },
  { 
    name: 'Opportunity Tracker', 
    route: '/dashboard/admin/opportunity-tracker', 
    description: 'Career opportunity tracking system for managing job opportunities, internships, and student applications. Track and manage various opportunities including job postings, internship positions, scholarship opportunities, and career programs. View opportunity details, requirements, and deadlines, manage opportunity postings and listings, track student applications for each opportunity, monitor application status and progress, filter opportunities by type, status, or date, view opportunity statistics and application rates, manage opportunity information and updates, track application deadlines, view student application details, monitor career-related opportunities, and ensure comprehensive tracking of all opportunities and student applications for career development and placement.' 
  },
];

// In-memory rate limiter (for production, use Redis or database)
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 20; // 20 searches per window
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

function getRateLimitKey(request: NextRequest): string {
  // Use IP address or session ID
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const userLimit = rateLimiter.get(key);
  
  console.log('🔍 [API Search] Rate limit check for key:', key);
  console.log('🔍 [API Search] Current user limit:', userLimit);
  console.log('🔍 [API Search] Current time:', now);

  if (!userLimit || now > userLimit.resetTime) {
    // First request or window expired, create new window
    console.log('🔍 [API Search] Creating new rate limit window');
    rateLimiter.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW };
  }

  if (userLimit.count >= RATE_LIMIT) {
    // Rate limit exceeded
    console.warn('⚠️ [API Search] Rate limit exceeded for key:', key);
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: userLimit.resetTime - now 
    };
  }

  // Increment count
  userLimit.count++;
  rateLimiter.set(key, userLimit);
  console.log('🔍 [API Search] Rate limit incremented, count:', userLimit.count, 'remaining:', RATE_LIMIT - userLimit.count);
  return { 
    allowed: true, 
    remaining: RATE_LIMIT - userLimit.count, 
    resetIn: userLimit.resetTime - now 
  };
}

// Fallback: simple keyword matching (no AI)
function fallbackSearch(query: string) {
  console.log('🔍 [API Search] Using fallback search for query:', query);
  const lowerQuery = query.toLowerCase();
  const filtered = pages.filter(page => 
    page.name.toLowerCase().includes(lowerQuery) ||
    page.description.toLowerCase().includes(lowerQuery)
  );
  console.log('🔍 [API Search] Fallback filtered results:', filtered);
  const results = filtered.slice(0, 5);
  console.log('🔍 [API Search] Fallback final results (max 5):', results);
  return results;
}

export async function POST(request: NextRequest) {
  console.log('🔍 [API Search] POST request received');
  try {
    const body = await request.json();
    const { query } = body;
    console.log('🔍 [API Search] Query received:', query);
    console.log('🔍 [API Search] Query type:', typeof query);
    console.log('🔍 [API Search] Query length:', query?.length);
    
    const rateLimitKey = getRateLimitKey(request);
    console.log('🔍 [API Search] Rate limit key:', rateLimitKey);
    const rateLimit = checkRateLimit(rateLimitKey);
    console.log('🔍 [API Search] Rate limit check:', rateLimit);

    // Return all pages if query is empty
    if (!query || query.trim().length === 0) {
      console.log('🔍 [API Search] Empty query, returning all pages');
      return NextResponse.json({ 
        results: pages,
        rateLimit: {
          remaining: rateLimit.remaining,
          resetIn: Math.ceil(rateLimit.resetIn / 1000), // seconds
        }
      });
    }

    // If rate limit exceeded, use fallback search
    if (!rateLimit.allowed) {
      console.warn('⚠️ [API Search] Rate limit exceeded, using fallback search');
      const fallbackResults = fallbackSearch(query);
      console.log('🔍 [API Search] Fallback results:', fallbackResults);
      return NextResponse.json({ 
        results: fallbackResults,
        rateLimited: true,
        message: `Rate limit exceeded. Try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
        rateLimit: {
          remaining: 0,
          resetIn: Math.ceil(rateLimit.resetIn / 1000),
        }
      }, { status: 429 });
    }

    // Use AI search
    console.log('🔍 [API Search] Using AI search with Groq');
    const prompt = `You are a search assistant for an admin dashboard. Given a user's search query, determine which pages are most relevant.

Available pages:
${pages.map((page, idx) => `${idx + 1}. ${page.name}: ${page.description}`).join('\n')}

User search query: "${query}"

Return ONLY a JSON array of page indices (1-${pages.length}) that are relevant, ordered by relevance (most relevant first). Return at most 5 results.
If the query doesn't match any pages well, return an empty array.

Example response format: [3, 1, 7]

Response:`;

    console.log('🔍 [API Search] Prompt length:', prompt.length);
    console.log('🔍 [API Search] Calling Groq API...');
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 100,
    });

    console.log('🔍 [API Search] Groq API response received');
    const responseText = completion.choices[0]?.message?.content?.trim() || '[]';
    console.log('🔍 [API Search] Raw AI response:', responseText);
    
    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\d,\s]*\]/);
    console.log('🔍 [API Search] JSON match:', jsonMatch);
    const indices = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    console.log('🔍 [API Search] Parsed indices:', indices);
    
    // Map indices to pages (subtract 1 because AI returns 1-indexed)
    const results = indices
      .map((idx: number) => {
        const page = pages[idx - 1];
        console.log(`🔍 [API Search] Mapping index ${idx} to page:`, page);
        return page;
      })
      .filter(Boolean);
    
    console.log('🔍 [API Search] Mapped results:', results);
    console.log('🔍 [API Search] Results count:', results.length);

    const finalResults = results.length > 0 ? results : fallbackSearch(query);
    if (results.length === 0) {
      console.log('🔍 [API Search] No AI results, using fallback search');
      console.log('🔍 [API Search] Fallback results:', finalResults);
    }

    console.log('✅ [API Search] Returning results:', finalResults);
    return NextResponse.json({ 
      results: finalResults,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetIn: Math.ceil(rateLimit.resetIn / 1000),
      }
    });
  } catch (error) {
    console.error('❌ [API Search] Search error:', error);
    console.error('❌ [API Search] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json({ 
      results: pages,
      error: 'Search failed, showing all pages'
    }, { status: 500 });
  }
}
