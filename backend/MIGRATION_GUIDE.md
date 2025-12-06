# Database Migration & Seeding Guide

## 📋 Table of Contents
1. [Initial Setup](#initial-setup)
2. [Migration Commands](#migration-commands)
3. [Seeding Database](#seeding-database)
4. [Schema Changes](#schema-changes)
5. [Rollback Strategy](#rollback-strategy)
6. [Production Checklist](#production-checklist)
7. [Troubleshooting](#troubleshooting)

---

## 1. Initial Setup

### Prerequisites
```bash
# Install dependencies
pnpm install

# Ensure DATABASE_URL is set in .env
DATABASE_URL="postgresql://user:password@localhost:5432/sol_predict_arena?schema=public"
```

### First Time Setup
```bash
# Generate Prisma Client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# Seed database
npx prisma db seed
```

---

## 2. Migration Commands

### Development Environment

```bash
# Create a new migration (auto-apply)
npx prisma migrate dev --name <migration_name>

# Example: Add new column
npx prisma migrate dev --name add_user_bio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Apply migrations without prompts
npx prisma migrate dev --skip-generate
```

### Production Environment

```bash
# Deploy migrations (no seed, no prompts)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Generate Prisma Client only
npx prisma generate
```

### Useful Commands

```bash
# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Open Prisma Studio (GUI)
npx prisma studio

# Create migration without applying
npx prisma migrate dev --create-only --name <migration_name>
```

---

## 3. Seeding Database

### Run Seed Script

```bash
# Run seed script
npx prisma db seed

# Or use package.json script
pnpm run seed

# Seed specific environment
NODE_ENV=development npx prisma db seed
```

### Seed Script Configuration

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  },
  "scripts": {
    "seed": "npx prisma db seed"
  }
}
```

### What Gets Seeded

The seed script creates:
- ✅ **1 Active Season** - "Season 1: Genesis"
- ✅ **11 Sample Players** - With varying stats and levels
- ✅ **10 Sample Matches** - Different game types and results
- ✅ **10 Leaderboard Entries** - Ranked by season points
- ✅ **1 Daily Challenge** - Active challenge for today
- ✅ **3 Daily Attempts** - Sample attempts from players
- ✅ **1 Analytics Snapshot** - Today's stats

---

## 4. Schema Changes

### Adding a New Column

```bash
# 1. Edit schema.prisma
# Add: profilePicture String?

# 2. Create migration
npx prisma migrate dev --name add_profile_picture

# 3. Migration file auto-generated in:
# prisma/migrations/YYYYMMDD_HHmmss_add_profile_picture/migration.sql
```

Example migration:
```sql
-- AlterTable
ALTER TABLE "players" ADD COLUMN "profile_picture" TEXT;
```

### Adding a New Table

```prisma
// schema.prisma
model Achievement {
  id          String   @id @default(uuid())
  playerId    String   @map("player_id")
  badgeType   Int      @map("badge_type")
  earnedAt    DateTime @default(now()) @map("earned_at")
  
  player Player @relation(fields: [playerId], references: [id])
  
  @@map("achievements")
}
```

```bash
# Create migration
npx prisma migrate dev --name add_achievements_table
```

### Modifying Existing Column

```sql
-- Change column type (requires data migration)
ALTER TABLE "players" ALTER COLUMN "xp" TYPE BIGINT;

-- Add NOT NULL constraint (ensure no nulls first!)
ALTER TABLE "players" ALTER COLUMN "username" SET NOT NULL;

-- Add default value
ALTER TABLE "players" ALTER COLUMN "avatar_url" SET DEFAULT 'https://avatar.default.com';
```

### Adding Indexes

```prisma
model Player {
  // ... existing fields
  
  @@index([username]) // Add index
  @@index([createdAt, level]) // Composite index
}
```

---

## 5. Rollback Strategy

### Development Rollback

```bash
# Option 1: Reset to specific migration
npx prisma migrate reset

# Option 2: Delete last migration folder
rm -rf prisma/migrations/YYYYMMDD_HHmmss_migration_name
npx prisma migrate dev

# Option 3: Full reset (deletes all data)
npx prisma migrate reset --skip-seed
```

### Production Rollback

⚠️ **CAUTION**: Production rollbacks are risky!

#### Step 1: Create Manual Backup
```bash
# PostgreSQL backup
pg_dump -h <host> -U <user> -d <database> > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore if needed
psql -h <host> -U <user> -d <database> < backup_YYYYMMDD_HHMMSS.sql
```

#### Step 2: Rollback Migration

```sql
-- Create rollback SQL manually
-- Example: If you added a column, remove it

-- prisma/migrations/YYYYMMDD_rollback_add_profile_picture/migration.sql
ALTER TABLE "players" DROP COLUMN "profile_picture";
```

```bash
# Apply rollback manually
psql -h <host> -U <user> -d <database> < rollback.sql

# Or use migration tool
npx prisma migrate resolve --rolled-back YYYYMMDD_add_profile_picture
```

#### Step 3: Update Schema

```bash
# Pull current DB state to schema
npx prisma db pull

# Generate new client
npx prisma generate
```

### Safe Migration Pattern (Production)

```bash
# 1. Test migration on staging first
npx prisma migrate deploy # on staging

# 2. Create backup
pg_dump production_db > backup_before_migration.sql

# 3. Deploy during low-traffic window
npx prisma migrate deploy # on production

# 4. Verify deployment
npx prisma migrate status

# 5. Test critical paths
curl https://api.prod.com/health
curl https://api.prod.com/api/leaderboard/global

# 6. Monitor for errors
# Check logs, error rates, database performance
```

---

## 6. Production Migration Checklist

### Pre-Migration

- [ ] **Backup Database**
  ```bash
  pg_dump -h prod-host -U user -d database > backup_$(date +%Y%m%d).sql
  ```

- [ ] **Test on Staging**
  - Apply migration to staging environment
  - Run integration tests
  - Verify data integrity

- [ ] **Review Migration SQL**
  ```bash
  cat prisma/migrations/YYYYMMDD_migration/migration.sql
  ```

- [ ] **Check for Breaking Changes**
  - Column removals
  - NOT NULL constraints
  - Data type changes

- [ ] **Estimate Downtime**
  - Small migrations: < 1 minute
  - Large tables: Use online migrations
  - Consider maintenance window

- [ ] **Notify Stakeholders**
  - Inform team of deployment
  - Schedule maintenance window if needed

### During Migration

- [ ] **Set Maintenance Mode** (if needed)
  ```bash
  # Set environment variable
  export MAINTENANCE_MODE=true
  ```

- [ ] **Deploy Migration**
  ```bash
  npx prisma migrate deploy
  ```

- [ ] **Verify Migration Status**
  ```bash
  npx prisma migrate status
  # Should show: Database schema is up to date!
  ```

- [ ] **Generate Prisma Client**
  ```bash
  npx prisma generate
  ```

- [ ] **Restart Application**
  ```bash
  # Railway auto-restarts
  # Or manual: pm2 restart app
  ```

### Post-Migration

- [ ] **Verify Data Integrity**
  ```sql
  -- Check row counts
  SELECT COUNT(*) FROM players;
  SELECT COUNT(*) FROM matches;
  
  -- Check for nulls in required fields
  SELECT COUNT(*) FROM players WHERE username IS NULL;
  ```

- [ ] **Run Smoke Tests**
  ```bash
  # Test critical endpoints
  curl https://api/health
  curl https://api/api/leaderboard/global
  curl https://api/api/season/current
  ```

- [ ] **Monitor Performance**
  - Check query performance
  - Monitor error rates
  - Watch database CPU/memory

- [ ] **Remove Maintenance Mode**
  ```bash
  unset MAINTENANCE_MODE
  ```

- [ ] **Document Migration**
  - Update CHANGELOG.md
  - Note any issues encountered
  - Document rollback if performed

---

## 7. Troubleshooting

### Common Issues

#### Issue: Migration Fails with Constraint Error

```
Error: Foreign key constraint violation
```

**Solution:**
```bash
# 1. Check which records violate constraint
# 2. Clean up orphaned records
# 3. Re-run migration

# Example: Remove orphaned matches
DELETE FROM matches WHERE player1_id NOT IN (SELECT id FROM players);
```

#### Issue: Prisma Client Out of Sync

```
Error: Prisma Client is not generated yet
```

**Solution:**
```bash
npx prisma generate
```

#### Issue: Migration Already Applied

```
Error: Migration has already been applied
```

**Solution:**
```bash
# Mark as resolved
npx prisma migrate resolve --applied YYYYMMDD_migration_name
```

#### Issue: Database Schema Drift

```
Error: Database schema is not in sync
```

**Solution:**
```bash
# Pull current DB state
npx prisma db pull

# Or reset to match schema
npx prisma migrate reset
```

#### Issue: Cannot Connect to Database

```
Error: Can't reach database server
```

**Solution:**
```bash
# 1. Check DATABASE_URL in .env
echo $DATABASE_URL

# 2. Test connection
psql $DATABASE_URL

# 3. Check firewall/network
ping database-host

# 4. Verify credentials
```

### Debug Mode

```bash
# Enable Prisma debug logs
DEBUG=prisma:* npx prisma migrate dev

# Enable SQL query logs
DATABASE_URL="postgresql://...?connect_timeout=10&pool_timeout=10&statement_timeout=10000"
```

---

## 8. Migration Scripts

### Custom Migration Scripts

Create `prisma/migrations/manual/` for complex migrations:

#### Data Migration Example

```typescript
// prisma/migrations/manual/migrate-player-stats.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migratePlayerStats() {
  console.log('Starting player stats migration...');
  
  const players = await prisma.player.findMany();
  
  for (const player of players) {
    const winRate = player.totalMatches > 0
      ? (player.wins / player.totalMatches) * 100
      : 0;
    
    await prisma.player.update({
      where: { id: player.id },
      data: {
        // Calculate and update new field
        calculatedWinRate: winRate,
      },
    });
  }
  
  console.log(`Migrated ${players.length} players`);
}

migratePlayerStats()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
```

Run with:
```bash
ts-node prisma/migrations/manual/migrate-player-stats.ts
```

---

## 9. CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: npx prisma migrate deploy
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Build application
        run: pnpm run build
      
      - name: Deploy to Railway
        run: railway up
```

---

## 10. Best Practices

### DO ✅

- **Always backup before migrations**
- **Test migrations on staging first**
- **Use descriptive migration names**
- **Review generated SQL before applying**
- **Keep migrations small and focused**
- **Document breaking changes**
- **Use transactions for data migrations**
- **Monitor database after migration**

### DON'T ❌

- **Don't skip migrations**
- **Don't edit old migration files**
- **Don't ignore migration errors**
- **Don't deploy without testing**
- **Don't remove columns without data migration**
- **Don't add NOT NULL without defaults**
- **Don't run multiple migrations simultaneously**
- **Don't forget to update Prisma Client**

---

## 11. Quick Reference

### Most Used Commands

```bash
# Development
npx prisma migrate dev         # Create and apply migration
npx prisma db seed             # Seed database
npx prisma studio              # Open GUI
npx prisma migrate reset       # Reset database

# Production
npx prisma migrate deploy      # Apply migrations
npx prisma generate            # Generate client
npx prisma migrate status      # Check status

# Debugging
npx prisma validate            # Validate schema
npx prisma format              # Format schema
DEBUG=prisma:* npx prisma...   # Debug mode
```

### Environment Variables

```bash
# .env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
SHADOW_DATABASE_URL="postgresql://user:pass@host:5432/shadow"  # Optional for cloud DBs
```

---

**Last Updated:** December 6, 2025
**Version:** 1.0
**Maintainer:** SOL Predict Arena Team
