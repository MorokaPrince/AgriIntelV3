# 🚀 AgriIntel V3 - Deployment Checklist

## Phase 1: Pre-deployment Preparation

### ✅ Environment Setup
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Link project: `vercel link` (if not already linked)
- [ ] Ensure GitHub repository is connected to Vercel

### ✅ Database Configuration
- [ ] MongoDB Atlas cluster is created and running
- [ ] Database user has read/write permissions
- [ ] IP whitelist configured (allow 0.0.0.0/0 for Vercel or add Vercel IPs)
- [ ] Database connection string is ready
- [ ] Database seeded with initial data (if required)

### ✅ API Keys & Services
- [ ] Google Maps API key obtained and configured
- [ ] Weather API key obtained and configured
- [ ] All other required API keys are ready
- [ ] API quotas are sufficient for production use

### ✅ Environment Variables
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `DB_NAME` - Database name (AgriIntelV3)
- [ ] `NEXTAUTH_URL` - Production URL (https://your-app.vercel.app)
- [ ] `NEXTAUTH_SECRET` - Strong JWT secret (32+ characters)
- [ ] All optional variables reviewed and set if needed

## Phase 2: Code Optimization

### ✅ Build Configuration
- [ ] `vercel.json` file exists and is properly configured
- [ ] `next.config.ts` optimized for Vercel deployment
- [ ] Images configuration supports Vercel storage domains
- [ ] Bundle optimization settings are in place

### ✅ Database Connection
- [ ] MongoDB connection optimized for serverless environment
- [ ] Connection pooling configured for production
- [ ] Connection timeout settings appropriate for serverless
- [ ] Error handling implemented for connection failures

### ✅ API Routes
- [ ] All API routes have proper error handling
- [ ] Function timeouts are within Vercel limits (30s)
- [ ] Database queries are optimized
- [ ] Authentication middleware is working

## Phase 3: Deployment Process

### ✅ Pre-deployment Steps
```bash
# 1. Ensure you're in the project directory
cd agri-intel-v3

# 2. Check current deployment status
vercel ls

# 3. Pull latest changes
git pull origin main

# 4. Install dependencies
npm install

# 5. Test build locally
npm run build
```

### ✅ Environment Variables Setup
```bash
# Set production environment variables
vercel env add MONGODB_URI production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add DB_NAME production
# Add other required variables...
```

### ✅ Deploy to Production
```bash
# Deploy to production
vercel --prod

# Alternative: Deploy with specific region
vercel --prod --regions iad1
```

## Phase 4: Post-deployment Verification

### ✅ Application Testing
- [ ] Application loads without errors
- [ ] Homepage renders correctly
- [ ] Authentication flow works (login/logout)
- [ ] Dashboard loads properly
- [ ] API endpoints respond correctly
- [ ] Database connections are working
- [ ] Static assets (images, CSS, JS) load properly

### ✅ Database Verification
- [ ] MongoDB connection is established
- [ ] Data can be read from database
- [ ] Data can be written to database
- [ ] Multi-tenant connections work (if applicable)

### ✅ External Services
- [ ] Google Maps integration works
- [ ] Weather API calls succeed
- [ ] Email notifications work (if configured)
- [ ] File uploads work (if applicable)

### ✅ Performance & Security
- [ ] No console errors in production
- [ ] Security headers are present
- [ ] HTTPS is enforced
- [ ] Response times are acceptable

## Phase 5: Production Optimization

### ✅ Monitoring Setup
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring in place
- [ ] Log aggregation configured

### ✅ Domain & SSL
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate is active
- [ ] Domain points to correct Vercel deployment
- [ ] DNS records are properly set

### ✅ Backup & Recovery
- [ ] MongoDB Atlas backups configured
- [ ] Backup schedule is appropriate
- [ ] Recovery procedures documented
- [ ] Test restore process available

## 🚨 Emergency Rollback

If issues are found in production:

```bash
# 1. Check deployment history
vercel ls

# 2. Identify the last working deployment
vercel inspect [working-deployment-url]

# 3. Rollback to previous deployment
vercel rollback [working-deployment-url]

# 4. Verify rollback success
vercel ls
```

## 📞 Troubleshooting Commands

```bash
# Check real-time logs
vercel logs --follow

# View specific function logs
vercel logs [deployment-url]

# Check environment variables
vercel env ls

# View deployment details
vercel inspect [deployment-url]

# Test API endpoints
curl https://your-app.vercel.app/api/test
```

## ✅ Final Checklist

- [ ] All pre-deployment items completed
- [ ] Deployment successful
- [ ] All post-deployment tests passed
- [ ] Monitoring and alerting configured
- [ ] Team notified of deployment
- [ ] Documentation updated with production URLs
- [ ] Backup and rollback procedures verified

---

**Deployment completed successfully! 🎉**

**Production URL:** `https://your-app.vercel.app`
**Admin Email:** `admin@yourdomain.com`
**Support Contact:** `support@yourdomain.com`

*Remember to monitor the application for the first 24-48 hours after deployment for any issues.*