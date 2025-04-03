# Database Backup and Restore Guide

This document outlines the procedures for backing up and restoring the EventraAI database in both local development and production environments.

## Local Development Environment

### Backing Up the Local Database

#### Using Supabase CLI

The Supabase CLI provides a straightforward way to dump your local database:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Dump the database schema and data
npx supabase db dump -f backup.sql
```

#### Using pg_dump Directly

If you prefer to use PostgreSQL's native tools:

```bash
# Basic database dump (schema and data)
pg_dump postgresql://postgres:postgres@127.0.0.1:54322/postgres > backup.sql

# Schema-only backup
pg_dump postgresql://postgres:postgres@127.0.0.1:54322/postgres -s > schema_backup.sql

# Data-only backup
pg_dump postgresql://postgres:postgres@127.0.0.1:54322/postgres -a > data_backup.sql
```

### Restoring a Local Database

```bash
# Stop Supabase services
npx supabase stop

# Start Supabase with a clean database
npx supabase start

# Restore from backup
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < backup.sql

# Alternatively, use the Supabase CLI
npx supabase db reset
```

## Production Environment

### Backing Up Production Database

#### Method 1: Supabase Dashboard

1. Log in to the [Supabase Dashboard](https://app.supabase.io)
2. Select your project
3. Navigate to the "Database" section
4. Click on "Backups" in the sidebar
5. Click "Create backup" or download an existing backup

#### Method 2: Using the API

```bash
# Set your Supabase API key and project ID
export SUPABASE_KEY="your-service-role-key"
export PROJECT_REF="your-project-ref"

# Create a new backup
curl -X POST "https://api.supabase.io/v1/projects/$PROJECT_REF/database/backup" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json"
```

#### Method 3: Scheduled Backups

Production projects on paid plans have automatic daily backups with a retention period based on your plan:

- Pro: 7 days retention
- Team: 14 days retention
- Enterprise: 35 days retention

### Restoring Production Database

#### From Supabase Dashboard

1. Log in to the [Supabase Dashboard](https://app.supabase.io)
2. Select your project
3. Navigate to the "Database" section
4. Click on "Backups" in the sidebar
5. Find the backup you want to restore
6. Click "Restore" and confirm the action

#### Using Database Connection String

For a partial restore or specific data migration:

```bash
# Get your database connection string from the Supabase dashboard
export DB_URL="postgresql://postgres:password@db.xxxxxxxxxxxx.supabase.co:5432/postgres"

# Restore specific parts of the backup
psql $DB_URL < specific_data.sql
```

## Important Considerations

### Backup Frequency

- **Development**: Before significant schema changes
- **Staging**: Daily backups
- **Production**: Automated daily backups plus manual backups before major updates

### Security

- Store backup files securely
- Encrypt backups containing sensitive data
- Restrict access to backup files
- Never commit backup files to version control

### Backup Verification

Always verify your backups to ensure they can be restored:

```bash
# Create a test database
createdb test_restore

# Restore the backup
psql -d test_restore < backup.sql

# Verify the data
psql -d test_restore -c "SELECT COUNT(*) FROM users;"
```

### Recommended Backup Strategy

1. Automated daily backups in production
2. Manual backups before major deployments
3. Test restores on a staging environment quarterly
4. Document any changes to the backup/restore process

## Disaster Recovery

In case of data loss or corruption:

1. Identify the most recent viable backup
2. Create a staging environment 
3. Restore the backup to staging and verify data
4. Plan the production restoration during a maintenance window
5. Execute the restoration plan
6. Verify application functionality after restore

## Troubleshooting

### Common Issues

#### Backup Fails with Permission Error

```
ERROR: permission denied for schema public
```

Solution: Ensure your database user has appropriate permissions.

#### Restore Fails with Relation Already Exists

```
ERROR: relation "users" already exists
```

Solution: Drop the existing database before restore or use `--clean` option with pg_restore.

#### Backup File is Too Large

For very large databases, split the backup into schema and data:

```bash
# Backup schema
pg_dump -s postgresql://user:pass@host:port/dbname > schema.sql

# Backup data in compressed format
pg_dump -a -F c postgresql://user:pass@host:port/dbname > data.backup
```

## Further Reading

- [Supabase Backup Documentation](https://supabase.io/docs/guides/database/backups)
- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [Database Migration Guide](https://supabase.io/docs/guides/database/migrations) 