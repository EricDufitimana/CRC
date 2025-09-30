# Sanity to Supabase Migration Guide

This guide documents the migration from Sanity CMS to Supabase for content management.

## 🗄️ Database Schema

### Resources Table
```sql
CREATE TABLE resources (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  secondary_url TEXT,
  image_address TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'internship',
    'templates', 
    'new_opportunities',
    'recurring_opportunities',
    'english_language_learning'
  )),
  opportunity_deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Events Table
```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('previous_events', 'upcoming_events')),
  date DATE,
  location TEXT,
  category TEXT CHECK (category IN (
    'conference',
    'seminar', 
    'workshop',
    'webinar',
    'training',
    'other'
  )),
  event_organizer_name TEXT,
  event_organizer_role TEXT,
  event_organizer_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Event Gallery Table
```sql
CREATE TABLE event_gallery (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  public_id TEXT,
  alt_text TEXT,
  is_hero BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🪣 Storage Bucket

- **Bucket Name**: `events-gallery`
- **Purpose**: Store event gallery images
- **Public Access**: Yes (for reading)
- **File Size Limit**: 50MB
- **Allowed MIME Types**: image/jpeg, image/png, image/webp, image/gif

## 🚀 Migration Steps

### 1. Run the Migration Script

```bash
npm run migrate:sanity
```

This script will:
- Fetch all resources from Sanity
- Fetch all events from Sanity
- Import them into Supabase tables
- Handle gallery images for events

### 2. Environment Variables Required

Make sure you have these environment variables set:

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=your_dataset

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Update Your Application Code

Replace Sanity client imports with Supabase queries:

**Before (Sanity):**
```javascript
import { client } from "@/sanity/lib/client";
import { getNewOpportunities } from "@/sanity/lib/queries";

const data = await client.fetch(getNewOpportunities);
```

**After (Supabase):**
```javascript
import { getNewOpportunities } from "@/lib/supabase-queries";

const data = await getNewOpportunities();
```

## 📊 Data Mapping

### Sanity → Supabase Field Mapping

#### Resources
- `_id` → `id` (auto-generated)
- `title` → `title`
- `description` → `description`
- `url` → `url`
- `secondary_url` → `secondary_url`
- `image_address` → `image_address`
- `category` → `category`
- `opportunity_deadline` → `opportunity_deadline`
- `_createdAt` → `created_at`

#### Events
- `_id` → `id` (auto-generated)
- `title` → `title`
- `description` → `description`
- `type` → `type`
- `date` → `date`
- `location` → `location`
- `category` → `category`
- `event_organizer.name` → `event_organizer_name`
- `event_organizer.role` → `event_organizer_role`
- `event_organizer.image` → `event_organizer_image`
- `_createdAt` → `created_at`

#### Gallery Images
- `gallery[].asset.url` → `event_gallery.image_url`
- `gallery[].asset.publicId` → `event_gallery.public_id`
- `gallery[].alt` → `event_gallery.alt_text`
- `gallery[].isHero` → `event_gallery.is_hero`

## 🔄 Query Equivalents

| Sanity Query | Supabase Function |
|--------------|-------------------|
| `getNewOpportunities` | `getNewOpportunities()` |
| `getTemplates` | `getTemplates()` |
| `getEnglishLanguageLearning` | `getEnglishLanguageLearning()` |
| `getRecurringOpportunities` | `getRecurringOpportunities()` |
| `getInternships` | `getInternships()` |
| `getRecentResources` | `getRecentResources()` |
| `getPreviousEvents` | `getPreviousEvents()` |
| `getUpcomingEvents` | `getUpcomingEvents()` |
| `getEventsByType` | `getEventsByType(type)` |

## 🛠️ Next Steps

1. **Test the Migration**: Run the migration script and verify data integrity
2. **Update Components**: Replace Sanity queries with Supabase functions
3. **Update Admin Interface**: Modify content management to use Supabase
4. **Test Functionality**: Ensure all features work with the new data source
5. **Performance Testing**: Verify query performance and caching
6. **Remove Sanity**: Once everything is working, remove Sanity dependencies

## 🔍 Verification

After migration, verify:

- [ ] All resources are imported correctly
- [ ] All events are imported correctly
- [ ] Gallery images are properly linked
- [ ] Categories and types are preserved
- [ ] Dates and deadlines are correct
- [ ] URLs and links are working
- [ ] Admin functions work with new schema

## 📝 Notes

- The migration preserves all existing data structure
- Gallery images are stored in Supabase Storage
- RLS (Row Level Security) is enabled on all tables
- Indexes are created for optimal query performance
- The migration script is idempotent (can be run multiple times safely)
