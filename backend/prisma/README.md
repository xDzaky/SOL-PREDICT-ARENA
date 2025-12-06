# Database Migrations & Seeding

Quick reference guide for database operations.

## 🚀 Quick Start

### First Time Setup
```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env and set DATABASE_URL

# 3. Initialize database
pnpm run db:init
```

This will:
- Create all tables
- Run migrations
- Seed with demo data

## 📋 Common Commands

### Development

```bash
# Create and apply migration
pnpm run db:migrate

# Create migration without applying
pnpm run db:migrate:create -- --name add_new_field

# Seed database with demo data
pnpm run db:seed

# Reset database (⚠️ deletes all data)
pnpm run db:migrate:reset

# Open Prisma Studio (GUI)
pnpm run db:studio

# Clear data only (keep schema)
pnpm run db:clear
```

### Production

```bash
# Deploy migrations (no prompts)
pnpm run db:migrate:deploy

# Check migration status
pnpm run db:migrate:status

# Generate Prisma Client
pnpm run db:generate

# Create backup
pnpm run db:backup
```

### Schema Management

```bash
# Validate schema
pnpm run db:validate

# Format schema file
pnpm run db:format

# Pull schema from database
pnpm run db:pull

# Push schema without migration
pnpm run db:push
```

## 📊 What Gets Seeded

The seed script creates:

| Entity | Count | Description |
|--------|-------|-------------|
| **Seasons** | 1 | Active Season 1: Genesis |
| **Players** | 11 | Sample players with stats |
| **Matches** | 10 | Various game types |
| **Leaderboard** | 10 | Ranked entries |
| **Daily Challenge** | 1 | Active challenge for today |
| **Daily Attempts** | 3 | Sample attempts |
| **Analytics** | 1 | Today's snapshot |

### Sample Players

1. **SolWhale** - Level 12, 45W/15L, 15000 XP
2. **CryptoNinja** - Level 10, 38W/22L, 12000 XP
3. **DiamondHands** - Level 8, 30W/20L, 9500 XP
4. **MoonBoy** - Level 7, 24W/26L, 7200 XP
5. **BullRunner** - Level 6, 20W/20L, 5800 XP
... and 6 more

## 🔧 Migration Workflow

### Creating a New Migration

1. **Edit schema.prisma**
   ```prisma
   model Player {
     // Add new field
     profilePicture String?
   }
   ```

2. **Create migration**
   ```bash
   pnpm run db:migrate -- --name add_profile_picture
   ```

3. **Prisma automatically:**
   - Generates SQL migration
   - Applies to database
   - Generates Prisma Client

4. **Commit both files:**
   ```bash
   git add prisma/schema.prisma
   git add prisma/migrations/YYYYMMDD_add_profile_picture
   git commit -m "feat: add profile picture field"
   ```

### Data Migration Example

If you need to transform data:

```typescript
// prisma/migrations/manual/transform-data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Your data transformation
  const players = await prisma.player.findMany();
  
  for (const player of players) {
    await prisma.player.update({
      where: { id: player.id },
      data: {
        // Transform data
        newField: calculateValue(player.oldField),
      },
    });
  }
}

main().finally(() => prisma.$disconnect());
```

Run with:
```bash
tsx prisma/migrations/manual/transform-data.ts
```

## 🚨 Emergency Procedures

### Rollback Last Migration

```bash
# Development: Delete migration folder and reset
rm -rf prisma/migrations/YYYYMMDD_last_migration
pnpm run db:migrate:reset

# Production: Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

### Database Not Responding

```bash
# Check connection
psql $DATABASE_URL -c "SELECT 1"

# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity"

# Kill long-running queries (if needed)
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes'"
```

### Schema Drift

If your database schema doesn't match Prisma schema:

```bash
# Pull current state from database
pnpm run db:pull

# Or push Prisma schema to database
pnpm run db:push
```

## 📚 Additional Resources

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Comprehensive guide
- [PRODUCTION_MIGRATION_CHECKLIST.md](./PRODUCTION_MIGRATION_CHECKLIST.md) - Production deployment checklist
- [Prisma Documentation](https://www.prisma.io/docs)

## ⚙️ Environment Variables

Required in `.env`:

```bash
# Database connection
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Optional: Shadow database for migrations (cloud DBs)
SHADOW_DATABASE_URL="postgresql://user:password@host:5432/shadow?schema=public"
```

## 🐛 Troubleshooting

### "Database schema is out of sync"

```bash
pnpm run db:generate
```

### "Migration has already been applied"

```bash
npx prisma migrate resolve --applied MIGRATION_NAME
```

### "Cannot connect to database"

1. Check DATABASE_URL is correct
2. Verify database is running
3. Check firewall/network access
4. Test connection: `psql $DATABASE_URL`

### "Prisma Client not generated"

```bash
pnpm run db:generate
```

## 📝 Best Practices

✅ **DO:**
- Test migrations on staging first
- Backup before production migrations
- Use descriptive migration names
- Keep migrations small and focused
- Review generated SQL
- Run `db:validate` before committing

❌ **DON'T:**
- Edit old migration files
- Skip migrations
- Deploy without testing
- Add NOT NULL without defaults
- Forget to generate Prisma Client

---

**Need help?** Check [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions.
