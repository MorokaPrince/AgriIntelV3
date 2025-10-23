# AgriIntel V3 - Vercel Deployment Guide

## 🚀 Quick Deployment

1. **Connect to Vercel**
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all required variables from `.env.example`

3. **Deploy**
   ```bash
   vercel --prod
   ```

## 📋 Prerequisites

- Vercel CLI installed: `npm i -g vercel`
- GitHub repository connected to Vercel
- MongoDB Atlas cluster ready
- All required API keys obtained

## 🔧 Environment Variables Setup

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `DB_NAME` | Database name | `AgriIntelV3` |
| `NEXTAUTH_URL` | Production URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | JWT secret (32+ chars) | `your-super-secret-jwt-key-here` |

### API Keys (Required for full functionality)

| Variable | Description | How to get |
|----------|-------------|------------|
| `GOOGLE_MAPS_API_KEY` | Google Maps integration | Google Cloud Console |
| `WEATHER_API_KEY` | Weather data | OpenWeatherMap API |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RFID_BAUD_RATE` | RFID reader speed | `9600` |
| `RFID_TIMEOUT` | RFID timeout (ms) | `5000` |
| `BCRYPT_ROUNDS` | Password hashing | `12` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |

## ⚙️ Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "next.config.ts",
      "use": "@vercel/next",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"]
}
```

### next.config.ts Optimizations
- **Standalone output** for optimal serverless deployment
- **Image optimization** with Vercel storage support
- **Security headers** for production
- **Bundle optimization** for faster cold starts

## 🚀 Deployment Steps

### 1. Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project (if not already linked)
vercel link
```

### 2. Environment Variables
```bash
# Set environment variables
vercel env add MONGODB_URI production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
# ... add other variables
```

### 3. Deploy
```bash
# Deploy to production
vercel --prod

# Or deploy with specific settings
vercel --prod --regions iad1
```

### 4. Domain Setup (Optional)
```bash
# Add custom domain
vercel domains add yourdomain.com

# Set as primary
vercel domains ls
vercel domains buy yourdomain.com
```

## 🔍 Deployment Checklist

### Pre-deployment
- [ ] All environment variables set in Vercel dashboard
- [ ] MongoDB Atlas allows all IPs (0.0.0.0/0) or add Vercel IPs
- [ ] Database seeded with initial data (if needed)
- [ ] API keys are valid and have sufficient quotas
- [ ] Git repository is up to date

### Post-deployment
- [ ] Application loads without errors
- [ ] Database connection works
- [ ] Authentication flow functions
- [ ] API endpoints respond correctly
- [ ] Static assets load properly
- [ ] Environment variables are accessible

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check MongoDB connection
vercel logs --follow

# Verify environment variables
vercel env ls
```

#### Build Failures
- Ensure Node.js version compatibility (18.x+)
- Check for missing dependencies
- Verify API keys are valid

#### Function Timeouts
- API functions have 30s timeout limit
- Optimize database queries
- Use connection pooling properly

### Performance Optimization

#### Cold Start Optimization
- Keep function bundle size small
- Use proper code splitting
- Optimize dependencies

#### Database Performance
- Use indexes on frequently queried fields
- Implement connection caching
- Optimize query performance

## 🔒 Security Considerations

### Production Security
- [ ] Use strong NEXTAUTH_SECRET (32+ characters)
- [ ] Set MongoDB Atlas IP whitelist appropriately
- [ ] Enable 2FA on external services
- [ ] Use different credentials for production
- [ ] Regularly rotate API keys

### Environment Variables
- [ ] Never commit `.env.local` to git
- [ ] Use different values for development/production
- [ ] Regularly audit environment variable access

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor function performance
- Track error rates

### Logs
```bash
# View real-time logs
vercel logs --follow

# View specific function logs
vercel logs [deployment-url]

# View historical logs
vercel logs --since 1h
```

## 🔄 CI/CD Pipeline

### Automatic Deployments
1. Connect GitHub repository to Vercel
2. Enable automatic deployments on push to main
3. Set up preview deployments for pull requests

### Manual Deployments
```bash
# Deploy specific branch
vercel --prod

# Deploy with environment promotion
vercel promote [deployment-url] production
```

## 📞 Support

### Getting Help
- Check Vercel Dashboard for deployment status
- Review function logs for errors
- Test API endpoints locally first
- Verify environment variables are set correctly

### Common Commands
```bash
# Check deployment status
vercel ls

# View deployment details
vercel inspect [deployment-url]

# Rollback deployment
vercel rollback [deployment-url]

# Remove deployment
vercel remove [deployment-url]
```

## 🎯 Next Steps

1. **Set up monitoring** with error tracking
2. **Configure custom domain** for production
3. **Set up database backups** in MongoDB Atlas
4. **Configure CDN** for global performance
5. **Set up SSL certificate** (automatic with Vercel)

---

**Note**: This deployment guide is specific to AgriIntel V3. For general Next.js deployment questions, refer to [Vercel documentation](https://vercel.com/docs).