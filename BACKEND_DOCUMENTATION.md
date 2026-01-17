# Backend Documentation - Roadside Rescue (MechRadii)

This document provides a comprehensive overview of the backend architecture for the MechRadii application, which is built on **Supabase**.

## Architecture Overview

MechRadii utilizes Supabase for authentication, database management, and file storage. The backend logic is a mix of PostgreSQL triggers, RLS (Row Level Security) policies, and Supabase Storage buckets.

---

## Database Schema (PostgreSQL)

### Tables

#### 1. `profiles`
Stores basic user information linked to Supabase Auth.
- **id**: `UUID` (Primary Key, Default: `gen_random_uuid()`)
- **user_id**: `UUID` (Unique, Foreign Key from `auth.users`, CASCADE on delete)
- **full_name**: `TEXT` (Required)
- **email**: `TEXT` (Required)
- **avatar_url**: `TEXT` (Optional, URL to profile picture)
- **created_at**: `TIMESTAMP WITH TIME ZONE` (Default: `now()`)
- **updated_at**: `TIMESTAMP WITH TIME ZONE` (Default: `now()`)

#### 2. `mechanics`
Stores professional information for registered mechanics.
- **id**: `UUID` (Primary Key)
- **user_id**: `UUID` (Foreign Key from `auth.users`)
- **full_name**: `TEXT` (Required)
- **email**: `TEXT` (Required)
- **phone**: `TEXT` (Required)
- **location**: `TEXT` (Required, Service Area)
- **experience_years**: `INT` (Default: 0)
- **about**: `TEXT` (Bio/Description)
- **services**: `TEXT[]` (Array of service categories offered)
- **avatar_url**: `TEXT` (Optional)
- **rating**: `DECIMAL` (Average rating, Optional)
- **total_reviews**: `INT` (Count of reviews, Optional)
- **is_verified**: `BOOLEAN` (Verification status, Default: `false`)
- **is_available**: `BOOLEAN` (Online/Offline status, Default: `true`)
- **created_at**: `TIMESTAMP WITH TIME ZONE`
- **updated_at**: `TIMESTAMP WITH TIME ZONE`

---

## Backend Logic & Automation

### Triggers and Functions

#### `handle_new_user()`
- **Trigger**: `AFTER INSERT` on `auth.users`.
- **Purpose**: Automatically creates a corresponding entry in the `public.profiles` table whenever a new user signs up via Supabase Auth.
- **Metadata**: Pulls `full_name` from `raw_user_meta_data`.

#### `update_updated_at_column()`
- **Trigger**: `BEFORE UPDATE` on `profiles` (and likely `mechanics`).
- **Purpose**: Automatically updates the `updated_at` timestamp whenever a row is modified.

---

## Storage & Assets

### Buckets

#### `avatars`
- **Public**: Yes
- **Policies**:
  - **Select**: Publicly accessible.
  - **Insert/Update/Delete**: Restricted to the owner. Folder structure is `auth.uid() / filename`.

---

## Security (RLS Policies)

The application enforces **Row Level Security (RLS)** strictly:
- **Profiles**: Restricted to `auth.uid() = user_id`. Users can only view and manage their own profile.
- **Mechanics**: (Inferred) Publicly viewable for discovery; updates restricted to the owner (`user_id`).
- **Storage**: Objects in the `avatars` bucket can only be modified if the folder name matches the user's ID.

---

## Integration with Frontend

The frontend interacts with the backend using the `@supabase/supabase-js` client, with auto-generated TypeScript types found in `src/integrations/supabase/types.ts`.
