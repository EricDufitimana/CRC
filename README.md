# ASYV Career Resources Center Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.3.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.57.2-green)
![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A comprehensive career development and resource management platform for ASYV students and administrators.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

The Career Resources Center (CRC) platform operates as part of the Liquidnet Family High School at The Agahozo-Shalom Youth Village (ASYV). This application empowers students with skills, knowledge, and resources needed to succeed after graduation by providing:

- **Career Development Workshops** - Structured learning sessions for professional growth
- **Mentorship Events** - Connect with industry professionals and alumni
- **Job & Internship Opportunities** - Curated opportunities for ASYV students
- **University Application Support** - Comprehensive College Readiness Program
- **Essay Review System** - Professional feedback on application essays
- **Attendance & Assignment Tracking** - Complete classroom management tools

---

## ✨ Features

### 🎓 For Students
- **Dashboard** - Personalized student portal with resources and announcements
- **Workshop Registration** - Browse and register for career development workshops
- **Opportunity Submissions** - Submit opportunities discovered outside the platform
- **Essay Requests** - Request essay reviews from CRC administrators
- **Assignment Tracking** - View and submit workshop assignments
- **Attendance Records** - Track workshop attendance and participation
- **Profile Management** - Manage academic information and upload documents

### 👨‍💼 For Administrators
- **Content Management** - Create and manage workshops, assignments, and events
- **Student Management** - Organize students by grade and CRC classes
- **Essay Review System** - Review, refer, and manage essay requests
- **Opportunity Management** - Review and approve student-submitted opportunities
- **Attendance Management** - Take and track attendance for workshops
- **Admin Referrals** - Distribute workload among CRC team members
- **Analytics Dashboard** - Monitor student engagement and program effectiveness
- **Bulk Email System** - Send announcements and updates to students

### 📚 Resource Categories
- **New Opportunities** - Fresh job and internship postings
- **Recurring Opportunities** - Ongoing programs and competitions
- **Templates** - CV, cover letter, and application templates
- **English Language Learning** - Resources for improving English proficiency
- **College Readiness Program (CRP)** - University application guidance
- **Previous & Upcoming Events** - Event gallery and calendar

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.3.0 (React 18.3.1)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.3.0
- **UI Components**: Radix UI, Shadcn/ui
- **Animations**: Framer Motion, GSAP
- **Forms**: React Hook Form + Zod validation
- **Rich Text**: Lexical Editor

### Backend
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma 6.15.0
- **Authentication**: Supabase Auth + Next-Auth 4.24.11
- **File Storage**: Cloudinary, Supabase Storage
- **Edge Functions**: Supabase Functions (Deno)

### Developer Tools
- **Monitoring**: Sentry
- **Analytics**: Vercel Analytics
- **Email**: Nodemailer
- **PDF Processing**: pdfjs-dist, pdf-parse
- **Image Optimization**: Sharp, browser-image-compression
- **CMS**: Sanity (legacy - being migrated to Supabase)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **pnpm**
- **PostgreSQL** database (or Supabase account)
- **Cloudinary** account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CRC-Testing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Email (Nodemailer)
   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_password

   # Sentry (optional)
   SENTRY_DSN=your_sentry_dsn
   SENTRY_AUTH_TOKEN=your_auth_token

   # Sanity (legacy - optional)
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=your_dataset
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
CRC-Testing/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Admin dashboard
│   │   ├── (site)/            # Public website
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── dashboard/         # Admin components
│   │   ├── form/              # Form components
│   │   ├── ui/                # Shadcn UI components
│   │   └── ...                # Feature components
│   ├── actions/               # Server actions
│   │   ├── admin/             # Admin operations
│   │   ├── essays/            # Essay management
│   │   ├── opportunities/     # Opportunity handling
│   │   └── workshops/         # Workshop management
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── styles/                # Global styles
│   └── types/                 # TypeScript definitions
├── supabase/
│   ├── functions/             # Edge Functions
│   │   ├── send_welcome_email/
│   │   ├── send_essay_emails/
│   │   └── ...
│   └── config.toml            # Supabase configuration
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── images/                # Static assets
├── scripts/
│   └── migrate-sanity-to-supabase.js
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **Users & Profiles** - Authentication and user management
- **Students** - Student information and academic records
- **Admin** - Administrator accounts and roles
- **Workshops** - Career development workshops
- **Assignments** - Workshop assignments and submissions
- **Essay Requests** - Essay review requests and referrals
- **Opportunities** - Job/internship submissions and approvals
- **Attendance** - Workshop attendance tracking
- **Resources** - Career resources and materials (Supabase)
- **Events** - Past and upcoming events (Supabase)

See `prisma/schema.prisma` for the complete schema definition.

---

## 🔌 API Routes

### Public APIs
- `GET /api/health` - Health check endpoint
- `GET /api/resources/*` - Public resource listings
- `GET /api/events/*` - Event information

### Protected APIs (Authentication Required)
- `/api/students/*` - Student data management
- `/api/workshops/*` - Workshop operations
- `/api/assignments/*` - Assignment handling
- `/api/essays/*` - Essay request management
- `/api/opportunities/*` - Opportunity submission
- `/api/attendance/*` - Attendance tracking
- `/api/admin/*` - Administrative functions

---

## 🔐 Authentication & Authorization

The platform uses a multi-layered authentication system:

1. **Supabase Auth** - Primary authentication provider
2. **Next-Auth** - Session management and JWT handling
3. **Row Level Security (RLS)** - Database-level access control
4. **Middleware** - Route protection and role-based access

### User Roles
- **Student** - Access to resources, workshops, and personal dashboard
- **Admin** - Content management and student oversight
- **Super Admin** - Full system access and configuration

---

## 🔧 Supabase Edge Functions

The platform includes several serverless functions:

- **send_welcome_email** - Onboard new students
- **send_essay_emails** - Essay request notifications
- **send_opportunity_emails** - Opportunity updates
- **send_new_assignment_email** - Assignment notifications
- **send_bulk_emails** - Mass communication
- **scan_report_card_ai** - AI-powered document processing
- **send_message** - General messaging
- **send_help_message** - Support requests

Deploy functions:
```bash
supabase functions deploy <function-name>
```

---

## 🎨 Styling & Theming

- **Design System**: Custom design tokens with Tailwind CSS
- **Dark Mode**: Full dark mode support via next-themes
- **Responsive Design**: Mobile-first approach
- **Animations**: 
  - Framer Motion for page transitions
  - GSAP for complex animations
  - Custom scroll animations
- **Components**: Radix UI primitives with custom styling

---

## 📧 Email System

The platform uses a robust email system for notifications:

- **Nodemailer** for sending emails
- **Supabase Edge Functions** for triggered emails
- **Email Templates** for consistent branding
- **Bulk Email** capabilities for announcements

---

## 📤 File Upload & Storage

- **Profile Pictures**: Cloudinary
- **Academic Reports**: Supabase Storage
- **Assignment Submissions**: Google Drive links or file uploads
- **Event Gallery**: Supabase Storage
- **Resumes**: Supabase Storage

---

## 🔄 Migration Guide

The platform is transitioning from Sanity CMS to Supabase for content management.

Run the migration:
```bash
npm run migrate:sanity
```

See `MIGRATION_GUIDE.md` for detailed instructions.

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 🏗 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in project settings
3. **Deploy** - Vercel will automatically build and deploy

```bash
# Or deploy via CLI
vercel deploy
```

### Docker

A Dockerfile is included for containerized deployment:

```bash
docker build -t crc-platform .
docker run -p 3000:3000 crc-platform
```

---

## 📈 Performance Optimizations

- **Image Optimization**: Next.js Image component with Sharp
- **Code Splitting**: Lazy loading for non-critical components
- **Caching**: SWR for client-side data fetching
- **Edge Functions**: Fast serverless execution
- **Static Generation**: Pre-rendered pages where possible
- **Bundle Analysis**: Optimized dependencies

---

## 🔒 Security

- **Row Level Security (RLS)** on all database tables
- **CSRF Protection** via Next.js middleware
- **XSS Prevention** through React's built-in escaping
- **SQL Injection Protection** via Prisma ORM
- **Authentication Tokens** secured with httpOnly cookies
- **Content Security Policy** configured in next.config.js
- **Environment Variables** never exposed to client

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create a branch** for your feature (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write descriptive commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

---

## 📝 Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build           # Build for production
npm start               # Start production server

# Database
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema changes
npx prisma studio       # Open Prisma Studio

# Migration
npm run migrate:sanity  # Migrate from Sanity to Supabase

# Maintenance
npm run lint            # Run ESLint
npm run postinstall     # Apply patches
```

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues**
- Verify `DATABASE_URL` and `DIRECT_URL` in `.env.local`
- Check Supabase project status
- Ensure IP whitelisting (if applicable)

**Authentication Errors**
- Verify Supabase Auth configuration
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

**Build Errors**
- Run `npm install` to update dependencies
- Clear Next.js cache: `rm -rf .next`
- Regenerate Prisma client: `npx prisma generate`

**Image Upload Issues**
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper CORS configuration

---

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Migration Guide](./MIGRATION_GUIDE.md)

---

## 🙏 Acknowledgments

- **Agahozo-Shalom Youth Village (ASYV)** - For their mission and support
- **Liquidnet Family** - For funding the high school and CRC program
- **All Contributors** - For making this platform possible

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Contact the CRC team at ASYV
- Email: [Your contact email]

---

<div align="center">

Made with ❤️ for ASYV Students

**[⬆ back to top](#asyv-career-resources-center-platform)**

</div>

