# Production Migration Checklist

## 🚀 Pre-Deployment Checklist

### 1. Environment Verification
- [ ] Confirm DATABASE_URL is set correctly
- [ ] Verify database credentials and permissions
- [ ] Check database connection from deployment environment
- [ ] Ensure sufficient database storage space
- [ ] Verify database backup retention policy

### 2. Code Review
- [ ] Review migration SQL files
- [ ] Check for destructive operations (DROP, ALTER)
- [ ] Verify foreign key constraints
- [ ] Review index additions (may be slow on large tables)
- [ ] Confirm Prisma schema matches migration intent

### 3. Testing
- [ ] Run migrations on local environment ✅
- [ ] Test migrations on staging environment
- [ ] Run integration tests on staging
- [ ] Verify seed data works correctly
- [ ] Test rollback procedure on staging
- [ ] Performance test migrations on staging (if large dataset)

### 4. Backup Strategy
- [ ] Create full database backup
  ```bash
  pg_dump -h prod-host -U user -d database > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- [ ] Verify backup file size and integrity
- [ ] Store backup in secure location
- [ ] Document backup location and timestamp
- [ ] Test backup restoration process (on staging)

### 5. Communication
- [ ] Notify team of upcoming deployment
- [ ] Schedule maintenance window (if needed)
- [ ] Prepare rollback communication plan
- [ ] Update status page (if applicable)
- [ ] Inform stakeholders of expected downtime

---

## 📋 Deployment Checklist

### 6. Pre-Migration Steps
- [ ] Set maintenance mode (if applicable)
  ```bash
  export MAINTENANCE_MODE=true
  ```
- [ ] Monitor current database performance metrics
- [ ] Record current row counts for verification
  ```sql
  SELECT schemaname, tablename, n_live_tup 
  FROM pg_stat_user_tables 
  ORDER BY n_live_tup DESC;
  ```
- [ ] Stop non-critical background jobs
- [ ] Clear application cache (if applicable)

### 7. Migration Execution
- [ ] Navigate to project directory
  ```bash
  cd /path/to/backend
  ```
- [ ] Pull latest code
  ```bash
  git pull origin main
  ```
- [ ] Install dependencies
  ```bash
  pnpm install
  ```
- [ ] Run Prisma migration deploy
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Generate Prisma Client
  ```bash
  npx prisma generate
  ```
- [ ] Record migration completion time

### 8. Post-Migration Verification
- [ ] Check migration status
  ```bash
  npx prisma migrate status
  ```
- [ ] Verify table schema matches expectations
  ```bash
  npx prisma db pull --print
  ```
- [ ] Run data integrity checks
  ```sql
  -- Check for null values in required fields
  SELECT COUNT(*) FROM players WHERE wallet_address IS NULL;
  
  -- Verify foreign key integrity
  SELECT COUNT(*) FROM matches m 
  WHERE NOT EXISTS (SELECT 1 FROM players p WHERE p.id = m.player1_id);
  ```
- [ ] Compare row counts pre/post migration
- [ ] Test critical database queries
- [ ] Check database indexes are created
  ```sql
  SELECT tablename, indexname FROM pg_indexes 
  WHERE schemaname = 'public' 
  ORDER BY tablename, indexname;
  ```

### 9. Application Deployment
- [ ] Build application
  ```bash
  pnpm run build
  ```
- [ ] Run application smoke tests
- [ ] Deploy to production
- [ ] Restart application services
- [ ] Monitor application startup logs
- [ ] Verify health check endpoint
  ```bash
  curl https://api.prod.com/health
  ```

### 10. Functional Testing
- [ ] Test player creation
  ```bash
  curl -X POST https://api.prod.com/api/player/initialize \
    -H "Content-Type: application/json" \
    -d '{"walletAddress":"test..."}'
  ```
- [ ] Test leaderboard retrieval
  ```bash
  curl https://api.prod.com/api/leaderboard/global
  ```
- [ ] Test season endpoints
  ```bash
  curl https://api.prod.com/api/season/current
  ```
- [ ] Test daily challenge
  ```bash
  curl https://api.prod.com/api/challenge/daily
  ```
- [ ] Run critical path tests
- [ ] Verify WebSocket connections
- [ ] Test matchmaking flow (if applicable)

---

## 📊 Post-Deployment Checklist

### 11. Monitoring
- [ ] Monitor error rates in logs
- [ ] Check database CPU/memory usage
- [ ] Monitor query performance
  ```sql
  SELECT query, calls, mean_exec_time, max_exec_time
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;
  ```
- [ ] Watch for connection pool exhaustion
- [ ] Monitor API response times
- [ ] Check application metrics dashboard

### 12. Performance Validation
- [ ] Verify query performance hasn't degraded
- [ ] Check index usage
  ```sql
  SELECT schemaname, tablename, indexname, idx_scan
  FROM pg_stat_user_indexes
  ORDER BY idx_scan DESC;
  ```
- [ ] Monitor slow query log
- [ ] Validate cache hit rates (if using Redis)
- [ ] Check connection pool utilization

### 13. Data Validation
- [ ] Spot-check critical data
- [ ] Verify leaderboard rankings are correct
- [ ] Confirm player stats are accurate
- [ ] Check match history integrity
- [ ] Validate season data
- [ ] Verify daily challenge is active

### 14. Cleanup
- [ ] Remove maintenance mode
  ```bash
  unset MAINTENANCE_MODE
  ```
- [ ] Resume background jobs
- [ ] Clear old logs (if needed)
- [ ] Archive old backups (keep recent ones)
- [ ] Update deployment documentation

### 15. Communication
- [ ] Notify team of successful deployment
- [ ] Update status page (deployment complete)
- [ ] Document any issues encountered
- [ ] Update CHANGELOG.md
- [ ] Post deployment summary in team channel

---

## 🚨 Rollback Checklist

### If Issues Occur

- [ ] **Step 1: Assess the Issue**
  - Determine severity (critical data loss vs minor bug)
  - Check if issue is migration-related
  - Review error logs and metrics

- [ ] **Step 2: Stop the Bleeding**
  - Set maintenance mode immediately
  - Stop application if data corruption risk
  - Alert team of rollback decision

- [ ] **Step 3: Restore Database**
  ```bash
  # Restore from backup
  psql -h prod-host -U user -d database < backup_YYYYMMDD_HHMMSS.sql
  ```

- [ ] **Step 4: Rollback Code**
  ```bash
  # Revert to previous commit
  git checkout <previous-commit>
  git push origin main --force  # Use with caution!
  ```

- [ ] **Step 5: Redeploy Previous Version**
  - Deploy last known good version
  - Restart application services
  - Verify health checks pass

- [ ] **Step 6: Verify Rollback**
  - Test critical functionality
  - Check data integrity
  - Monitor error rates
  - Confirm application stability

- [ ] **Step 7: Communicate**
  - Notify team of rollback completion
  - Document root cause
  - Plan remediation steps
  - Schedule post-mortem

---

## 📝 Migration Record Template

```
Date: YYYY-MM-DD HH:MM
Migration: <migration_name>
Environment: Production
Performed by: <name>

Pre-Migration State:
- Database size: XX GB
- Row counts: players=XX, matches=XX
- Backup location: s3://backups/YYYYMMDD_HHMMSS.sql
- Backup size: XX GB

Migration Execution:
- Start time: HH:MM
- End time: HH:MM
- Duration: X minutes
- Downtime: X minutes (if any)

Post-Migration State:
- Migration status: Success/Failed
- Row counts: players=XX, matches=XX
- New indexes: <list>
- Performance impact: None/Minor/Significant

Issues Encountered:
- <none or list issues>

Resolution:
- <how issues were resolved>

Verification:
- ✅ Health check passed
- ✅ Critical endpoints working
- ✅ Data integrity confirmed
- ✅ Performance acceptable

Notes:
- <any additional notes>
```

---

## 🔧 Quick Commands Reference

```bash
# Backup
pg_dump -h host -U user -d db > backup.sql

# Restore
psql -h host -U user -d db < backup.sql

# Migration
npx prisma migrate deploy

# Status
npx prisma migrate status

# Generate Client
npx prisma generate

# Seed
npx prisma db seed

# Studio (GUI)
npx prisma studio

# Validate
npx prisma validate
```

---

**Remember:**
- ✅ Always backup before migration
- ✅ Test on staging first
- ✅ Have rollback plan ready
- ✅ Monitor after deployment
- ✅ Document everything

---

**Last Updated:** December 6, 2025
**Version:** 1.0
