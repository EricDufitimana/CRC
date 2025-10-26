import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const pages = [
  { name: 'Dashboard', route: '/dashboard/admin', description: 'Main overview and statistics' },
  { name: 'Students', route: '/dashboard/admin/student-management', description: 'Manage student information and profiles' },
  { name: 'Assignments', route: '/dashboard/admin/assignments-management', description: 'Create and manage assignments and homework' },
  { name: 'Attendance', route: '/dashboard/admin/attendance', description: 'Track student attendance and presence' },
  { name: 'CRC Classes', route: '/dashboard/admin/crc-class-groups', description: 'Manage CRC class groups and schedules' },
  { name: 'Resources', route: '/dashboard/admin/content-management', description: 'Manage educational resources and materials' },
  { name: 'Workshops', route: '/dashboard/admin/workshops', description: 'Create and manage workshops and training sessions' },
  { name: 'Events', route: '/dashboard/admin/events-management?category=previous-events', description: 'Manage school events and activities' },
  { name: 'Announcements', route: '/dashboard/admin/announcements-management', description: 'Create and manage announcements and news' },
  { name: 'Essay Requests', route: '/dashboard/admin/essay-requests', description: 'Review and manage essay submission requests' },
  { name: 'Opportunity Tracker', route: '/dashboard/admin/opportunity-tracker', description: 'Track opportunities and applications' },
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

  if (!userLimit || now > userLimit.resetTime) {
    // First request or window expired, create new window
    rateLimiter.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW };
  }

  if (userLimit.count >= RATE_LIMIT) {
    // Rate limit exceeded
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: userLimit.resetTime - now 
    };
  }

  // Increment count
  userLimit.count++;
  rateLimiter.set(key, userLimit);
  return { 
    allowed: true, 
    remaining: RATE_LIMIT - userLimit.count, 
    resetIn: userLimit.resetTime - now 
  };
}

// Fallback: simple keyword matching (no AI)
function fallbackSearch(query: string) {
  const lowerQuery = query.toLowerCase();
  return pages.filter(page => 
    page.name.toLowerCase().includes(lowerQuery) ||
    page.description.toLowerCase().includes(lowerQuery)
  ).slice(0, 5);
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey);

    // Return all pages if query is empty
    if (!query || query.trim().length === 0) {
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
      const fallbackResults = fallbackSearch(query);
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
    const prompt = `You are a search assistant for an admin dashboard. Given a user's search query, determine which pages are most relevant.

Available pages:
${pages.map((page, idx) => `${idx + 1}. ${page.name}: ${page.description}`).join('\n')}

User search query: "${query}"

Return ONLY a JSON array of page indices (1-${pages.length}) that are relevant, ordered by relevance (most relevant first). Return at most 5 results.
If the query doesn't match any pages well, return an empty array.

Example response format: [3, 1, 7]

Response:`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 100,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || '[]';
    
    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\d,\s]*\]/);
    const indices = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    // Map indices to pages (subtract 1 because AI returns 1-indexed)
    const results = indices
      .map((idx: number) => pages[idx - 1])
      .filter(Boolean);

    return NextResponse.json({ 
      results: results.length > 0 ? results : fallbackSearch(query),
      rateLimit: {
        remaining: rateLimit.remaining,
        resetIn: Math.ceil(rateLimit.resetIn / 1000),
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      results: pages,
      error: 'Search failed, showing all pages'
    }, { status: 500 });
  }
}
