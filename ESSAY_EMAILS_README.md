# Essay Email System - Unified Function

This document describes the unified essay email system that consolidates all essay-related email notifications into a single Supabase Edge Function.

## Overview

The `send_essay_emails` function replaces multiple individual email functions with a single, unified function that handles all essay email notifications based on template IDs.

## Function Details

**Function Name**: `send_essay_emails`  
**Location**: `supabase/functions/send_essay_emails/`

## Supported Email Templates

### Template ID 6: New Essay for Admin
- **Trigger**: When a student submits a new essay
- **Recipient**: Admin (CRC Fellow)
- **Required Parameters**:
  - `admin_name`: Full name of the admin
  - `student_name`: Full name of the student
  - `essay_title`: Title of the submitted essay
  - `date_time`: Submission date and time
  - `dashboard_link`: Link to admin dashboard
  - `description`: Essay description

### Template ID 7: Essay Being Reviewed
- **Trigger**: When an admin clicks "View Essay" on a pending essay
- **Recipient**: Student
- **Required Parameters**:
  - `essay_title`: Title of the essay
  - `admin_name`: Name of the admin reviewing the essay

### Template ID 8: Essay Review Done
- **Trigger**: When an admin marks an essay as completed
- **Recipient**: Student
- **Required Parameters**:
  - `essay_title`: Title of the essay
  - `admin_name`: Name of the admin who completed the review

### Template ID 9: Essay Referred (Student Notification)
- **Trigger**: When an admin refers an essay to another admin
- **Recipient**: Student
- **Required Parameters**:
  - `essay_title`: Title of the essay
  - `to_admin`: Name of the admin receiving the referral
  - `by_admin`: Name of the admin making the referral

### Template ID 10: Essay Referred (Admin Notification)
- **Trigger**: When an essay is referred to an admin
- **Recipient**: Receiving admin
- **Required Parameters**:
  - `essay_title`: Title of the essay
  - `admin_name`: Name of the receiving admin
  - `dashboard_link`: Link to admin dashboard

## Server Actions

The following server actions are available in `src/actions/essays/sendEssayEmail.ts`:

### Main Function
- `sendEssayEmailServer(recipientEmail, templateId, params)`: Generic function for sending any essay email

### Helper Functions
- `sendNewEssayForAdminEmailServer(adminEmail, adminName, studentName, essayTitle, dateTime, dashboardLink, description)`
- `sendEssayBeingReviewedEmailServer(studentEmail, essayTitle, adminName)`
- `sendEssayReviewDoneEmailServer(studentEmail, essayTitle, adminName)`
- `sendEssayReferredStudentEmailServer(studentEmail, essayTitle, toAdmin, byAdmin)`
- `sendEssayReferredAdminEmailServer(adminEmail, essayTitle, adminName, dashboardLink)`

## Usage Examples

### Sending a New Essay Notification
```typescript
import { sendNewEssayForAdminEmailServer } from '@/actions/essays/sendEssayEmail';

const result = await sendNewEssayForAdminEmailServer(
  'admin@example.com',
  'Dr. John Doe',
  'Jane Smith',
  'My Essay Title',
  '2024-01-15 14:30',
  'http://localhost:3000/dashboard/admin/essay-requests',
  'Essay description here'
);
```

### Sending Essay Review Notification
```typescript
import { sendEssayBeingReviewedEmailServer } from '@/actions/essays/sendEssayEmail';

const result = await sendEssayBeingReviewedEmailServer(
  'student@example.com',
  'My Essay Title',
  'Dr. John Doe'
);
```

## Migration from Old System

The following functions have been replaced and can be removed:
- `send_new_essay_for_admin_email`
- `send_essay_being_reviewed_email`
- `send_essay_review_done_email`
- `send_essay_referred_student_email`
- `send_essay_referred_admin_email`

## Benefits of Unified System

1. **Centralized Management**: All essay emails are handled in one place
2. **Consistent Error Handling**: Uniform error handling and logging
3. **Easier Maintenance**: Single function to update and deploy
4. **Better Parameter Validation**: Centralized parameter validation logic
5. **Unified Logging**: Consistent logging across all email types

## Deployment

To deploy the new function:

```bash
supabase functions deploy send_essay_emails
```

## Testing

The function includes comprehensive error handling and logging. Check the Supabase function logs for debugging information.

## Error Handling

The function validates:
- Required `templateId` and `recipient_email` parameters
- Template-specific required parameters
- Brevo API key configuration
- API response status

All errors are logged with detailed information for debugging.
