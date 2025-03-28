# EventraAI

## Setup with Supabase

This application uses Supabase for database storage. You can use either a cloud Supabase project or a local Supabase instance.

### Option 1: Local Supabase Setup (Recommended for Development)

1. Install Supabase CLI (if not already installed):
   ```
   npm install -g supabase
   ```

2. Initialize and start local Supabase:
   ```
   supabase init
   supabase start
   ```

   If you encounter port conflicts, edit `supabase/config.toml` to change the ports.

3. Apply database migrations:
   ```
   run-with-supabase.cmd migrations
   ```
   
   This will create all the necessary tables in your local Supabase instance.

4. Reset database (if needed):
   ```
   run-with-supabase.cmd reset
   ```
   
   This will reset the database and reapply all migrations and seed data.

5. Use the provided script to run the application with local Supabase:
   ```
   run-with-supabase.cmd
   ```
   
   The script already contains the connection details for the local Supabase instance.

   Alternatively, you can use:
   ```
   npm run dev:win
   ```

### Option 2: Cloud Supabase Setup

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Apply migrations to your cloud project:
   - Get the connection details from the Supabase dashboard
   - Create a `.env` file with your credentials
   - Run `supabase migration up` or apply the SQL manually

4. Get your database connection details:
   - Go to Project Settings > Database
   - Find your connection string under "Connection Pooling"
   - It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`
5. Get your Supabase API keys:
   - Go to Project Settings > API
   - Copy your project URL and anon/public key
6. Create a `.env` file based on the `.env.example` template:
   ```
   DATABASE_URL=your_supabase_postgres_connection_string
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   PORT=4000
   ```
7. Alternatively, edit the `run-with-supabase.cmd` script with your credentials

## Database Schema

The application uses the following tables:

- `users` - User accounts and authentication
- `events` - Event information
- `tasks` - Tasks for event planning
- `guests` - Guest list for events
- `vendors` - Service providers for events
- `event_vendors` - Relationship between events and vendors
- `planning_tips` - Tips for event planning
- `user_preferences` - User settings and preferences
- `event_analytics` - Analytics data for events
- `attendee_feedback` - Feedback from event attendees
- `subscription_plans` - Available subscription tiers
- `transactions` - Payment records

## Running the Application

There are two ways to run the application:

1. Using the convenience script (recommended):
   ```
   run-with-supabase.cmd
   ```
   This automatically sets the required environment variables including the PORT (4000).

2. Using npm scripts directly:
   - For Windows:
     ```
     npm run dev:win
     ```
   - For Mac/Linux:
     ```
     npm run dev
     ```

   - Make sure you have a `.env` file in the root directory with the following variables:
     ```
     DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54328/postgres
     SUPABASE_URL=http://127.0.0.1:54331
     SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
     OPENAI_API_KEY=your_openai_api_key
     PORT=4000
     ```

## Accessing the Application

Once the application is running, you can access it at:

```
http://localhost:4000
```

The API health check endpoint is available at:

```
http://localhost:4000/api/health
```

## Accessing Supabase Studio

When running local Supabase, you can access the Studio interface at:

```
http://127.0.0.1:54333
```

This provides a web interface for:
- Viewing and editing database tables
- Managing authentication
- Testing SQL queries
- Monitoring storage
- Viewing logs 