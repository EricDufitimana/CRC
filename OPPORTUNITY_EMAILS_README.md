# Opportunity Emails System

This system consolidates all opportunity-related email functionality into a single Supabase Edge Function with helper utilities for easy integration.

## 🚀 Overview

Instead of having separate functions for each email type, we now have one unified function `send_opportunity_emails` that handles all email scenarios based on the `templateId` parameter.

## 📧 Supported Email Types

### 1. New Opportunity Submission (Template ID: 13)
**Sent to:** Admin after a student submits an opportunity

**Parameters:**
- `admin_name` - Name of the admin receiving the email
- `student_name` - Name of the student who submitted
- `opportunity_title` - Title of the opportunity
- `description` - Description of the opportunity
- `date_time` - When the opportunity was submitted
- `dashboard_link` - Link to the admin dashboard
- `recipient_email` - Admin's email address

**Usage:**
```typescript
import { sendNewOpportunityEmail } from '@/utils/opportunityEmails';

await sendNewOpportunityEmail(
  adminEmail,
  adminName,
  studentName,
  opportunityTitle,
  description,
  dateTime,
  dashboardLink
);
```

### 2. Opportunity Referred (Admin) (Template ID: 15)
**Sent to:** Admin being referred the opportunity

**Parameters:**
- `to_admin_name` - Name of the admin being referred to
- `opportunity_title` - Title of the opportunity
- `student_name` - Name of the student who submitted
- `by_admin_name` - Name of the admin making the referral
- `dashboard_link` - Link to the admin dashboard
- `recipient_email` - Admin's email address

**Usage:**
```typescript
import { sendOpportunityReferredAdminEmail } from '@/utils/opportunityEmails';

await sendOpportunityReferredAdminEmail(
  adminEmail,
  toAdminName,
  opportunityTitle,
  studentName,
  byAdminName,
  dashboardLink
);
```

### 3. Opportunity Referred (Student) (Template ID: 14)
**Sent to:** Student who submitted the opportunity

**Parameters:**
- `opportunity_title` - Title of the opportunity
- `referred_to_admin_name` - Name of the admin the opportunity was referred to
- `recipient_email` - Student's email address

**Usage:**
```typescript
import { sendOpportunityReferredStudentEmail } from '@/utils/opportunityEmails';

await sendOpportunityReferredStudentEmail(
  studentEmail,
  opportunityTitle,
  referredToAdminName
);
```

### 4. Opportunity Being Reviewed (Template ID: 11)
**Sent to:** Student when opportunity review starts

**Parameters:**
- `opportunity_title` - Title of the opportunity
- `recipient_email` - Student's email address

**Usage:**
```typescript
import { sendOpportunityBeingReviewedEmail } from '@/utils/opportunityEmails';

await sendOpportunityBeingReviewedEmail(
  studentEmail,
  opportunityTitle
);
```

### 5. Opportunity Denied (Template ID: 16)
**Sent to:** Student when opportunity is denied

**Parameters:**
- `opportunity_title` - Title of the opportunity
- `reason` - Reason for denial
- `recipient_email` - Student's email address

**Usage:**
```typescript
import { sendOpportunityDeniedEmail } from '@/utils/opportunityEmails';

await sendOpportunityDeniedEmail(
  studentEmail,
  opportunityTitle,
  reason
);
```

### 6. Opportunity Accepted (Template ID: 17)
**Sent to:** Student when opportunity is accepted

**Parameters:**
- `opportunity_title` - Title of the opportunity
- `recipient_email` - Student's email address

**Usage:**
```typescript
import { sendOpportunityAcceptedEmail } from '@/utils/opportunityEmails';

await sendOpportunityAcceptedEmail(
  studentEmail,
  opportunityTitle
);
```

## 🔧 Direct Function Call

If you prefer to call the function directly without the helper functions:

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send_opportunity_emails`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  },
  body: JSON.stringify({
    templateId: 13, // New Opportunity Submission
    recipient_email: 'admin@example.com',
    admin_name: 'John Doe',
    student_name: 'Jane Smith',
    opportunity_title: 'Summer Internship',
    description: 'Great opportunity for students',
    date_time: '2024-01-15 10:30:00',
    dashboard_link: 'https://example.com/dashboard'
  }),
});
```

## 📋 Email Template Setup

Make sure your Brevo email templates are set up with the correct IDs and parameter placeholders:

- **Template 11**: `{{params.opportunity_title}}`
- **Template 13**: `{{params.admin_name}}`, `{{params.student_name}}`, `{{params.opportunity_title}}`, `{{params.description}}`, `{{params.date_time}}`, `{{params.dashboard_link}}`
- **Template 14**: `{{params.opportunity_title}}`, `{{params.referred_to_admin_name}}`
- **Template 15**: `{{params.to_admin_name}}`, `{{params.opportunity_title}}`, `{{params.student_name}}`, `{{params.by_admin_name}}`, `{{params.dashboard_link}}`
- **Template 16**: `{{params.opportunity_title}}`, `{{params.reason}}`
- **Template 17**: `{{params.opportunity_title}}`

## 🚀 Deployment

Deploy the updated function:

```bash
supabase functions deploy send_opportunity_emails
```

## ✅ Benefits

1. **Single Function**: All opportunity emails handled by one Edge Function
2. **Easy Maintenance**: Update email logic in one place
3. **Consistent API**: Same interface for all email types
4. **Type Safety**: Helper functions provide TypeScript support
5. **Error Handling**: Centralized error handling and validation
6. **Flexibility**: Can still call the function directly if needed

## 🐛 Troubleshooting

### Common Issues:

1. **Missing Parameters**: Check that all required parameters for the template ID are provided
2. **Invalid Template ID**: Ensure template ID is one of: 11, 13, 14, 15, 16, 17
3. **Brevo API Errors**: Verify your `BREVO_API_KEY` environment variable is set correctly
4. **Email Not Sent**: Check the function logs for detailed error messages

### Debug Mode:

The function includes comprehensive logging. Check your Supabase function logs for:
- Parameter validation results
- Brevo API responses
- Success confirmations
- Error details
