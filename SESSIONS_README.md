# Sessions Management - Admin Dashboard

## Overview

The Sessions Management page provides comprehensive tools for CRC fellows to manage student essay review sessions. This feature allows admins to view, organize, and take action on submitted essay requests.

## Features

### 📊 Dashboard Overview
- **Statistics Cards**: Real-time counts of total, pending, in-review, and completed sessions
- **Quick Actions**: Refresh data and create new sessions
- **Search & Filter**: Find sessions by title, student name, or status

### 📋 List View
- **Tabbed Interface**: Organize sessions by status (Pending, In Review, Completed)
- **Session Cards**: Detailed view of each session with key information
- **Action Buttons**: Accept, postpone, defer, or view details for each session
- **Status Indicators**: Color-coded badges showing session status

### 📅 Calendar View
- **Google Calendar Integration**: Connect with Google Calendar for scheduling
- **Visual Calendar**: View sessions by date with interactive calendar
- **Session Preview**: See session details directly on calendar dates
- **Settings Panel**: Configure sync frequency and notification preferences

### 🔍 Session Details Dialog
- **Comprehensive Information**: Essay details, student info, and timeline
- **Quick Actions**: Preview, download, edit, and send email
- **Management Tools**: Accept, postpone, or defer sessions with notes
- **Progress Tracking**: Visual progress indicators for in-review sessions

## Session Actions

### Accept Session
- Assign session to a specific CRC fellow
- Add optional notes
- Changes status to "In Review"

### Postpone Session
- Extend deadline by 7 days
- Add notes explaining postponement
- Keeps status as "Pending"

### Defer Session
- Transfer session to a different CRC fellow
- Add notes for context
- Maintains "Pending" status

## Database Schema

The sessions are stored in the `essay_requests` table with the following structure:

```sql
CREATE TABLE essay_requests (
  id BIGINT PRIMARY KEY,
  student_id BIGINT,
  admin_id BIGINT,
  title TEXT,
  essay_link TEXT,
  word_count BIGINT,
  description TEXT,
  deadline DATE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  defer BOOLEAN DEFAULT FALSE,
  status status DEFAULT 'pending'
);
```

## API Endpoints

### GET /api/sessions
Fetches all sessions with related student and admin information.

**Response:**
```json
[
  {
    "id": "1",
    "student_id": "123",
    "admin_id": "456",
    "title": "College Application Essay",
    "essay_link": "https://docs.google.com/...",
    "word_count": "650",
    "description": "Personal statement for university application",
    "deadline": "2024-08-15",
    "submitted_at": "2024-07-20T10:30:00Z",
    "defer": false,
    "status": "pending",
    "admin_name": "Dr. Sarah Johnson",
    "student_name": "John Doe",
    "student_email": "john.doe@email.com"
  }
]
```

### POST /api/sessions
Updates session status and assignments.

**Request Body:**
```json
{
  "sessionId": "1",
  "action": "accept|postpone|defer",
  "adminId": "456",
  "notes": "Optional notes about the action"
}
```

## Google Calendar Integration

### Features
- **OAuth Connection**: Secure Google Calendar authentication
- **Auto-sync**: Configurable sync frequency (15 min, hourly, daily)
- **Event Creation**: Automatically creates calendar events for sessions
- **Color Coding**: Different colors for different session statuses
- **Settings Panel**: Configure sync preferences and notifications

### Setup (Future Implementation)
1. Configure Google Calendar API credentials
2. Implement OAuth flow for admin authentication
3. Set up webhook for real-time sync
4. Add notification system for upcoming sessions

## Usage Instructions

### For Admins
1. **Navigate to Sessions**: Click "Sessions" in the admin sidebar
2. **View Sessions**: Use list or calendar view to see all sessions
3. **Take Action**: Click action buttons on session cards or use the details dialog
4. **Manage Calendar**: Connect Google Calendar for better scheduling
5. **Search & Filter**: Use search bar and status filters to find specific sessions

### Session Workflow
1. **Student Submits**: Essay request appears in "Pending" tab
2. **Admin Reviews**: View session details and take appropriate action
3. **Assign/Defer**: Accept and assign to fellow or defer to another
4. **Track Progress**: Monitor sessions through "In Review" status
5. **Complete**: Mark as completed when review is finished

## Technical Implementation

### Components
- `SessionsPage`: Main page component with tabs and views
- `SessionCard`: Individual session display component
- `GoogleCalendarIntegration`: Calendar view and sync functionality
- `SessionDetailsDialog`: Comprehensive session management dialog

### State Management
- Session data fetching and caching
- Search and filter state
- Dialog open/close states
- Loading and error states

### Styling
- Uses shadcn/ui components for consistent design
- Responsive layout for mobile and desktop
- Dark/light theme support
- Custom dashboard color scheme

## Future Enhancements

### Planned Features
- **Email Notifications**: Automated emails for session updates
- **Bulk Actions**: Select multiple sessions for batch operations
- **Advanced Filtering**: Filter by date range, word count, etc.
- **Analytics Dashboard**: Session statistics and trends
- **Mobile App**: Native mobile app for session management
- **Integration APIs**: Connect with other educational platforms

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live updates
- **Offline Support**: PWA capabilities for offline access
- **Performance**: Virtual scrolling for large session lists
- **Accessibility**: Enhanced screen reader support
- **Internationalization**: Multi-language support

## Troubleshooting

### Common Issues
1. **Sessions not loading**: Check API endpoint and database connection
2. **Calendar sync failing**: Verify Google Calendar API credentials
3. **Actions not working**: Ensure proper permissions and session state
4. **Search not finding sessions**: Check search term and filter settings

### Debug Information
- Check browser console for JavaScript errors
- Verify API responses in Network tab
- Review server logs for backend issues
- Test database connectivity directly

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository. 